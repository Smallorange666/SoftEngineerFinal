import pytest
from datetime import datetime, timedelta
from app import db
from app.models import Rental, Vehicle, Customer
from sqlalchemy.exc import IntegrityError

def test_rental_creation(test_rental):
    """测试租赁创建和所有属性"""
    assert test_rental.rental_id is not None
    assert test_rental.vehicle_id is not None
    assert test_rental.customer_id is not None
    assert isinstance(test_rental.start_time, datetime)
    assert test_rental.duration_days == 3
    assert isinstance(test_rental.expected_return_time, datetime)
    assert test_rental.actual_return_time is None
    assert float(test_rental.total_fee) == 900.00
    assert test_rental.status == '进行中'
    assert test_rental.created_at is not None
    assert test_rental.updated_at is not None

def test_rental_to_dict(test_rental):
    """测试租赁转字典功能"""
    rental_dict = test_rental.to_dict()
    assert rental_dict['rental_id'] == test_rental.rental_id
    assert rental_dict['vehicle_id'] == test_rental.vehicle_id
    assert rental_dict['customer_id'] == test_rental.customer_id
    assert isinstance(rental_dict['start_time'], str)
    assert rental_dict['duration_days'] == 3
    assert isinstance(rental_dict['expected_return_time'], str)
    assert rental_dict['actual_return_time'] is None
    assert float(rental_dict['total_fee']) == 900.00
    assert rental_dict['status'] == '进行中'

def test_rental_relationships(test_rental):
    """测试租赁关系"""
    assert test_rental.vehicle is not None
    assert test_rental.customer is not None
    assert test_rental.vehicle.type == 'SUV'
    assert test_rental.customer.name == '张三'

def test_rental_foreign_key_constraint(app):
    """测试外键约束"""
    with app.app_context():
        # 测试不存在的车辆ID
        with pytest.raises(IntegrityError):
            rental = Rental(
                vehicle_id=99999,  # 不存在的车辆ID
                customer_id=1,
                start_time=datetime.now(),
                duration_days=3,
                expected_return_time=datetime.now() + timedelta(days=3),
                total_fee=900.00,
                status='进行中'
            )
            db.session.add(rental)
            db.session.commit()

def test_rental_cascade_delete(app, test_rental, test_vehicle, test_customer):
    """测试级联删除"""
    with app.app_context():
        # 确保所有对象都在同一个会话中
        rental_id = test_rental.rental_id
        
        # 重新从数据库加载对象
        vehicle = db.session.merge(test_vehicle)
        customer = db.session.merge(test_customer)
        rental = db.session.merge(test_rental)
        
        # 尝试删除被引用的车辆，应该失败
        with pytest.raises(IntegrityError):
            db.session.delete(vehicle)
            db.session.commit()
        db.session.rollback()
        
        # 尝试删除被引用的客户，应该失败
        with pytest.raises(IntegrityError):
            db.session.delete(customer)
            db.session.commit()
        db.session.rollback()
        
        # 删除租赁记录应该成功
        db.session.delete(rental)
        db.session.commit()
        assert Rental.query.get(rental_id) is None

def test_get_rental_by_id(client, test_rental):
    """测试获取特定租赁记录"""
    response = client.get(f'/api/rentals/{test_rental.rental_id}')
    assert response.status_code == 200
    rental = response.get_json()
    assert rental['rental_id'] == test_rental.rental_id
    assert rental['status'] == '进行中'

def test_get_nonexistent_rental(client):
    """测试获取不存在的租赁记录"""
    response = client.get('/api/rentals/9999')
    assert response.status_code == 404

def test_get_customer_rentals(client, test_rental, test_customer):
    """测试获取客户的租赁历史"""
    response = client.get(f'/api/rentals/customer/{test_customer.customer_id}')
    assert response.status_code == 200
    rentals = response.get_json()
    assert len(rentals) == 1
    assert rentals[0]['customer_id'] == test_customer.customer_id

def test_get_nonexistent_customer_rentals(client):
    """测试获取不存在客户的租赁历史"""
    response = client.get('/api/rentals/customer/9999')
    assert response.status_code == 404

def test_create_rental_invalid_duration(client, test_vehicle, test_customer):
    """测试创建租赁时使用无效的租赁天数"""
    data = {
        'vehicle_id': test_vehicle.vehicle_id,
        'customer_id': test_customer.customer_id,
        'duration_days': -1
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_create_rental_unavailable_vehicle(client, test_rental, test_customer):
    """测试租用已被租出的车辆"""
    data = {
        'vehicle_id': test_rental.vehicle_id,
        'customer_id': test_customer.customer_id,
        'duration_days': 5
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 400
    assert 'not available' in response.get_json()['error']

def test_update_rental_complete(client, test_rental):
    """测试完成租赁"""
    data = {
        'status': '已完成'
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['status'] == '已完成'
    assert result['actual_return_time'] is not None
    
    # 验证车辆状态已更新
    vehicle = Vehicle.query.get(test_rental.vehicle_id)
    assert vehicle.status == '可租用'

def test_update_rental_cancel(client, test_rental):
    """测试取消租赁"""
    data = {
        'status': '已取消'
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['status'] == '已取消'
    
    # 验证车辆状态已更新
    vehicle = Vehicle.query.get(test_rental.vehicle_id)
    assert vehicle.status == '可租用'

def test_update_rental_invalid_status(client, test_rental):
    """测试更新为无效的租赁状态"""
    data = {
        'status': '无效状态'
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 400
    assert 'Invalid rental status' in response.get_json()['error']

def test_update_rental_duration(client, test_rental):
    """测试更新租赁天数"""
    data = {
        'duration_days': 7
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['duration_days'] == 7
    assert float(result['total_fee']) == 7 * float(test_rental.vehicle.price_per_day)

def test_update_completed_rental(client, test_rental):
    """测试更新已完成的租赁"""
    # 先完成租赁
    test_rental.status = '已完成'
    test_rental.actual_return_time = datetime.now()
    db.session.commit()
    
    # 尝试更新租赁天数
    data = {
        'duration_days': 7
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['duration_days'] == 3  # 保持原来的天数不变

def test_update_nonexistent_rental(client):
    """测试更新不存在的租赁"""
    data = {
        'status': '已完成'
    }
    response = client.put('/api/rentals/9999', json=data)
    assert response.status_code == 404

def test_create_rental_missing_customer_id(client, test_vehicle):
    """测试创建租赁时缺少客户ID"""
    data = {
        'vehicle_id': test_vehicle.vehicle_id,
        'duration_days': 5
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 400
    assert 'Missing required field' in response.get_json()['error']

def test_update_rental_invalid_duration_format(client, test_rental):
    """测试更新租赁时使用无效的天数格式"""
    data = {
        'duration_days': 'invalid'
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 400
    assert 'Invalid duration days format' in response.get_json()['error']

def test_update_rental_no_changes(client, test_rental):
    """测试更新租赁时不做任何修改"""
    data = {}
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 200
    result = response.get_json()
    assert result['status'] == test_rental.status

def test_update_completed_rental_status(client, test_rental):
    """测试更新已完成租赁的状态为其他状态"""
    # 先完成租赁
    test_rental.status = '已完成'
    db.session.commit()
    
    # 尝试将状态改回进行中
    data = {
        'status': '进行中'
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 400
    assert 'error' in response.get_json()

def test_create_rental_vehicle_under_maintenance(client, test_vehicle, test_customer):
    """测试租用维修中的车辆"""
    # 将车辆状态设置为维修中
    test_vehicle.status = '维修中'
    db.session.commit()
    
    data = {
        'vehicle_id': test_vehicle.vehicle_id,
        'customer_id': test_customer.customer_id,
        'duration_days': 5
    }
    response = client.post('/api/rentals', json=data)
    assert response.status_code == 400
    assert 'not available' in response.get_json()['error']

def test_create_rental_invalid_json(client):
    """测试创建租赁时提供无效的JSON数据"""
    response = client.post('/api/rentals',
                         data='invalid json',
                         content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    assert data is not None
    assert 'error' in data

def test_update_rental_invalid_json(client, test_rental):
    """测试更新租赁时提供无效的JSON数据"""
    response = client.put(f'/api/rentals/{test_rental.rental_id}',
                         data='invalid json',
                         content_type='application/json')
    assert response.status_code == 400
    data = response.get_json()
    assert data is not None
    assert 'error' in data

def test_update_rental_duration_zero(client, test_rental):
    """测试将租赁天数更新为零"""
    data = {
        'duration_days': 0
    }
    response = client.put(f'/api/rentals/{test_rental.rental_id}', json=data)
    assert response.status_code == 400
    assert 'Duration days must be positive' in response.get_json()['error']

def test_get_rentals_empty(client):
    """测试获取空的租赁列表"""
    # 清空所有租赁记录
    Rental.query.delete()
    db.session.commit()
    
    response = client.get('/api/rentals')
    assert response.status_code == 200
    rentals = response.get_json()
    assert len(rentals) == 0  # 应该返回空列表而不是错误