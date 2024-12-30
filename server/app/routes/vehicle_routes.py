from flask import jsonify, request
from app.routes import bp
from app.models import Vehicle, Rental
from app import db

# 定义有效的车辆状态
VALID_VEHICLE_STATUS = ['可租用', '已租出', '维修中']

@bp.route('/api/vehicles', methods=['GET'])
def get_vehicles():
    # 获取分页参数
    page = request.args.get('page', default=1, type=int)
    page_size = request.args.get('pageSize', default=10, type=int)

    # 查询数据
    vehicles = Vehicle.query.paginate(page=page, per_page=page_size, error_out=False)

    # 返回分页后的数据
    return jsonify({
        'data': [vehicle.to_dict() for vehicle in vehicles.items],
        'total': vehicles.total
    })

@bp.route('/api/vehicles/<int:id>', methods=['GET'])
def get_vehicle(id):
    vehicle = Vehicle.query.get_or_404(id)
    return jsonify(vehicle.to_dict())

@bp.route('/api/vehicles', methods=['POST'])
def create_vehicle():
    data = request.get_json()
    
    # 验证必需字段
    required_fields = ['type', 'brand', 'model', 'color', 'price_per_day', 'plate_number']
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
            status='可租用',
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

        # 验证状态
        if 'status' in data and data['status'] not in VALID_VEHICLE_STATUS:
            return jsonify({'error': 'Invalid vehicle status'}), 400

        # 检查是否有进行中的租赁
        if 'status' in data:
            active_rental = Rental.query.filter_by(
                vehicle_id=id, 
                status='进行中'
            ).first()
            
            if active_rental and data['status'] != '已租出':
                return jsonify({
                    'error': 'Cannot change status of vehicle with active rental'
                }), 400

        # 更新可修改的字段
        if 'brand' in data:
            vehicle.brand = data['brand']
        if 'model' in data:
            vehicle.model = data['model']
        if 'color' in data:
            vehicle.color = data['color']
        if 'price_per_day' in data:
            vehicle.price_per_day = data['price_per_day']
        if 'status' in data:
            vehicle.status = data['status']
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
    if Rental.query.filter_by(vehicle_id=id, status='进行中').first():
        return jsonify({'error': 'Cannot delete vehicle with active rentals'}), 400
    
    try:
        db.session.delete(vehicle)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400 