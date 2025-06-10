from werkzeug.security import generate_password_hash
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import Users
from app.models import Vehicle
from app import create_app, db


def init_db():
    app = create_app()
    with app.app_context():
        # 清除所有表
        db.drop_all()
        # 创建所有表
        db.create_all()

        # 清空vehicles表
        Vehicle.query.delete()
        db.session.commit()

        if Vehicle.query.count() == 0:
            # 从 vehicles.json 文件中读取数据
            script_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(script_dir, "vehicles.json")
            with open(file_path, "r", encoding="utf-8") as f:
                vehicles_data = json.load(f)

            # 将数据转换为 Vehicle 对象
            vehicles = [
                Vehicle(
                    type=vehicle["type"],
                    brand=vehicle["brand"],
                    model=vehicle["model"],
                    color=vehicle["color"],
                    price_per_day=vehicle["price_per_day"],
                    plate_number=vehicle["plate_number"],
                )
                for vehicle in vehicles_data
            ]

            db.session.add_all(vehicles)
            db.session.commit()
            print("成功从初始化数据库！")

        # 添加一个管理员账号和一个普通用户账号
        if Users.query.count() == 0:
            admin = Users(
                username="admin",
                password_hash=generate_password_hash("admin"),  # 使用 bcrypt 哈希密码
                role="admin",
            )
            db.session.add(admin)
            db.session.commit()
            print("成功添加管理员账号！")


if __name__ == "__main__":
    init_db()
