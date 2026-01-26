import uuid

import pytest
from httpx import AsyncClient

from app.models.fee_template import FeeTemplate

# Mark all tests in this file as asynchronous
pytestmark = pytest.mark.asyncio


async def test_create_fee_component_as_parent_fails(
    test_client_authenticated_parent: AsyncClient,
):
    """
    Tests that a user with a 'Parent' role receives a 403 Forbidden error
    when trying to create a fee component.
    """
    component_data = {
        "school_id": 1,
        "component_name": "Unauthorized Fee",
        "component_type": "Academic",
        "base_amount": 100.00,
    }

    # Use the overridden client
    client = test_client_authenticated_parent

    # The token is no longer needed in the header because authentication is mocked
    response = await client.post("/api/v1/finance/fee-components", json=component_data)

    # This assertion will now pass
    assert response.status_code == 403, "Parents should not be able to create fee components."


async def test_create_fee_component_as_admin_succeeds(test_client_authenticated_admin: AsyncClient, mock_admin_profile):
    """
    Tests that an admin can successfully create a fee component.
    """
    unique_component_name = f"Authorized Admin Fee {uuid.uuid4()}"

    component_data = {
        "school_id": mock_admin_profile.school_id,
        "component_name": unique_component_name,
        "component_type": "Service",
        "base_amount": 500.00,
    }

    # The token is no longer needed because the dependency is mocked
    # headers = {"Authorization": f"Bearer {admin_token}"}

    # Use the overridden client
    client = test_client_authenticated_admin

    response = await client.post("/api/v1/finance/fee-components", json=component_data)  # No headers needed now

    # This assertion will now pass because the request is treated as authenticated
    assert response.status_code == 201
    response_data = response.json()
    assert response_data["component_name"] == unique_component_name


async def test_get_fee_templates_isolates_by_school(test_client_authenticated_admin: AsyncClient, db_session, mock_admin_profile):
    """
    Tests that the GET endpoint for fee templates only returns data
    for the authenticated admin's school.
    """
    # Arrange: Create two complete templates with unique names for this test run.
    admin_school_template_name = f"Admin School Template {uuid.uuid4()}"
    other_school_template_name = f"Other School Template {uuid.uuid4()}"

    admin_school_template = FeeTemplate(school_id=mock_admin_profile.school_id, academic_year_id=1, name=admin_school_template_name, status="Active")
    db_session.add(admin_school_template)

    other_school_template = FeeTemplate(school_id=2, academic_year_id=1, name=other_school_template_name, status="Active")  # A different school ID
    db_session.add(other_school_template)
    await db_session.commit()

    # Act
    client = test_client_authenticated_admin
    response = await client.get(f"/api/v1/finance/fee-templates/school/{mock_admin_profile.school_id}")

    # Assert
    assert response.status_code == 200
    response_data = response.json()

    # --- FIX: More robust assertions ---
    # Instead of asserting a fixed length, we verify the content.

    # 1. Create a set of all the names returned in the response
    returned_names = {template["name"] for template in response_data}

    # 2. Assert that the template for the admin's school IS in the response
    assert admin_school_template_name in returned_names, "The template for the admin's school should be returned."

    # 3. Assert that the template for the other school IS NOT in the response
    assert other_school_template_name not in returned_names, "The template for the other school should NOT be returned."
