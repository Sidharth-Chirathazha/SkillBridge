from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

"""Custom Pagination is configured here, Defalut page size and maximu allowed page size are configured along"""
class CustomPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  
    max_page_size = 100  # Maximum allowed page size

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,  # Total items
            'total_pages': self.page.paginator.num_pages,  # Total pages
            'current_page': self.page.number,  # Current page
            'next': self.get_next_link(),  # Next page URL
            'previous': self.get_previous_link(),  # Previous page URL
            'results': data  # Courses data
        })
    
class BlogPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 20