from flask import jsonify, request
from app.routes import bp
from app.models import Rental, Vehicle, Customer
from app import db
from datetime import datetime, timedelta

# 定义有效的租赁状态
VALID_RENTAL_STATUS = ['进行中', '已完成', '已取消']

@bp.route('/api/rentals', methods=['GET'])
def get_rentals():
    rentals = Rental.query.all()
    return jsonify([rental.to_dict() for rental in rentals])

@bp.route('/api/rentals/<int:id>', methods=['GET'])
def get_rental(id):
    rental = Rental.query.get_or_404(id)
    return jsonify(rental.to_dict())

@bp.route('/api/rentals/customer/<int:customer_id>', methods=['GET'])
def get_customer_rentals(customer_id):
    # 验证客户是否存在
    customer = Customer.query.get_or_404(customer_id)
    rentals = Rental.query.filter_by(customer_id=customer_id).all()
    return jsonify([rental.to_dict() for rental in rentals])

@bp.route('/api/rentals', methods=['POST'])
def create_rental():
    data = request.get_json()
    
    # 验证必需字段
    required_fields = ['vehicle_id', 'customer_id', 'duration_days']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # 验证租赁天数
    try:
        duration_days = int(data['duration_days'])
        if duration_days <= 0:
            return jsonify({'error': 'Duration days must be positive'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid duration days format'}), 400
    
    # 检查车辆是否存在且可租用
    vehicle = Vehicle.query.get_or_404(data['vehicle_id'])
    
    # 检查是否有进行中的租赁
    active_rental = Rental.query.filter_by(
        vehicle_id=data['vehicle_id'], 
        status='进行中'
    ).first()
    
    if active_rental or vehicle.status != '可租用':
        return jsonify({'error': 'Vehicle is not available'}), 400
    
    # 检查客户是否存在
    customer = Customer.query.get_or_404(data['customer_id'])
    
    try:
        start_time = datetime.now()
        expected_return_time = start_time + timedelta(days=duration_days)
        total_fee = float(vehicle.price_per_day) * duration_days
        
        rental = Rental(
            vehicle_id=data['vehicle_id'],
            customer_id=data['customer_id'],
            start_time=start_time,
            duration_days=duration_days,
            expected_return_time=expected_return_time,
            total_fee=total_fee,
            status='进行中'
        )
        
        # 更新车辆状态
        vehicle.status = '已租出'
        
        db.session.add(rental)
        db.session.commit()
        return jsonify(rental.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/rentals/<int:id>', methods=['PUT'])
def update_rental(id):
    rental = Rental.query.get_or_404(id)
    data = request.get_json()

    try:
        # 验证状态
        if 'status' in data:
            if data['status'] not in VALID_RENTAL_STATUS:
                return jsonify({'error': 'Invalid rental status'}), 400
            
            # 不允许将已完成或已取消的租赁改回进行中
            if rental.status in ['已完成', '已取消'] and data['status'] == '进行中':
                return jsonify({'error': 'Cannot change completed or cancelled rental back to in progress'}), 400
            
            # 如果要完成租赁
            if data['status'] == '已完成' and rental.status == '进行中':
                rental.actual_return_time = datetime.now()
                # 更新车辆状态为可租用
                vehicle = Vehicle.query.get(rental.vehicle_id)
                vehicle.status = '可租用'
            
            # 如果要取消租赁
            elif data['status'] == '已取消' and rental.status == '进行中':
                # 更新车辆状态为可租用
                vehicle = Vehicle.query.get(rental.vehicle_id)
                vehicle.status = '可租用'
            
            rental.status = data['status']

        # 如果租赁正在进行中，允许更新预期归还时间和租赁天数
        if rental.status == '进行中':
            if 'duration_days' in data:
                try:
                    duration_days = int(data['duration_days'])
                    if duration_days <= 0:
                        return jsonify({'error': 'Duration days must be positive'}), 400
                    rental.duration_days = duration_days
                    rental.expected_return_time = rental.start_time + timedelta(days=duration_days)
                    rental.total_fee = float(rental.vehicle.price_per_day) * duration_days
                except ValueError:
                    return jsonify({'error': 'Invalid duration days format'}), 400

        db.session.commit()
        return jsonify(rental.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400