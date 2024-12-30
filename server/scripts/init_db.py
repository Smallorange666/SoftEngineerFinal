import os
import sys
from hashlib import sha256

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import User
from app.models import Vehicle
from app import create_app, db

# 生成纯 SHA-256 哈希值
def generate_sha256_hash(password: str) -> str:
    return sha256(password.encode('utf-8')).hexdigest()

def init_db():
    app = create_app()
    with app.app_context():
        # 创建所有表
        db.create_all()

        # 添加一些测试数据
        if Vehicle.query.count() == 0:
            vehicles = [
                Vehicle(
                    type='SUV',
                    brand='Toyota',
                    model='RAV4',
                    color='白色',
                    price_per_day=300.00,
                    status='可租用',
                    plate_number='京A12345'
                ),
                Vehicle(
                    type='轿车',
                    brand='Honda',
                    model='Accord',
                    color='黑色',
                    price_per_day=250.00,
                    status='可租用',
                    plate_number='京B12345'
                )
            ]
            db.session.add_all(vehicles)
            db.session.commit()
            print("成功添加测试数据！")

        # 添加一个管理员账号和一个普通用户账号
        if User.query.count() == 0:
            admin = User(
                username='admin',
                password_hash=generate_sha256_hash('admin'),
                role='admin'
            )
            user = User(
                username='user',
                password_hash=generate_sha256_hash('user'),
                role='user'
            )
            db.session.add(admin)
            db.session.add(user)
            db.session.commit()
            print("成功添加管理员账号和普通用户账号！")


if __name__ == '__main__':
    init_db()
