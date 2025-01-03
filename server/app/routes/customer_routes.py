from flask import jsonify, request, Blueprint
from app.routes import bp
from app.models import Customer, Rental, Users
from app import db


@bp.route('/api/customers/all', methods=['GET'])
def get_customers():
    try:
        # 联表查询 Customer 和 User
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
        customer = Customer.query.get(customer_id)
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

        customers = (
            Customer.query.filter(
                (Customer.name.ilike(f'%{search_text}%')) |
                (Customer.id_card.ilike(f'%{search_text}%'))
            )
            .all()
        )
        return jsonify([customer.to_dict() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        customer.is_deleted = True
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    try:
        customer = Customer.query.filter_by(
            customer_id=customer_id).filter_by(is_deleted=False).first()
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        user = Users.query.get(customer.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()

        if 'username' in data:
            if not data['username'].strip():
                return jsonify({'error': 'Username cannot be empty'}), 400
            user.username = data['username']

        if 'name' in data:
            customer.name = data['name']

        if 'phone' in data:
            if not data['phone'].isdigit() or len(data['phone']) != 11:
                return jsonify({'error': 'Invalid phone number format'}), 400
            customer.phone = data['phone']

        if 'address' in data:
            customer.address = data['address']

        if 'id_card' in data and data['id_card'] != customer.id_card:
            if not data['id_card'].isalnum() or len(data['id_card']) != 18:
                return jsonify({'error': 'Invalid ID card format'}), 400
            if Customer.query.filter_by(id_card=data['id_card']).first():
                return jsonify({'error': 'ID card already exists'}), 400
            customer.id_card = data['id_card']

        db.session.commit()
        return jsonify(customer.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/customers/<int:id>/rentals', methods=['GET'])
def get_customer_rental_history(id):
    try:
        customer = Customer.query.get(id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        rentals = Rental.query.filter_by(customer_id=id).all()
        return jsonify([rental.to_dict() for rental in rentals])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
