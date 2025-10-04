# backend/tests/test_exams.py
from fastapi.testclient import TestClient
from starlette import status

# You can keep your original service-layer test if you want,
# but let's focus on the endpoint test that was failing.


def test_create_exam_type_endpoint(client: TestClient):
    """
    Tests the POST /exam-types/ endpoint.
    """
    # Arrange: Define the request payload
    payload = {"school_id": 1, "type_name": "Mid-Term Assessment"}

    # Act: Make a POST request to the endpoint (no 'await' needed)
    response = client.post("/api/v1/exam-types/", json=payload)

    # Print response information
    print(f"\n{'='*60}")
    print(f"Response Status Code: {response.status_code}")
    print(f"{'='*60}")

    # Assert: Check the HTTP status code and the response body
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # Print the data variable in detail
    print("\n📊 Data Variable Contents:")
    print(f"{'-'*60}")
    for key, value in data.items():
        print(f"  {key:20s}: {value}")
    print(f"{'-'*60}")
    print(f"\n📦 Full data object: {data}")
    print(f"{'='*60}\n")

    assert data["type_name"] == "Mid-Term Assessment"
    assert data["school_id"] == 1
    assert "exam_type_id" in data

    # The database changes are automatically rolled back by the fixture.
