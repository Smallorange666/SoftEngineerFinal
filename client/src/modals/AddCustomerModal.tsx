import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import type { AddCustomerModalProps } from "../types";
import { createCustomer } from "../services/customerServices"; // 导入服务函数

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  open,
  onCancel,
  onCreateSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

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

  // 提交表单
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

      setLoading(true);
      await createCustomer(userData); // 调用服务函数
      onCreateSuccess(); // 执行创建成功后的回调
      form.resetFields(); // 重置表单
      onCancel(); // 关闭模态框
    } catch (error) {
      message.error("客户创建失败");
      console.error("Error creating customer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="新增用户"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="创建"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="姓名"
          rules={[
            { required: true, message: "请输入姓名" },
            { min: 1, message: "姓名至少 1 个字符" },
            { max: 50, message: "姓名最多 50 个字符" },
          ]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: "请输入手机号" },
            { pattern: /^\d{11}$/, message: "手机号格式不正确" },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
        <Form.Item
          name="address"
          label="地址"
          rules={[
            { required: false, message: "请输入地址" },
            { max: 200, message: "地址最多 200 个字符" },
          ]}
        >
          <Input placeholder="请输入地址" />
        </Form.Item>
        <Form.Item
          name="id_card"
          label="身份证号"
          rules={[
            { required: true, message: "请输入身份证号" },
            { pattern: /^\d{17}[\dXx]$/, message: "身份证号格式不正确" },
          ]}
        >
          <Input placeholder="请输入身份证号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomerModal;
