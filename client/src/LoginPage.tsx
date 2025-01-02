import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Card, message } from "antd";
import RegisterModal from "./modals/RegisterModal";
import type { User } from "./types";

const LoginPage: React.FC<{
  onLoginSuccess: (user: {
    user_id: number;
    username: string;
    role: string;
    customer_id: number;
  }) => void;
}> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false); // 控制注册 Modal 的显示

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // 调用后端登录接口
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      // 解析登录成功的响应数据
      const userData: User = await response.json();

      // 登录成功
      message.success("登录成功");
      onLoginSuccess({
        user_id: userData.user.user_id,
        username: userData.user.username,
        role: userData.user.role,
        customer_id: userData.user.customer_id,
      });
      navigate("/"); // 跳转到主页面
    } catch (error: any) {
      message.error("登录失败：" + error.message);
      form.setFields([
        { name: "username", errors: [] },
        { name: "password", errors: ["用户名或密码错误"] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Card title="登录" style={{ width: 300 }}>
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
            <Button
              type="link"
              block
              onClick={() => setIsRegisterModalVisible(true)}
            >
              注册
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 注册 Modal */}
      <RegisterModal
        open={isRegisterModalVisible}
        onCancel={() => setIsRegisterModalVisible(false)}
        onRegisterSuccess={() => {
          message.success("注册成功，请登录");
          setIsRegisterModalVisible(false);
        }}
      />
    </div>
  );
};

export default LoginPage;
