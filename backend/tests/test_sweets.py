import pytest

pytest.skip("Legacy test file - tests moved to test_seeds.py",
            allow_module_level=True)


def test_get_all_sweets(client, user_token, test_sweet):
    """Test getting all sweets"""
    response = client.get(
        "/api/seeds",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(sweet["name"] == "Chocolate Bar" for sweet in data)


def test_get_sweets_requires_auth(client):
    """Test that getting sweets requires authentication"""
    response = client.get("/api/seeds")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_search_sweets_by_name(client, user_token, test_seed):
    """Test searching sweets by name"""
    response = client.get(
        "/api/seeds/search?name=sample",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "chocolate" in data[0]["name"].lower()


def test_search_sweets_by_category(client, user_token, test_seed):
    """Test searching sweets by category"""
    response = client.get(
        "/api/seeds/search?category=sample",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["category"].lower() == "chocolate"


def test_search_sweets_by_price_range(client, user_token, test_seed):
    """Test searching sweets by price range"""
    response = client.get(
        "/api/seeds/search?minPrice=2&maxPrice=3",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    for sweet in data:
        assert 2 <= sweet["price"] <= 3


def test_update_sweet(client, user_token, test_seed):
    """Test updating a sweet"""
    response = client.put(
        f"/api/seeds/{test_seed.id}",
        json={
            "name": "Updated Chocolate Bar",
            "price": 3.00
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Chocolate Bar"
    assert data["price"] == 3.00


def test_delete_sweet_as_admin(client, admin_token, test_seed):
    """Test deleting a sweet as admin"""
    response = client.delete(
        f"/api/seeds/{test_seed.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify sweet is deleted
    get_response = client.get(
        f"/api/seeds/{test_seed.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_sweet_as_user(client, user_token, test_seed):
    """Test that regular users cannot delete sweets"""
    response = client.delete(
        f"/api/seeds/{test_seed.id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
