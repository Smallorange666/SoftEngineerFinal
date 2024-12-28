import pytest
from app import db
from app.models import Customer

def test_customer_creation(test_customer):
    """测试客户创建和所有属性"""
    assert test_customer.customer_id is not None
    assert test_customer.name == '张三'
    assert test_customer.phone == '13800138000'
    assert test_customer.address == '北京市海淀区'
    assert test_customer.id_card == '110101199001011234'
    assert test_customer.created_at is not None
    assert test_customer.updated_at is not None

def test_customer_to_dict(test_customer):
    """测试客户转字典功能"""
    customer_dict = test_customer.to_dict()
    assert customer_dict['customer_id'] == test_customer.customer_id
    assert customer_dict['name'] == '张三'
    assert customer_dict['phone'] == '13800138000'
    assert customer_dict['address'] == '北京市海淀区'
    assert customer_dict['id_card'] == '110101199001011234'

def test_get_customer_by_id(client, test_customer):
    """测试获取特定客户"""
    response = client.get(f'/api/customers/{test_customer.customer_id}')
    assert response.status_code == 200
    customer = response.get_json()
    assert customer['name'] == '张三'
    assert customer['phone'] == '13800138000'

def test_get_nonexistent_customer(client):
    """测试获取不存在的客户"""
    response = client.get('/api/customers/9999')
    assert response.status_code == 404

def test_create_customer_invalid_phone(client):
    """测试创建客户时使用无效的手机号"""
    data = {
        'name': '李四',
        'phone': '1234',  # 无效的手机号
        'address': '北京市朝阳区',
        'id_card': '110101199001011235'
    }
    response = client.post('/api/customers', json=data)
    assert response.status_code == 400
    assert 'Invalid phone number' in response.get_json()['error']

def test_create_customer_invalid_id_card(client):
    """测试创建客户时使用无效的身份证号"""
    data = {
        'name': '李四',
        'phone': '13900139000',
        'address': '北京市朝阳区',
        'id_card': '1234'  # 无效的身份证号
    }
    response = client.post('/api/customers', json=data)
    assert response.status_code == 400
    assert 'Invalid ID card' in response.get_json()['error']

def test_create_customer_duplicate_id_card(client, test_customer):
    """测试创建客户时使用重复的身份证号"""
    data = {
        'name': '李四',
        'phone': '13900139000',
        'address': '北京市朝阳区',
        'id_card': '110101199001011234'  # 使用已存在的身份证号
    }
    response = client.post('/api/customers', json=data)
    assert response.status_code == 400
    assert 'already exists' in response.get_json()['error']

def test_update_customer(client, test_customer):
    """测试更新客户信息"""
    data = {
        'phone': '13900139000',
        'address': '北京市朝阳区'
    }
    response = client.put(f'/api/customers/{test_customer.customer_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['phone'] == '13900139000'
    assert result['address'] == '北京市朝阳区'

def test_update_customer_invalid_phone(client, test_customer):
    """测试更新客户时使用无效的手机号"""
    data = {
        'phone': '1234'  # 无效的手机号
    }
    response = client.put(f'/api/customers/{test_customer.customer_id}', json=data)
    assert response.status_code == 400
    assert 'Invalid phone number' in response.get_json()['error']

def test_update_customer_duplicate_id_card(client, test_customer):
    """测试更新客户时使用重复的身份证号"""
    # 先创建另一个客户
    other_customer = Customer(
        name='王五',
        phone='13700137000',
        address='北京市西城区',
        id_card='110101199001011235'
    )
    db.session.add(other_customer)
    db.session.commit()

    # 尝试更新为已存在的身份证号
    data = {
        'id_card': '110101199001011235'
    }
    response = client.put(f'/api/customers/{test_customer.customer_id}', json=data)
    assert response.status_code == 400
    assert 'already exists' in response.get_json()['error']

def test_get_customer_rental_history(client, test_customer, test_rental):
    """测试获取客户租赁历史"""
    response = client.get(f'/api/customers/{test_customer.customer_id}/rentals')
    assert response.status_code == 200
    rentals = response.get_json()
    assert len(rentals) == 1
    assert rentals[0]['customer_id'] == test_customer.customer_id

def test_get_nonexistent_customer_rental_history(client):
    """测试获取不存在客户的租赁历史"""
    response = client.get('/api/customers/9999/rentals')
    assert response.status_code == 404 

def test_create_customer_missing_name(client):
    """测试创建客户时缺少名字"""
    data = {
        'phone': '13900139000',
        'address': '北京市朝阳区',
        'id_card': '110101199001011235'
    }
    response = client.post('/api/customers', json=data)
    assert response.status_code == 400
    assert 'Missing required field: name' in response.get_json()['error']

def test_update_customer_empty_data(client, test_customer):
    """测试更新客户时提供空数据"""
    data = {}
    response = client.put(f'/api/customers/{test_customer.customer_id}', json=data)
    assert response.status_code == 200  # 不修改任何字段也应该成功
    result = response.get_json()
    assert result['name'] == test_customer.name  # 验证数据未变化

def test_get_customer_rentals_empty(client, test_customer):
    """测试获取无租赁记录的客户历史"""
    response = client.get(f'/api/customers/{test_customer.customer_id}/rentals')
    assert response.status_code == 200
    rentals = response.get_json()
    assert len(rentals) == 0  # 应该返回空列表而不是错误

def test_create_customer_invalid_json(client):
    """测试创建客户时提供无效的JSON数据"""
    response = client.post('/api/customers', 
                         data='invalid json',
                         content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    assert data is not None
    assert 'error' in data

def test_update_customer_invalid_json(client, test_customer):
    """测试更新客户时提供无效的JSON数据"""
    response = client.put(f'/api/customers/{test_customer.customer_id}',
                         data='invalid json',
                         content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    assert data is not None
    assert 'error' in data
  