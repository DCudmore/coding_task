from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import Item
from .serializers import ItemSerializer

class ItemPagination(PageNumberPagination):
    """
    Custom pagination class for Item objects.

    Sets a default page size of 10 items per page.
    """
    page_size = 10

class ItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Item objects to be viewed or edited.

    Provides full CRUD (Create, Retrieve, Update, Delete) operations
    for Item resources.
    """
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    pagination_class = ItemPagination