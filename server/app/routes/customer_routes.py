import re
from flask import jsonify, request, Blueprint
from app.routes import bp
from app.models import Customer, Rental, Users
from app import db

ID_CARD_PATTERN = re.compile(r'^\d{17}[\dXx]$')
PHONE_NUMBER_PATTERN = re.compile(r'^\d{11}$')


@bp.route('/api/customers/all', methods=['GET'])
def get_customers():
    try:
        # 联表查询 Customer 和 User，排除已删除的客户
        customers = (
            db.session.query(Customer, Users.username)
            .join(Users, Customer.user_id == Users.user_id, isouter=True)
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
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:customer_id>', methods=['GET'])
def get_customer_by_id(customer_id):
    try:
        # 查找客户，排除已删除的客户
        customer = Customer.query.filter_by(
            customer_id=customer_id).filter_by(is_deleted=False).first()
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        return jsonify(customer.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers', methods=['GET'])
def search_customers():
    try:
        search_text = request.args.get('search', '').strip()
        if not search_text:
            return jsonify([])

        # 搜索客户，排除已删除的客户
        customers = (
            Customer.query.filter(
                (Customer.name.ilike(f'%{search_text}%')) |
                (Customer.id_card.ilike(f'%{search_text}%'))
            )
            .filter(Customer.is_deleted == False)
            .all()
        )
        return jsonify([customer.to_dict() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    try:
        # 查找客户，排除已删除的客户
        customer = Customer.query.filter_by(
            customer_id=customer_id).filter_by(is_deleted=False).first()
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        # 软删除客户
        customer.is_deleted = True
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    try:
        # 查找客户，排除已删除的客户
        customer = Customer.query.filter_by(
            customer_id=customer_id).filter_by(is_deleted=False).first()
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        # 查找关联的用户
        user = Users.query.filter_by(
            user_id=customer.user_id).filter_by(is_deleted=False).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        # 更新用户名
        if 'username' in data and data['username'] != user.username:
            if not data['username'].strip():
                return jsonify({'error': 'Username cannot be empty'}), 400
            user.username = data['username']

        # 更新客户姓名
        if 'name' in data and data['name'] != customer.name:
            customer.name = data['name']

        # 更新手机号
        if 'phone' in data and data['phone'] != customer.phone:
            if not PHONE_NUMBER_PATTERN.match(data['phone']):
                return jsonify({'error': 'Invalid phone number format'}), 400
            customer.phone = data['phone']

        # 更新地址
        if 'address' in data and data['address'] != customer.address:
            customer.address = data['address']

        # 更新身份证号
        if 'id_card' in data and data['id_card'] != customer.id_card:
            if not ID_CARD_PATTERN.match(data['id_card']):
                return jsonify({'error': 'Invalid ID card format'}), 400
            if Customer.query.filter_by(id_card=data['id_card']).filter_by(is_deleted=False).first():
                return jsonify({'error': 'ID card already exists'}), 400
            customer.id_card = data['id_card']

        # 提交事务
        db.session.commit()
        return jsonify(customer.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:id>/rentals', methods=['GET'])
def get_customer_rental_history(id):
    try:
        # 查找客户，排除已删除的客户
        customer = Customer.query.filter_by(
            customer_id=id).filter_by(is_deleted=False).first()
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        # 获取客户的租赁记录
        rentals = Rental.query.filter_by(customer_id=id).all()
        return jsonify([rental.to_dict() for rental in rentals])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
