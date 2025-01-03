import React, { useEffect, useState } from "react";
import type { TableProps } from "antd";
import { Table, Tag, message } from "antd";
import { User, PersonalRentalInfo } from "../types";
import { fetchPersonalRentals } from "../services/rentServices";

const MyRentalsPage: React.FC<User> = ({ user }) => {
  const [data, setData] = useState<PersonalRentalInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取租赁历史数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const rentalsData = await fetchPersonalRentals(user.user_id);
      setData(rentalsData);
    } catch (error: any) {
      message.error("获取租赁历史失败：" + error.message);
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
  const columns: TableProps<PersonalRentalInfo>["columns"] = [
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
      render: (status: string) => {
        let color = "default";
        if (status === "进行中") {
          color = "green";
        } else if (status === "已逾期") {
          color = "red";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Table<PersonalRentalInfo>
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
