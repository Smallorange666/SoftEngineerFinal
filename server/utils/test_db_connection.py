import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app, db
from app.models import Vehicle

def test_connection():
    app = create_app()
    with app.app_context():
        try:
            # 测试数据库连接
            vehicles = Vehicle.query.all()
            print(f"成功连接到数据库！找到 {len(vehicles)} 辆车。")
            for vehicle in vehicles:
                print(f"车辆信息: {vehicle.brand} {vehicle.model}, 车牌号: {vehicle.plate_number}")
        except Exception as e:
            print(f"连接数据库时出错: {str(e)}")

if __name__ == '__main__':
    test_connection() 