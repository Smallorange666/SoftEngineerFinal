import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";

interface RegisterModalProps {
  visible: boolean; // 控制 Modal 显示/隐藏
  onCancel: () => void; // 关闭 Modal 的回调
  onRegisterSuccess: () => void; // 注册成功后的回调
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  visible,
  onCancel,
  onRegisterSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: {
    username: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone: string;
    address: string;
    idCard: string;
  }) => {
    // 校验密码和确认密码是否一致
    if (values.password !== values.confirmPassword) {
      message.error("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      // 调用后端 API 注册用户
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          name: values.name,
          phone: values.phone,
          id_card: values.idCard,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // 注册成功
      message.success("注册成功");
      onRegisterSuccess(); // 执行注册成功后的回调
      form.resetFields(); // 重置表单
      onCancel(); // 关闭 Modal
    } catch (error: any) {
      message.error("注册失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="注册用户"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="注册"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} onFinish={handleRegister}>
        <Form.Item
          name="username"
          rules={[
            { required: true, message: "请输入用户名" },
            { min: 3, message: "用户名至少 3 个字符" },
            { max: 20, message: "用户名最多 20 个字符" },
          ]}
        >
          <Input placeholder="用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "请输入密码" },
            { min: 6, message: "密码至少 6 个字符" },
          ]}
        >
          <Input.Password placeholder="密码" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          rules={[
            { required: true, message: "请确认密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        >
          <Input.Password placeholder="确认密码" />
        </Form.Item>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "请输入姓名" },
            { min: 2, message: "姓名至少 2 个字符" },
            { max: 50, message: "姓名最多 50 个字符" },
          ]}
        >
          <Input placeholder="姓名" />
        </Form.Item>
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: "请输入手机号" },
            { pattern: /^\d{11}$/, message: "手机号格式不正确" },
          ]}
        >
          <Input placeholder="手机号" />
        </Form.Item>
        <Form.Item
          name="address"
          rules={[
            { required: false, message: "请输入地址" },
            { max: 200, message: "地址最多 200 个字符" },
          ]}
        >
          <Input placeholder="地址" />
        </Form.Item>
        <Form.Item
          name="idCard"
          rules={[
            { required: true, message: "请输入身份证号" },
            { pattern: /^\d{17}[\dXx]$/, message: "身份证号格式不正确" },
          ]}
        >
          <Input placeholder="身份证号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RegisterModal;
