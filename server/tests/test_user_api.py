import pytest
from app.models.user import User

def test_get_user_success(client, test_user):
    """测试成功获取用户信息"""
    response = client.get(f'/api/user?username={test_user.username}')
    assert response.status_code == 200
    
    data = response.get_json()
    assert data['username'] == test_user.username
    assert data['role'] == test_user.role
    assert data['password_hash'] == test_user.password_hash
    
def test_get_user_not_found(client):
    """测试查询不存在的用户"""
    response = client.get('/api/user?username=nonexistent')
    assert response.status_code == 200
    assert response.get_json() == {}
    
def test_get_user_missing_username(client):
    """测试缺少username参数"""
    response = client.get('/api/user')
    assert response.status_code == 400
    assert 'error' in response.get_json()
