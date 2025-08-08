from django.contrib.auth import get_user_model
from factory.django import DjangoModelFactory


class UserFactory(DjangoModelFactory):
    username = "sample@example.com"
    email = "sample@example.com"

    class Meta:
        model = get_user_model()
