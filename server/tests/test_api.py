import pytest
from datetime import datetime
from app import db

# 车辆相关 API 测试
def test_get_vehicles(client, test_vehicle):
    """测试获取车辆列表"""
    response = client.get('/api/vehicles')
    assert response.status_code == 200
    data = response.get_json()
    assert len(data) == 1
    vehicle = data[0]
    assert vehicle['vehicle_id'] == test_vehicle.vehicle_id
    assert vehicle['type'] == 'SUV'
    assert vehicle['brand'] == 'Toyota'
    assert vehicle['model'] == 'RAV4'
    assert vehicle['color'] == '白色'
    assert float(vehicle['price_per_day']) == 300.00
    assert vehicle['status'] == '可租用'
    assert vehicle['plate_number'] == '测试车牌A123'

def test_create_vehicle(client):
    """测试创建新车辆"""
    data = {
        'type': '轿车',
        'brand': 'Honda',
        'model': 'Accord',
        'color': '黑色',
        'price_per_day': 250.00,
        'plate_number': '京C12345'
    }
    response = client.post('/api/vehicles', json=data)
    assert response.status_code == 201
    result = response.get_json()
    assert result['type'] == '轿车'
    assert result['brand'] == 'Honda'
    assert result['model'] == 'Accord'
    assert result['color'] == '黑色'
    assert float(result['price_per_day']) == 250.00
    assert result['status'] == '可租用'
    assert result['plate_number'] == '京C12345'

def test_get_vehicle_by_id(client, test_vehicle):
    """测试获取特定车辆"""
    response = client.get(f'/api/vehicles/{test_vehicle.vehicle_id}')
    assert response.status_code == 200
    vehicle = response.get_json()
    assert vehicle['vehicle_id'] == test_vehicle.vehicle_id
    assert vehicle['type'] == 'SUV'

def test_update_vehicle(client, test_vehicle):
    """测试更新车辆信息"""
    data = {
        'color': '红色',
        'price_per_day': 350.00
    }
    response = client.put(f'/api/vehicles/{test_vehicle.vehicle_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['color'] == '红色'
    assert float(result['price_per_day']) == 350.00

def test_delete_vehicle(client, test_vehicle):
    """测试删除车辆"""
    response = client.delete(f'/api/vehicles/{test_vehicle.vehicle_id}')
    assert response.status_code == 204

# 租赁相关 API 测试
def test_create_rental(client, test_vehicle, test_customer):
    """测试创建租赁订单"""
    data = {
        'vehicle_id': test_vehicle.vehicle_id,
        'customer_id': test_customer.customer_id,
        'duration_days': 5
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 201
    result = response.get_json()
    assert result['vehicle_id'] == test_vehicle.vehicle_id
    assert result['customer_id'] == test_customer.customer_id
    assert result['duration_days'] == 5
    assert result['status'] == '进行中'

def test_get_rental_by_id(client, test_rental):
    """测试获取租赁详情"""
    response = client.get(f'/api/rentals/{test_rental.rental_id}')
    assert response.status_code == 200
    rental = response.get_json()
    assert rental['rental_id'] == test_rental.rental_id
    assert rental['status'] == '进行中'

def test_update_rental(client, test_rental):
    """测试更新租赁信息"""
    data = {
        'status': '已完成'
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['status'] == '已完成'
    assert result['actual_return_time'] is not None

def test_get_customer_rentals(client, test_rental, test_customer):
    """测试获取客户租赁历史"""
    response = client.get(f'/api/rentals/customer/{test_customer.customer_id}')
    assert response.status_code == 200
    rentals = response.get_json()
    assert len(rentals) == 1
    assert rentals[0]['customer_id'] == test_customer.customer_id

# 客户相关 API 测试
def test_create_customer(client):
    """测试创建新客户"""
    data = {
        'name': '李四',
        'phone': '13900139000',
        'address': '北京市朝阳区',
        'id_card': '110101199001011235'
    }
    response = client.post('/api/customers', json=data)
    assert response.status_code == 201
    result = response.get_json()
    assert result['name'] == '李四'
    assert result['phone'] == '13900139000'

def test_get_customer_by_id(client, test_customer):
    """测试获取客户信息"""
    response = client.get(f'/api/customers/{test_customer.customer_id}')
    assert response.status_code == 200
    customer = response.get_json()
    assert customer['name'] == '张三'
    assert customer['phone'] == '13800138000'

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

def test_get_customer_rental_history(client, test_customer, test_rental):
    """测试获取客户租赁历史"""
    response = client.get(f'/api/customers/{test_customer.customer_id}/rentals')
    assert response.status_code == 200
    rentals = response.get_json()
    assert len(rentals) == 1
    assert rentals[0]['customer_id'] == test_customer.customer_id

# 错误情况测试
def test_get_nonexistent_vehicle(client):
    """测试获取不存在的车辆"""
    response = client.get('/api/vehicles/9999')
    assert response.status_code == 404

def test_get_nonexistent_customer(client):
    """测试获取不存在的客户"""
    response = client.get('/api/customers/9999')
    assert response.status_code == 404

def test_get_nonexistent_rental(client):
    """测试获取不存在的租赁"""
    response = client.get('/api/rentals/9999')
    assert response.status_code == 404

def test_create_rental_invalid_vehicle(client, test_customer):
    """测试使用不存在的车辆创建租赁"""
    data = {
        'vehicle_id': 9999,
        'customer_id': test_customer.customer_id,
        'duration_days': 5
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 404

def test_create_rental_invalid_customer(client, test_vehicle):
    """测试使用不存在的客户创建租赁"""
    data = {
        'vehicle_id': test_vehicle.vehicle_id,
        'customer_id': 9999,
        'duration_days': 5
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 404

def test_update_completed_rental(client, test_rental):
    """测试更新已完成的租赁"""
    # 先完成租赁
    with client.application.app_context():
        test_rental.status = '已完成'
        db.session.commit()
    
    data = {
        'duration_days': 7
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['duration_days'] == 3  # 保持原来的天数不变