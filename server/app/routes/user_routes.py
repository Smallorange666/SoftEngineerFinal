from flask import request, jsonify
from flask import jsonify, request
from app.routes import bp
from app.models import Users, Customer
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import and_

@bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()

        # 验证必需字段
        required_fields = ['username', 'password', 'name', 'phone', 'id_card']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # 验证手机号格式
        if not data['phone'].isdigit() or len(data['phone']) != 11:
            return jsonify({'error': 'Invalid phone number format'}), 400

        # 验证身份证号格式
        if not data['id_card'].isalnum() or len(data['id_card']) != 18:
            return jsonify({'error': 'Invalid ID card format'}), 400

        # 检查用户名是否已存在（排除已删除的用户）
        if Users.query.filter_by(username=data['username']).filter_by(is_deleted=False).first():
            return jsonify({'error': 'Username already exists'}), 400

        # 验证ID_CARD是否重复
        check1 = Customer.query.filter(and_(Customer.id_card == data['id_card'],
                                                       Customer.is_deleted == False)).first()
        if check1:
            return jsonify({'error': '该身份证号已被注册'}), 409

        # 验证phonenumber是否重复
        check2 = Customer.query.filter(and_(Customer.phone == data['phone'],
                                                       Customer.is_deleted == False)).first()
        if check2:
            return jsonify({'error': '该手机号已被注册'}), 409

        # 创建用户和客户记录
        password_hash = generate_password_hash(data['password'])
        user = Users(
            username=data['username'],
            password_hash=password_hash,
            role='customer'
        )
        db.session.add(user)
        db.session.flush()

        customer = Customer(
            user_id=user.user_id,
            name=data['name'],
            phone=data['phone'],
            address=data['address'] if 'address' in data else None,
            id_card=data['id_card'],
            money="0.00"
        )
        db.session.add(customer)

        # 提交事务
        db.session.commit()

        return jsonify({
            'user_id': user.user_id,
            'customer_id': customer.customer_id,
            'username': user.username,
            'name': customer.name
        }), 201
    except Exception as e:
        # 回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        # 验证必需字段
        required_fields = ['username', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # 查找用户（排除已删除的用户）
        user = Users.query.filter_by(
            username=data['username']).filter_by(is_deleted=False).first()
        if not user:
            return jsonify({'error': 'User does not exist'}), 401

        # 验证密码
        if not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': 'Password is incorrect'}), 401

        # 查找关联的客户信息（排除已删除的客户）
        customer_id = None
        if user.role == 'customer':
            customer = Customer.query.filter_by(
                user_id=user.user_id).filter_by(is_deleted=False).first()
            if not customer:
                return jsonify({'error': 'Associated customer not found'}), 404
            customer_id = customer.customer_id
        return jsonify({
            'user': {
                'user_id': user.user_id,
                'username': user.username,
                'role': user.role,
                'customer_id': customer_id,
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/user/<int:user_id>', methods=['PUT'])
def modify_password(user_id):
    try:
        # 查找用户（排除已删除的用户）
        user = Users.query.filter_by(
            user_id=user_id).filter_by(is_deleted=False).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # 修改密码
        data = request.get_json()
        password_hash = generate_password_hash(data['password'])
        user.password_hash = password_hash

        # 提交事务
        db.session.commit()
        return '', 204
    except Exception as e:
        # 回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/api/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        # 查找用户（排除已删除的用户）
        user = Users.query.filter_by(
            user_id=user_id).filter_by(is_deleted=False).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # 验证密码
        if not check_password_hash(user.password_hash, request.get_json()['password']):
            return jsonify({'error': 'Password is incorrect'}), 400

        # 查找关联的客户信息（排除已删除的客户）
        customer = Customer.query.filter_by(
            user_id=user_id).filter_by(is_deleted=False).first()

        # 软删除用户和客户
        user.is_deleted = True
        if customer:
            customer.is_deleted = True

        # 提交事务
        db.session.commit()
        return '', 204
    except Exception as e:
        # 回滚事务
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
