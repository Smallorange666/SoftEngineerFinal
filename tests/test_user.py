import pytest
from app.models import User
from app import db

@pytest.fixture
def test_admin(app):
    user = User(
        username='admin',
        password='admin123',
        role='Admin'
    )
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def test_user(app):
    user = User(
        username='user',
        password='user123',
        role='User'
    )
    db.session.add(user)
    db.session.commit()
    return user

def test_create_user(client):
    """测试创建新用户"""
    data = {
        'username': 'testuser',
        'password': 'test123',
        'role': 'User'
    }
    response = client.post('/api/users', json=data)
    assert response.status_code == 201
    result = response.get_json()
    assert result['username'] == 'testuser'
    assert result['role'] == 'User'

def test_create_duplicate_username(client, test_user):
    """测试创建重复用户名"""
    data = {
        'username': 'user',
        'password': 'test123',
        'role': 'User'
    }
    response = client.post('/api/users', json=data)
    assert response.status_code == 400
    assert 'already exists' in response.get_json()['error']

def test_login_success(client, test_user):
    """测试登录成功"""
    data = {
        'username': 'user',
        'password': 'user123'
    }
    response = client.post('/api/users/login', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['user']['username'] == 'user'
    assert 'Login successful' in result['message']

def test_login_failure(client):
    """测试登录失败"""
    data = {
        'username': 'nonexistent',
        'password': 'wrong'
    }
    response = client.post('/api/users/login', json=data)
    assert response.status_code == 401
    assert 'Invalid username or password' in response.get_json()['error']

def test_update_user(client, test_user):
    """测试更新用户信息"""
    data = {
        'password': 'newpassword123'
    }
    response = client.put(f'/api/users/{test_user.user_id}', json=data)
    assert response.status_code == 200 