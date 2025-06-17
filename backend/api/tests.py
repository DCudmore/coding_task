# backend/api/tests.py
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Item

# --- Model Tests ---
class ItemModelTest(TestCase):
    """
    Tests for the Item model, specifically its unique_together constraint.
    """

    def setUp(self):
        """Set up non-modified objects for every test method."""
        Item.objects.create(name='Test Item 1', group=Item.Group.PRIMARY)

    def test_unique_together_constraint(self):
        """
        Ensure that an item with the same name and group cannot be created.
        """
        # Attempt to create a duplicate item (same name, same group)
        with self.assertRaises(Exception) as cm:
            Item.objects.create(name='Test Item 1', group=Item.Group.PRIMARY)

        # Validate Error Type is IntegrityError.
        from django.db.utils import IntegrityError
        self.assertIsInstance(cm.exception, IntegrityError)
        # Check if the error message contains keywords indicating the unique constraint
        # Should be - UNIQUE constraint failed: api_item.name, api_item.group
        print(str(cm.exception))
        self.assertIn('unique constraint failed', str(cm.exception).lower())
        self.assertIn('api_item.name', str(cm.exception).lower()) # Check for table.column name
        self.assertIn('api_item.group', str(cm.exception).lower()) # Check for table.column name
        
    def test_unique_together_different_group(self):
        """
        Ensure that an item with the same name but a different group CAN be created.
        """
        item = Item.objects.create(name='Test Item 1', group=Item.Group.SECONDARY)
        self.assertIsNotNone(item.pk)

# --- API Tests ---
class ItemAPITest(APITestCase):
    """
    Tests for the Item API endpoints (CRUD operations).
    """

    def setUp(self):
        """
        Set up the test client and initial data for API tests.
        """
        self.list_url = reverse('item-list') 
        self.item1 = Item.objects.create(name='API Test Item 1', group=Item.Group.PRIMARY)
        self.item2 = Item.objects.create(name='API Test Item 2', group=Item.Group.SECONDARY)
        self.detail_url_item1 = reverse('item-detail', kwargs={'pk': self.item1.pk})
        self.detail_url_item2 = reverse('item-detail', kwargs={'pk': self.item2.pk})


    # --- GET (List and Retrieve) Tests ---

    def test_list_items(self):
        """
        Ensure we can retrieve a list of items with pagination.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(response.data['results'][0]['name'], 'API Test Item 1')
        self.assertEqual(response.data['results'][0]['group'], Item.Group.PRIMARY.value)

    def test_retrieve_single_item(self):
        """
        Ensure we can retrieve a single item by its ID.
        """
        response = self.client.get(self.detail_url_item1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'API Test Item 1')
        self.assertEqual(response.data['group'], Item.Group.PRIMARY.value)
        self.assertIn('created_at', response.data)
        self.assertIn('updated_at', response.data)

    def test_retrieve_non_existent_item(self):
        """
        Ensure retrieving a non-existent item returns 404 Not Found.
        """
        response = self.client.get(reverse('item-detail', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- POST (Create) Tests ---

    def test_create_item_success(self):
        """
        Ensure we can create a new item successfully.
        """
        data = {'name': 'New Test Item', 'group': Item.Group.SECONDARY.value}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Item.objects.count(), 3) # 2 from setup + 1 new
        self.assertEqual(response.data['name'], 'New Test Item')
        self.assertEqual(response.data['group'], Item.Group.SECONDARY.value)
        self.assertIn('id', response.data)
        self.assertIn('created_at', response.data)

    def test_create_item_duplicate_unique_together(self):
        """
        Ensure creating an item with duplicate name and group returns 400 Bad Request.
        """
        data = {'name': 'API Test Item 1', 'group': Item.Group.PRIMARY.value} # Duplicates item1
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Check for the expected default unique_together error message
        self.assertIn('non_field_errors', response.data)
        self.assertIn("The fields name, group must make a unique set.", str(response.data['non_field_errors'][0]))


    def test_create_item_invalid_data(self):
        """
        Ensure creating an item with missing required fields returns 400 Bad Request.
        """
        data = {'name': 'Missing Group Item'} # Missing 'group'
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('group', response.data) # Check that the 'group' field error is present

        data = {'group': Item.Group.PRIMARY.value} # Missing 'name'
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data) # Check that the 'name' field error is present

        data = {'name': 'Valid Name', 'group': 'InvalidGroupValue'} # Invalid group choice
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('group', response.data)
        self.assertIn('not a valid choice', str(response.data['group'][0]))

    # --- PATCH (Partial Update) Tests ---

    def test_partial_update_item_success(self):
        """
        Ensure we can partially update an item's name.
        """
        data = {'name': 'Updated Name for Item 1'}
        response = self.client.patch(self.detail_url_item1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item1.refresh_from_db() # Reload the object from DB to get updated value
        self.assertEqual(self.item1.name, 'Updated Name for Item 1')
        self.assertEqual(response.data['name'], 'Updated Name for Item 1')

    def test_partial_update_item_change_group(self):
        """
        Ensure we can partially update an item's group.
        """
        data = {'group': Item.Group.SECONDARY.value}
        response = self.client.patch(self.detail_url_item1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.group, Item.Group.SECONDARY.value)
        self.assertEqual(response.data['group'], Item.Group.SECONDARY.value)


    def test_partial_update_item_to_duplicate(self):
        """
        Ensure partial update that results in a duplicate unique_together combination fails.
        """
        # Try to change item1's name and group to match item2's existing combination
        data = {'name': self.item2.name, 'group': self.item2.group}
        response = self.client.patch(self.detail_url_item1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
        self.assertIn("The fields name, group must make a unique set.", str(response.data['non_field_errors'][0]))


    def test_partial_update_non_existent_item(self):
        """
        Ensure patching a non-existent item returns 404 Not Found.
        """
        data = {'name': 'Non Existent'}
        response = self.client.patch(reverse('item-detail', kwargs={'pk': 9999}), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # --- PUT (Full Update) Tests ---
    def test_full_update_item_success(self):
        """
        Ensure we can fully update an item.
        """
        data = {'name': 'Fully Updated Item', 'group': Item.Group.SECONDARY.value}
        response = self.client.put(self.detail_url_item1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item1.refresh_from_db()
        self.assertEqual(self.item1.name, 'Fully Updated Item')
        self.assertEqual(self.item1.group, Item.Group.SECONDARY.value)

    def test_full_update_item_missing_field(self):
        """
        Ensure full update fails if a required field is missing.
        (PUT requires all fields, unlike PATCH)
        """
        data = {'name': 'Missing Group for PUT'} # Missing 'group'
        response = self.client.put(self.detail_url_item1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('group', response.data)

    def test_full_update_item_to_duplicate(self):
        """
        Ensure full update that results in a duplicate unique_together combination fails.
        """
        # Try to change item1's name and group to match item2's existing combination
        data = {'name': self.item2.name, 'group': self.item2.group}
        response = self.client.put(self.detail_url_item1, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
        self.assertIn("The fields name, group must make a unique set.", str(response.data['non_field_errors'][0]))

    # --- DELETE Tests ---

    def test_delete_item_success(self):
        """
        Ensure we can delete an item successfully.
        """
        response = self.client.delete(self.detail_url_item1)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Item.objects.count(), 1) # One less item now (item2 remains)
        self.assertFalse(Item.objects.filter(pk=self.item1.pk).exists()) # Verify item1 is gone

    def test_delete_non_existent_item(self):
        """
        Ensure deleting a non-existent item returns 404 Not Found.
        """
        response = self.client.delete(reverse('item-detail', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)