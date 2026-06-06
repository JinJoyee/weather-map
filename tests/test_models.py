from app.models.user import User
from app.models.custom_route import CustomRoute
from app.models.context_waypoint import ContextWaypoint


def test_user_model_has_required_columns():
    assert hasattr(User, 'id')
    assert hasattr(User, 'username')
    assert hasattr(User, 'password')
    assert hasattr(User, 'created_at')


def test_custom_route_model_has_required_columns():
    assert hasattr(CustomRoute, 'id')
    assert hasattr(CustomRoute, 'user_id')
    assert hasattr(CustomRoute, 'name')
    assert hasattr(CustomRoute, 'start_lat')
    assert hasattr(CustomRoute, 'end_lat')


def test_context_waypoint_model_has_required_columns():
    assert hasattr(ContextWaypoint, 'id')
    assert hasattr(ContextWaypoint, 'lat')
    assert hasattr(ContextWaypoint, 'lng')
    assert hasattr(ContextWaypoint, 'label')
    assert hasattr(ContextWaypoint, 'type')
