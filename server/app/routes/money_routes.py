from flask import request, jsonify
from app.routes import bp
from app.models import Customer, Users
from app import db
from decimal import Decimal

@bp.route('/api/money/<int:customer_id>', methods=['GET'])
def get_money(customer_id):
    customer = Customer.query.filter_by(customer_id=customer_id).first()
    print(f"[充值请求] 客户ID: {customer_id}")
    if not customer:
        return jsonify({'error': '未找到对应id的用户'}), 404
    return jsonify({'money': float(customer.money)}), 200


@bp.route('/api/money/<int:customer_id>', methods=['POST'])
def recharge(customer_id):
    try:
        data = request.get_json()
        amount = Decimal(data.get('amount', '0'))
        print(f"[充值请求] 客户ID: {customer_id}, 充值金额为: {amount}")
        if amount <= 0:
            return jsonify({'error': '充值余额不得少于0'}), 400

        customer = Customer.query.filter_by(customer_id=customer_id).first()
        if not customer:
            return jsonify({'error': '未找到对应id的用户'}), 404

        customer.money += amount
        db.session.commit()

        return jsonify({'message': '充值成功', 'new_money': float(customer.money)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500