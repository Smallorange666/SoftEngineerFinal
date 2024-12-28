import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Vehicle

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

if __name__ == '__main__':
    init_db() 