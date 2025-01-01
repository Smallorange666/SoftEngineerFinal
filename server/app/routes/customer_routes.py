from flask import jsonify, request, Blueprint
from app.routes import bp
from app.models import Customer, Rental, User
from app import db
from app.models import User


@bp.route('/api/customers', methods=['GET'])
def get_customers():
    # 联表查询 Customer 和 User
    customers = (
        db.session.query(Customer, User.username)
        .join(User, Customer.user_id == User.user_id, isouter=True)
        .filter(Customer.is_deleted == False)
        .all()
    )

    # 构造返回数据
    result = {
        'data': [
            {
                **customer.to_dict(),  # Customer 表字段
                'username': username   # 添加 username 字段
            }
            for customer, username in customers
        ],
        'total': len(customers)
    }

    return jsonify(result)


@bp.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer_by_id(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    return jsonify(customer.to_dict())


@bp.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({'error': 'Customer not found'}), 404

    try:
        customer.is_deleted = True
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@ bp.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
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


@ bp.route('/api/customers/<int:id>/rentals', methods=['GET'])
def get_customer_rental_history(id):
    customer = Customer.query.get_or_404(id)
    rentals = Rental.query.filter_by(customer_id=id).all()
    return jsonify([rental.to_dict() for rental in rentals])
