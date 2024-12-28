from flask import jsonify, request, Blueprint
from app.routes import bp
from app.models import Customer, Rental
from app import db

@bp.route('/api/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([customer.to_dict() for customer in customers])

@bp.route('/api/customers/<int:id>', methods=['GET'])
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify(customer.to_dict())

@bp.route('/api/customers', methods=['POST'])
def create_customer():
    data = request.get_json()
    
    # 验证必需字段
    required_fields = ['name', 'phone', 'address', 'id_card']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # 验证手机号格式
    if not data['phone'].isdigit() or len(data['phone']) != 11:
        return jsonify({'error': 'Invalid phone number format'}), 400
    
    # 验证身份证号格式
    if not data['id_card'].isalnum() or len(data['id_card']) != 18:
        return jsonify({'error': 'Invalid ID card format'}), 400
    
    # 检查身份证号是否已存在
    if Customer.query.filter_by(id_card=data['id_card']).first():
        return jsonify({'error': 'ID card already exists'}), 400
    
    try:
        customer = Customer(
            name=data['name'],
            phone=data['phone'],
            address=data['address'],
            id_card=data['id_card']
        )
        db.session.add(customer)
        db.session.commit()
        return jsonify(customer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/customers/<int:id>', methods=['PUT'])
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.get_json()

    try:
        # 更新基本信息
        if 'name' in data:
            customer.name = data['name']
        
        # 验证并更新手机号
        if 'phone' in data:
            if not data['phone'].isdigit() or len(data['phone']) != 11:
                return jsonify({'error': 'Invalid phone number format'}), 400
            customer.phone = data['phone']
        
        # 更新地址
        if 'address' in data:
            customer.address = data['address']
        
        # 验证并更新身份证号
        if 'id_card' in data and data['id_card'] != customer.id_card:
            if not data['id_card'].isalnum() or len(data['id_card']) != 18:
                return jsonify({'error': 'Invalid ID card format'}), 400
            # 检查新身份证号是否已被使用
            if Customer.query.filter_by(id_card=data['id_card']).first():
                return jsonify({'error': 'ID card already exists'}), 400
            customer.id_card = data['id_card']

        db.session.commit()
        return jsonify(customer.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/api/customers/<int:id>/rentals', methods=['GET'])
def get_customer_rental_history(id):
    customer = Customer.query.get_or_404(id)
    rentals = Rental.query.filter_by(customer_id=id).all()
    return jsonify([rental.to_dict() for rental in rentals])