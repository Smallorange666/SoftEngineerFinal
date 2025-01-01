from werkzeug.security import check_password_hash
from flask import request, jsonify
from flask import jsonify, request
from app.routes import bp
from app.models import User, Customer
from app import db
from werkzeug.security import generate_password_hash, check_password_hash


@bp.route('/api/user', methods=['GET'])
def get_user():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': '缺少username参数'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({}), 200

    return jsonify(user.to_dict()), 200


@bp.route('/api/register', methods=['POST'])
def register():
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

    # 检查用户名是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    # 检查身份证号是否已存在
    if Customer.query.filter_by(id_card=data['id_card']).first():
        return jsonify({'error': 'ID card already exists'}), 400

    try:
        # 创建用户
        password_hash = generate_password_hash(data['password'])
        user = User(
            username=data['username'],
            password_hash=password_hash,
            role='customer'  # 默认角色为 customer
        )
        db.session.add(user)
        db.session.flush()  # 获取 user_id，但不提交事务

        # 创建客户
        customer = Customer(
            user_id=user.user_id,
            name=data['name'],
            phone=data['phone'],
            id_card=data['id_card']
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
        return jsonify({'error': str(e)}), 400


@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # 验证必需字段
    required_fields = ['username', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    try:
        # 查找用户
        user = User.query.filter_by(username=data['username']).first()
        if not user:
            return jsonify({'error': '用户名或密码错误'}), 401

        # 验证密码
        if not check_password_hash(user.password_hash, data['password']):
            return jsonify({'error': '用户名或密码错误'}), 401

        customer_id = None
        # 查找关联的客户信息
        if user.role == 'customer':
            customer = Customer.query.filter_by(user_id=user.user_id).first()
            if not customer:
                return jsonify({'error': '未找到关联的客户信息'}), 404

        # 登录成功，返回用户信息和 customer_id
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
