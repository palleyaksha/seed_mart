import pytest
from fastapi import status


def test_create_seed_as_admin(client, admin_token):
    """Test creating a seed as admin"""
    response = client.post(
        "/api/seeds",
        json={
            "name": "Gummy Bears",
            "category": "Gummies",
            "price": 1.50,
            "quantity": 50
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Gummy Bears"
    assert data["category"] == "Gummies"
    assert data["price"] == 1.50
    assert data["quantity"] == 50
    assert "id" in data


def test_create_seed_as_user(client, user_token):
    """Test that regular users cannot create seeds"""
    response = client.post(
        "/api/seeds",
        json={
            "name": "Gummy Bears",
            "category": "Gummies",
            "price": 1.50,
            "quantity": 50
        },
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_all_seeds(client, user_token, test_seed):
    """Test getting all seeds"""
    response = client.get(
        "/api/seeds",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert any(item["name"] == test_seed.name for item in data)


def test_get_seeds_requires_auth(client):
    """Test that getting seeds requires authentication"""
    response = client.get("/api/seeds")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_search_seeds_by_name(client, user_token, test_seed):
    """Test searching seeds by name"""
    response = client.get(
        "/api/seeds/search?name=sample",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "sample" in data[0]["name"].lower()


def test_search_seeds_by_category(client, user_token, test_seed):
    """Test searching seeds by category"""
    response = client.get(
        "/api/seeds/search?category=sample",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["category"].lower() == "sample"


def test_search_seeds_by_price_range(client, user_token, test_seed):
    """Test searching seeds by price range"""
    response = client.get(
        "/api/seeds/search?minPrice=2&maxPrice=3",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    for item in data:
        assert 2 <= item["price"] <= 3


def test_update_seed(client, user_token, test_seed):
    """Test updating a seed"""
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


def test_delete_seed_as_admin(client, admin_token, test_seed):
    """Test deleting a seed as admin"""
    response = client.delete(
        f"/api/seeds/{test_seed.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify seed is deleted
    get_response = client.get(
        f"/api/seeds/{test_seed.id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_seed_as_user(client, user_token, test_seed):
    """Test that regular users cannot delete seeds"""
    response = client.delete(
        f"/api/seeds/{test_seed.id}",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
