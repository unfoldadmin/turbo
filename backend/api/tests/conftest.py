from pytest_factoryboy import register

from api.tests.factories import UserFactory
from api.tests.fixtures import *  # noqa: F403

register(UserFactory)
