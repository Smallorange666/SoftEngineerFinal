from flask import jsonify, request
from sqlalchemy import or_
from app.routes import bp
from app.models import Rental, Vehicle, Customer
from app import db
from datetime import datetime, timedelta
from decimal import Decimal

VALID_RENTAL_STATUS = ['ongoing', 'completed', 'overdue', 'cancelled']


def check_and_update_rental_status():
    try:
        # 检查并更新租赁状态
        overdue_rentals = Rental.query.filter(
            Rental.status == 'ongoing',
            Rental.expected_return_time < datetime.now()
        ).all()

        for rental in overdue_rentals:
            rental.status = 'overdue'
            db.session.add(rental)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error updating rental status: {e}")


@bp.route('/api/rentals/ongoing', methods=['GET'])
def get_ongoing_rentals():
    try:
        # 获取进行中的租赁记录
        rentals = (
            db.session.query(Rental, Customer.name,
                             Customer.phone, Vehicle.plate_number)
            .join(Customer, Rental.customer_id == Customer.customer_id, isouter=True)
            .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id, isouter=True)
            .filter(Rental.status == 'ongoing')
            .all()
        )

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
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/overdue', methods=['GET'])
def get_overdue_rentals():
    try:
        # 获取逾期的租赁记录，排除已删除的记录
        rentals = (
            db.session.query(Rental, Customer.name,
                             Customer.phone, Vehicle.plate_number)
            .join(Customer, Rental.customer_id == Customer.customer_id, isouter=True)
            .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id, isouter=True)
            .filter(Rental.status == 'overdue')
            .all()
        )

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
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/finished', methods=['GET'])
def get_finished_rentals():
    try:
        # 获取已完成的租赁记录，排除已删除的记录
        rentals = (
            db.session.query(Rental, Customer.name,
                             Customer.phone, Vehicle.plate_number)
            .join(Customer, Rental.customer_id == Customer.customer_id, isouter=True)
            .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id, isouter=True)
            .filter(Rental.status == 'completed')
            .all()
        )

        result = {
            'data': [
                {
                    'rental_id': rental.rental_id,
                    'plate_number': plate_number,
                    'name': name,
                    'phone': phone,
                    'total_fee': rental.total_fee,
                    'actual_return_time': rental.actual_return_time.strftime('%Y-%m-%d %H:%M:%S') if rental.actual_return_time else None,
                }
                for rental, name, phone, plate_number in rentals
            ],
            'total': len(rentals)
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/cancelled', methods=['GET'])
def get_canceled_rentals():
    try:
        # 获取已取消的租赁记录，排除已删除的记录
        rentals = (
            db.session.query(Rental, Customer.name,
                             Customer.phone, Vehicle.plate_number)
            .join(Customer, Rental.customer_id == Customer.customer_id, isouter=True)
            .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id, isouter=True)
            .filter(Rental.status == 'cancelled')
            .all()
        )

        result = {
            'data': [
                {
                    'rental_id': rental.rental_id,
                    'plate_number': plate_number,
                    'name': name,
                    'phone': phone,
                    'total_fee': rental.total_fee,
                    'actual_return_time': rental.actual_return_time.strftime('%Y-%m-%d %H:%M:%S') if rental.actual_return_time else None,
                }
                for rental, name, phone, plate_number in rentals
            ],
            'total': len(rentals)
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/<int:rental_id>', methods=['GET'])
def get_rental(rental_id):
    try:
        check_and_update_rental_status()
        # 获取指定租赁记录
        rental = Rental.query.filter_by(
            rental_id=rental_id).first()
        if not rental:
            return jsonify({'error': 'Rental not found'}), 404
        return jsonify(rental.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/customer/<int:customer_id>', methods=['GET'])
def get_customer_rentals(customer_id):
    try:
        check_and_update_rental_status()
        # 获取客户的租赁记录
        # !!! 这里从前端获取的实际是use_id
        customer = Customer.query.filter_by(
            user_id=customer_id
        ).first()
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        rentals = (
            Rental.query
            .filter_by(customer_id=customer.customer_id)
            .join(Vehicle)
            .order_by(Rental.start_time.desc())
            .all()
        )

        result = {
            'data': [
                {
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
                for rental in rentals
            ],
            'total': len(rentals)
        }

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals', methods=['POST'])
def create_rental():
    try:
        check_and_update_rental_status()
        data = request.get_json()

        # 验证必需字段
        required_fields = ['vehicle_id', 'customer_id', 'duration_days']
        missing_fields = [
            field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        vehicle_id = data['vehicle_id']
        customer_id = data['customer_id']
        duration_days = int(data['duration_days'])

        # 检查客户是否有逾期的租赁记录
        overdue_rental = Rental.query.filter(
            Rental.customer_id == customer_id,
            Rental.status == 'overdue'
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
            .join(Vehicle, Rental.vehicle_id == Vehicle.vehicle_id)
            .filter(
                Rental.vehicle_id == vehicle_id,
                Vehicle.is_deleted == False
            ).filter(
                or_(Rental.status == 'ongoing', Rental.status == 'overdue')
            ).first()
        )
        if ongoing_rental:
            return jsonify({'error': 'Vehicle is currently rented out'}), 400

        # 创建租赁记录
        start_time = datetime.now()
        expected_return_time = start_time + timedelta(days=duration_days)
        vehicle = Vehicle.query.get(vehicle_id)
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404

        total_fee = Decimal(vehicle.price_per_day) * Decimal(duration_days)

        # 检查是否余额充足
        customer = Customer.query.filter_by(customer_id=customer_id).first()
        customer_money = Decimal(customer.money)
        if customer_money < total_fee:
            return jsonify({'error': '余额不足'}), 400

        # 减去费用
        customer.money = customer.money - total_fee

        rental = Rental(
            vehicle_id=vehicle_id,
            customer_id=customer_id,
            start_time=start_time,
            duration_days=duration_days,
            expected_return_time=expected_return_time,
            total_fee=total_fee,
            status='ongoing'
        )
        db.session.add(rental)
        db.session.commit()
        return jsonify(rental.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/<int:reantal_id>', methods=['DELETE'])
def cancel_rental(reantal_id):
    try:
        # 获取租赁记录，排除已删除的记录
        rental = Rental.query.filter_by(
            rental_id=reantal_id).first()
        if not rental:
            return jsonify({'error': 'Rental not found'}), 404

        if rental.status != 'ongoing':
            return jsonify({'error': 'Only ongoing rental can be cancelled'}), 400

        # 取消租赁
        rental.status = 'cancelled'
        db.session.commit()
        return jsonify(rental.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/rentals/<int:rental_id>', methods=['PATCH'])
def return_vehicle(rental_id):
    try:
        # 获取租赁记录，排除已删除的记录
        rental = Rental.query.filter_by(
            rental_id=rental_id).first()
        if not rental:
            return jsonify({'error': 'Rental not found'}), 404

        if rental.status not in ['ongoing', 'overdue']:
            return jsonify({'error': 'Only ongoing or overdue rentals can be returned'}), 400

        # 还车操作
        rental.status = 'completed'
        rental.actual_return_time = datetime.now()
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
