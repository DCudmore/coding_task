from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import Item
from .serializers import ItemSerializer

class ItemPagination(PageNumberPagination):
    page_size = 10

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    pagination_class = ItemPagination