import json
import random
import os

# 定义车辆品牌、型号、颜色和状态
brands = ["Toyota", "Honda", "Ford", "BMW",
          "Audi", "Tesla", "Nissan", "Volkswagen"]
models = ["RAV4", "Accord", "Mustang", "X5", "A4", "Model S", "Altima", "Golf"]
colors = ["白色", "黑色", "红色", "蓝色", "银色", "灰色"]
statuses = ["可租用", "已租出", "维修中"]

# 生成一辆车的随机数据


def generate_vehicle():
    return {
        "type": random.choice(["SUV", "轿车", "跑车", "卡车"]),
        "brand": random.choice(brands),
        "model": random.choice(models),
        "color": random.choice(colors),
        "price_per_day": round(random.uniform(100, 500), 2),
        "status": random.choice(statuses),
        "plate_number": f"京{random.choice(['A', 'B', 'C'])}{random.randint(10000, 99999)}"
    }

# 生成大量车辆数据


def generate_vehicles(num_vehicles):
    return [generate_vehicle() for _ in range(num_vehicles)]

# 保存数据到 JSON 文件


def save_to_json(data, filename):
    script_dir = os.path.dirname(os.path.abspath(__file__))  # 获取脚本所在目录
    file_path = os.path.join(script_dir, filename)  # 将文件路径拼接到脚本目录
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# 生成 100 辆车的测试数据并保存到 vehicles.json
if __name__ == "__main__":
    vehicles = generate_vehicles(100)
    save_to_json(vehicles, "vehicles.json")
    print("成功生成测试数据并保存到 vehicles.json！")
