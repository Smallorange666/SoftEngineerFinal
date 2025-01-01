import React from "react";
import { Modal, Form, DatePicker, message } from "antd";
import type { RentalModalProps } from "../types";
import dayjs from "dayjs";

const RentModal: React.FC<RentalModalProps> = ({ open, onCancel, onRent }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
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

      onRent(rentalData); // 将表单数据传递给父组件
      form.resetFields(); // 重置表单
    } catch (error) {
      message.error("表单验证失败，请检查输入");
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title="租赁车辆"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="确认租赁"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
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
