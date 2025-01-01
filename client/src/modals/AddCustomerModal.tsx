import React from "react";
import { Modal, Form, Input, message } from "antd";
import type { AddCustomerModalProps } from "../types";

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  visible,
  onCancel,
  onCreate,
}) => {
  const [form] = Form.useForm();

  // 生成8位随机字符串
  const generateRandomString = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const username = generateRandomString(); // 生成用户名
      const password = username; // 密码与用户名相同
      const role = "customer"; // 角色固定为 customer

      // 将生成的用户名、密码和角色添加到表单值中
      const userData = {
        ...values,
        username,
        password,
        role,
      };

      onCreate(userData); // 调用父组件传递的 onCreate 方法
      form.resetFields(); // 重置表单
    } catch (error) {
      message.error("表单验证失败，请检查输入");
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title="新增用户"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="创建"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: "请输入姓名" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ required: true, message: "请输入手机号" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="address"
          label="地址"
          rules={[{ required: false, message: "请输入地址" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="id_card"
          label="身份证号"
          rules={[{ required: true, message: "请输入身份证号" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomerModal;
