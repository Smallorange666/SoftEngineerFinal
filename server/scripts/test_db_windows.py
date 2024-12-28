import psycopg2
from psycopg2 import Error

try:
    # 连接到数据库
    connection = psycopg2.connect(
        user="postgres",
        password="123456",  # 替换为你的密码
        host="localhost",
        port="5432",
        database="car_rental"
    )

    # 创建游标对象
    cursor = connection.cursor()
    
    # 打印 PostgreSQL 详细信息
    print("PostgreSQL 服务器信息：")
    print(connection.get_dsn_parameters())
    
    # 执行查询
    cursor.execute("SELECT version();")
    record = cursor.fetchone()
    print("你连接到的是：", record)

except (Exception, Error) as error:
    print("连接 PostgreSQL 时出错：", error)
finally:
    if 'connection' in locals():
        cursor.close()
        connection.close()
        print("PostgreSQL 连接已关闭") 