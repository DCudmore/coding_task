# backend/api/serializers.py
from rest_framework import serializers
from .models import Item

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """
        Validates that an item with the given name and group does not already exist.

        Raises a ValidationError if a duplicate item is found, unless
        the validation is for an update of the existing instance.
        """
        # When updating an item, we need to exclude the current item from the uniqueness check.
        instance = self.instance # (None for creation)
        
        name = data.get('name', getattr(instance, 'name', None))
        group = data.get('group', getattr(instance, 'group', None))

        # Only perform the check if both name and group are present
        if name and group:
            queryset = Item.objects.filter(name=name, group=group)
            
            # If we are updating an existing item, exclude the current item from the check
            if instance:
                queryset = queryset.exclude(pk=instance.pk)

            if queryset.exists():
                raise serializers.ValidationError(
                    {"detail": f"An item named '{name}' already exists in the '{group}' group."}
                )
        return data