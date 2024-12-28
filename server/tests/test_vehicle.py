import pytest
from app.models import Vehicle

def test_vehicle_creation(test_vehicle):
    """测试车辆创建和所有属性"""
    assert test_vehicle.vehicle_id is not None
    assert test_vehicle.type == 'SUV'
    assert test_vehicle.brand == 'Toyota'
    assert test_vehicle.model == 'RAV4'
    assert test_vehicle.color == '白色'
    assert float(test_vehicle.price_per_day) == 300.00
    assert test_vehicle.status == '可租用'
    assert test_vehicle.plate_number == '测试车牌A123'
    assert test_vehicle.created_at is not None
    assert test_vehicle.updated_at is not None

def test_vehicle_to_dict(test_vehicle):
    """测试车辆转字典功能"""
    vehicle_dict = test_vehicle.to_dict()
    assert vehicle_dict['vehicle_id'] == test_vehicle.vehicle_id
    assert vehicle_dict['type'] == 'SUV'
    assert vehicle_dict['brand'] == 'Toyota'
    assert vehicle_dict['model'] == 'RAV4'
    assert vehicle_dict['color'] == '白色'
    assert float(vehicle_dict['price_per_day']) == 300.00
    assert vehicle_dict['status'] == '可租用'
    assert vehicle_dict['plate_number'] == '测试车牌A123'

def test_vehicle_unique_plate_number(app):
    """测试车牌号唯一性约束"""
    with pytest.raises(Exception):
        vehicle = Vehicle(
            type='轿车',
            brand='Honda',
            model='Accord',
            color='黑色',
            price_per_day=250.00,
            status='可租用',
            plate_number='测试车牌A123'  # 使用已存在的车牌号
        )
        db.session.add(vehicle)
        db.session.commit() 

def test_create_vehicle_empty_data(client):
    """测试创建车辆时提供空数据"""
    response = client.post('/api/vehicles', json={})
    assert response.status_code == 400
    assert 'Missing required field' in response.get_json()['error']

def test_update_vehicle_empty_data(client, test_vehicle):
    """测试更新车辆时提供空数据"""
    data = {}
    response = client.put(f'/api/vehicles/{test_vehicle.vehicle_id}', json=data)
    assert response.status_code == 200  # 不修改任何字段也应该成功
    result = response.get_json()
    assert result['type'] == test_vehicle.type  # 验证数据未变化

def test_update_vehicle_invalid_price_format(client, test_vehicle):
    """测试更新车辆时使用无效的价格格式"""
    data = {
        'price_per_day': 'invalid'
    }
    response = client.put(f'/api/vehicles/{test_vehicle.vehicle_id}', json=data)
    assert response.status_code == 400
    assert 'Invalid price format' in response.get_json()['error']

def test_create_vehicle_zero_price(client):
    """测试创建车辆时价格为零"""
    data = {
        'type': '轿车',
        'brand': 'Honda',
        'model': 'Accord',
        'color': '黑色',
        'price_per_day': 0.00,
        'plate_number': '京C12345'
    }
    response = client.post('/api/vehicles', json=data)
    assert response.status_code == 400
    assert 'Price must be positive' in response.get_json()['error']

def test_update_vehicle_invalid_type(client, test_vehicle):
    """测试更新车辆为无效的类型"""
    data = {
        'type': ''  # 空类型
    }
    response = client.put(f'/api/vehicles/{test_vehicle.vehicle_id}', json=data)
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_update_vehicle_maintenance_status(client, test_vehicle):
    """测试将车辆状态更新为维修中"""
    data = {
        'status': '维修中'
    }
    response = client.put(f'/api/vehicles/{test_vehicle.vehicle_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['status'] == '维修中'