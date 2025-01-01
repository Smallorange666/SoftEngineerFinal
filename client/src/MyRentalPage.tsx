import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { Table, message } from "antd";
import { RentalInfo } from "./types";
import { MyRentalsPageProps } from "./types";

const MyRentalsPage: React.FC<MyRentalsPageProps> = ({ user }) => {
  const [data, setData] = useState<RentalInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取租赁历史数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const rentalsResponse = await fetch(
        `http://localhost:5000/api/rentals/customer/${user.user_id}`
      );
      if (!rentalsResponse.ok) {
        const errorData = await rentalsResponse.json();
        throw new Error(errorData.error);
      }

      const rentalsData = await rentalsResponse.json();
      setData(rentalsData);
    } catch (error: any) {
      message.error("获取租赁历史失败：" + error.message);
      console.error("Error fetching rentals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchData();
    }
  }, [user?.user_id]);

  // 列定义
  const columns: TableProps<RentalInfo>["columns"] = [
    {
      title: "车牌号",
      dataIndex: "plate_number",
      key: "plate_number",
    },
    {
      title: "车辆类型",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "品牌",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "型号",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "颜色",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      key: "start_time",
    },
    {
      title: "租赁天数",
      dataIndex: "duration_days",
      key: "duration_days",
    },
    {
      title: "预计归还时间",
      dataIndex: "expected_return_time",
      key: "expected_return_time",
    },
    {
      title: "实际归还时间",
      dataIndex: "actual_return_time",
      key: "actual_return_time",
    },
    {
      title: "总费用",
      dataIndex: "total_fee",
      key: "total_fee",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <div>
      <Table<RentalInfo>
        columns={columns}
        rowKey={(record) => record.rental_id.toString()}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default MyRentalsPage;
