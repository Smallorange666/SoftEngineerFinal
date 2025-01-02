import React from "react";
import { Modal, Form, DatePicker, message } from "antd";
import type { RentalModalProps } from "../types";
import dayjs from "dayjs";
import { createRental } from "../services/rentServices";

const RentModal: React.FC<RentalModalProps> = ({
  customer_id,
  vehicle_id,
  open,
  onCancel,
  onRentSuccess,
}) => {
  const [form] = Form.useForm();

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

      const rentalData = {
        start_time: startDate.toISOString(),
        duration_days: durationDays,
      };

      await createRental(customer_id, vehicle_id, rentalData); // 调用服务函数
      form.resetFields(); // 重置表单
      onCancel(); // 关闭模态框
      onRentSuccess(); // 调用父组件传递的回调函数
    } catch (error) {
      message.error("表单验证失败，请检查输入");
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title="租赁车辆"
      open={open}
      onOk={() => form.submit()}
      onCancel={onCancel}
      okText="确认租赁"
      cancelText="取消"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
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

export default RentModal;
