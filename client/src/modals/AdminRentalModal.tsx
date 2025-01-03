import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Table,
  Space,
  Button,
} from "antd";
import dayjs from "dayjs";
import type { AdminRentalModalProps } from "../types/prop";
import type { CustomerInfo } from "../types/common";
import { createRental } from "../services/rentServices";
import { searchCustomers } from "../services/customerServices";

const AdminRentalModal: React.FC<AdminRentalModalProps> = ({
  vehicle_id,
  open,
  onCancel,
  onRentSuccess,
}) => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );

  // 搜索顾客
  const handleSearch = async () => {
    try {
      const result = await searchCustomers(searchText); // 调用搜索服务函数
      setCustomers(result);
    } catch (error) {
      message.error("搜索顾客失败");
      console.error("Error searching customers:", error);
    }
  };

  // 提交租赁
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const startDate = dayjs(values.startDate);
      const endDate = dayjs(values.endDate);
      const durationDays = endDate.diff(startDate, "day");

      if (durationDays <= 0) {
        message.error("租赁天数至少为 1 天");
        return;
      }

      if (!selectedCustomerId) {
        message.error("请先选择一个顾客");
        return;
      }

      const rentalData = {
        start_time: startDate.toISOString(),
        duration_days: durationDays,
      };

      await createRental(selectedCustomerId, vehicle_id, rentalData); // 调用服务函数
      form.resetFields(); // 重置表单
      onCancel(); // 关闭模态框
      onRentSuccess(); // 调用父组件传递的回调函数
    } catch (error) {
      message.error("表单验证失败，请检查输入");
      console.error("Form validation failed:", error);
    }
  };

  // 列定义
  const customerColumns = [
    {
      title: "姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "身份证号",
      dataIndex: "id_card",
      key: "id_card",
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: CustomerInfo) => (
        <Button
          type="link"
          onClick={() => setSelectedCustomerId(record.customer_id)}
        >
          选择
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title="管理员租赁车辆"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="确认租赁"
      cancelText="取消"
      width={800}
    >
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="按姓名或身份证号搜索顾客"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
      </Space>

      <Table
        dataSource={customers}
        columns={customerColumns}
        rowKey="customer_id"
        pagination={{ pageSize: 5 }}
        onRow={(record) => ({
          onClick: () => setSelectedCustomerId(record.customer_id), // 点击行时触发
          style: {
            backgroundColor:
              record.customer_id === selectedCustomerId ? "#e6f7ff" : "white", // 内联样式
            cursor: "pointer", // 鼠标悬停时显示手型
          },
        })}
      />

      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="startDate"
          label="开始日期"
          rules={[{ required: true, message: "请选择开始日期" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="结束日期"
          rules={[{ required: true, message: "请选择结束日期" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdminRentalModal;
