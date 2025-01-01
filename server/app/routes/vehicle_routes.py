from flask import request, jsonify
from flask import jsonify, request
from sqlalchemy import func
from app.routes import bp
from app.models import Vehicle, Rental
from app import db
import re

# 假设车牌号格式为：1个汉字 + 1个字母 + 5个字母或数字（例如：京A12345）
PLATE_NUMBER_PATTERN = re.compile(r'^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$')


@bp.route('/api/vehicles', methods=['GET'])
def get_vehicles_info():
    # 获取分页参数
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('pageSize', default=10, type=int)

    # 连表查询车辆及其租赁状态
    vehicles = (
        db.session.query(
            Vehicle,
            Rental.status
        )
        .join(Rental, Vehicle.vehicle_id == Rental.vehicle_id, isouter=True)
        .paginate(page=page, per_page=page_size, error_out=False)
    )

    # 构造返回数据
    result = {
        'data': [
            {
                **vehicle.to_dict(),
                'status': '忙碌中' if status == '进行中' or status == '已逾期' else '可租用'
            }
            for vehicle, status in vehicles.items
        ],
        'total': vehicles.total
    }

    return jsonify(result)


@bp.route('/api/vehicles', methods=['POST'])
def create_vehicle():
    data = request.get_json()

    # 验证必需字段
    required_fields = ['type', 'brand', 'model',
                       'color', 'price_per_day', 'plate_number']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # 验证价格是否为正数
    try:
        price = float(data['price_per_day'])
        if price <= 0:
            return jsonify({'error': 'Price must be positive'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid price format'}), 400

    # 验证车牌号格式
    plate_number = data['plate_number']
    if not PLATE_NUMBER_PATTERN.match(plate_number):
        return jsonify({'error': 'Invalid plate number format'}), 400

    # 检查车牌号是否已存在
    if Vehicle.query.filter_by(plate_number=data['plate_number']).first():
        return jsonify({'error': 'Plate number already exists'}), 400

    try:
        vehicle = Vehicle(
            type=data['type'],
            brand=data['brand'],
            model=data['model'],
            color=data['color'],
            price_per_day=price,
            plate_number=data['plate_number']
        )
        db.session.add(vehicle)
        db.session.commit()
        return jsonify(vehicle.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@bp.route('/api/vehicles/<int:id>', methods=['PUT'])
def update_vehicle(id):
    vehicle = Vehicle.query.get_or_404(id)
    data = request.get_json()

    try:
        # 验证类型不能为空
        if 'type' in data:
            if not data['type'].strip():
                return jsonify({'error': 'Vehicle type cannot be empty'}), 400
            vehicle.type = data['type']

        # 验证价格
        if 'price_per_day' in data:
            try:
                price = float(data['price_per_day'])
                if price <= 0:
                    return jsonify({'error': 'Price must be positive'}), 400
                data['price_per_day'] = price
            except ValueError:
                return jsonify({'error': 'Invalid price format'}), 400

        # 更新可修改的字段
        if 'brand' in data:
            vehicle.brand = data['brand']
        if 'model' in data:
            vehicle.model = data['model']
        if 'color' in data:
            vehicle.color = data['color']
        if 'price_per_day' in data:
            vehicle.price_per_day = data['price_per_day']
        if 'plate_number' in data and data['plate_number'] != vehicle.plate_number:
            if Vehicle.query.filter_by(plate_number=data['plate_number']).first():
                return jsonify({'error': 'Plate number already exists'}), 400
            vehicle.plate_number = data['plate_number']

        db.session.commit()
        return jsonify(vehicle.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@bp.route('/api/vehicles/<int:id>', methods=['DELETE'])
def delete_vehicle(id):
    vehicle = Vehicle.query.get_or_404(id)

    # 检查车辆是否有关联的租赁记录
    if Rental.query.filter_by(vehicle_id=id).first():
        return jsonify({'error': 'Cannot delete vehicle with associated rentals'}), 400

    try:
        db.session.delete(vehicle)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
