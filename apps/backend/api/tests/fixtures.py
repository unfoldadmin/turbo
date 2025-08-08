import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def regular_user(user_factory):
    return user_factory.create(is_active=False)
