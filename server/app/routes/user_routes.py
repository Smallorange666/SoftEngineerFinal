from flask import jsonify, request
from app.routes import bp
from app.models import User

@bp.route('/api/user', methods=['GET'])
def get_user():
    username = request.args.get('username')
    if not username:
        return jsonify({'error': '缺少username参数'}), 400
        
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({}), 200
        
    return jsonify(user.to_dict()), 200
