
from flask import jsonify, request
from sqlalchemy import or_
from app.routes import bp
from app.models import Rental, Vehicle, Customer
from app import db
from datetime import datetime, timedelta

# 定义有效的租赁状态
VALID_RENTAL_STATUS = ['进行中', '已完成', '已逾期']


def check_and_update_rental_status():
    """
    检查所有租赁记录，如果有到时间未归还的，更新状态为 '已逾期'
    """
    try:
        # 获取所有状态为 '进行中' 且预期归还时间已过的租赁记录
        overdue_rentals = Rental.query.filter(
            Rental.status == '进行中',
            Rental.expected_return_time < datetime.now()
        ).all()

        # 更新状态为 '已逾期'
        for rental in overdue_rentals:
            rental.status = '已逾期'
            db.session.add(rental)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error updating rental status: {e}")


@bp.route('/api/rentals', methods=['GET'])
def get_all_rentals():
    # 检查并更新租赁状态
    check_and_update_rental_status()

    # 获取所有租赁记录
    rentals = Rental.query.all()
    return jsonify([rental.to_dict() for rental in rentals])


@bp.route('/api/rentals/ongoing', methods=['GET'])
def get_ongoing_rentals():
    # 联表查询 Rental、Customer 和 Vehicle
    rentals = (
        db.session.query(Rental, Customer.name,
                         Customer.phone, Vehicle.plate_number)
        .join(Customer, Rental.customer_id == Customer.customer_id, isouter=True)
        .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id, isouter=True)
        .all()
    )

    # 构造返回数据
    result = {
        'data': [
            {
                'rental_id': rental.rental_id,
                'plate_number': plate_number,
                'name': name,
                'phone': phone,
                'total_fee': rental.total_fee,
                'expected_return_time': rental.expected_return_time.strftime('%Y-%m-%d %H:%M:%S') if rental.expected_return_time else None,
            }
            for rental, name, phone, plate_number in rentals
        ],
        'total': len(rentals)
    }

    return jsonify(result)


@bp.route('/api/rentals/<int:id>', methods=['GET'])
def get_rental(id):
    # 检查并更新租赁状态
    check_and_update_rental_status()

    # 获取指定租赁记录
    rental = Rental.query.get_or_404(id)
    return jsonify(rental.to_dict())


@bp.route('/api/rentals/customer/<int:customer_id>', methods=['GET'])
def get_customer_rentals(customer_id):
    # 检查并更新租赁状态
    check_and_update_rental_status()

    # 验证客户是否存在
    customer = Customer.query.get(customer_id)
    if (customer is None):
        return jsonify({'error': 'Customer not found'}), 404

    # 联表查询租赁历史和车辆信息
    rentals = (
        Rental.query
        .filter_by(customer_id=customer.customer_id)
        .join(Vehicle)  # 联表查询车辆信息
        .order_by(Rental.start_time.desc())  # 按 start_time 降序排序
        .all()
    )

    # 构造返回数据，将车辆信息平铺到租赁信息中
    result = []
    for rental in rentals:
        rental_dict = {
            'rental_id': rental.rental_id,
            'vehicle_id': rental.vehicle_id,
            'customer_id': rental.customer_id,
            'start_time': rental.start_time.strftime('%Y-%m-%d %H:%M'),
            'duration_days': rental.duration_days,
            'expected_return_time': rental.expected_return_time.strftime('%Y-%m-%d %H:%M'),
            'actual_return_time': rental.actual_return_time.strftime('%Y-%m-%d %H:%M') if rental.actual_return_time else None,
            'total_fee': float(rental.total_fee),
            'status': rental.status,
            'plate_number': rental.vehicle.plate_number,
            'type': rental.vehicle.type,
            'brand': rental.vehicle.brand,
            'model': rental.vehicle.model,
            'color': rental.vehicle.color,
            'price_per_day': float(rental.vehicle.price_per_day)
        }
        result.append(rental_dict)

    return jsonify(result)


@bp.route('/api/rentals', methods=['POST'])
def create_rental():
    check_and_update_rental_status()

    data = request.get_json()

    # 验证必需字段
    required_fields = ['vehicle_id', 'customer_id', 'duration_days']
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    vehicle_id = data['vehicle_id']
    customer_id = data['customer_id']
    duration_days = int(data['duration_days'])

    # 检查用户本人是否存在逾期未还的租赁记录
    overdue_rental = Rental.query.filter(
        Rental.customer_id == customer_id,
        Rental.status == '已逾期'
    ).first()
    if overdue_rental:
        return jsonify({'error': 'Customer has overdue rental'}), 400

    # 验证租赁天数
    try:
        if duration_days <= 0:
            return jsonify({'error': 'Duration days must be positive'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid duration days format'}), 400

    # 检查车辆是否已被租赁
    ongoing_rental = (
        Rental.query
        .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id)  # 联表查询
        .filter(
            Rental.vehicle_id == vehicle_id,
            Vehicle.is_deleted == False
        ).filter(
            or_(Rental.status == '进行中', Rental.status == '已逾期')
        ).first()
    )
    if ongoing_rental:
        return jsonify({'error': 'Vehicle is currently rented out'}), 400

    try:
        start_time = datetime.now()
        expected_return_time = start_time + timedelta(days=duration_days)
        vehicle = Vehicle.query.get(vehicle_id)
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404

        total_fee = float(vehicle.price_per_day) * duration_days
        rental = Rental(
            vehicle_id=vehicle_id,
            customer_id=customer_id,
            start_time=start_time,
            duration_days=duration_days,
            expected_return_time=expected_return_time,
            total_fee=total_fee,
            status='进行中'
        )
        db.session.add(rental)
        db.session.commit()
        return jsonify(rental.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ bp.route('/api/rentals/<int:id>', methods=['PUT'])
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
                    rental.expected_return_time = rental.start_time + \
                        timedelta(days=duration_days)
                    rental.total_fee = float(
                        rental.vehicle.price_per_day) * duration_days
                except ValueError:
                    return jsonify({'error': 'Invalid duration days format'}), 400

        db.session.commit()
        return jsonify(rental.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
