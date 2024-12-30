import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Card, message } from "antd";
import { sha256 } from "crypto-hash"; // 用于哈希密码

interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
}

const LoginPage: React.FC<{
  onLoginSuccess: (user: {
    id: number;
    username: string;
    role: string;
  }) => void;
}> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchUser = async (username: string) => {
    try {
      const response = await fetch(`/api/user?username=${username}`);
      if (!response.ok) {
        throw new Error("服务器出问题啦，请稍后再试");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message); // 用户不存在
      }
      return data;
    } catch (error) {
      throw new Error("服务器出问题啦，请稍后再试");
    }
  };

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      // 拉取用户信息
      const user = await fetchUser(values.username);

      // 哈希输入的密码
      const passwordHash = await sha256(values.password);
      if (passwordHash !== user.passwordHash) {
        message.error("密码错误");
        form.setFields([{ name: "password", errors: ["密码错误"] }]);
        return;
      }

      // 登录成功
      message.success("登录成功");
      onLoginSuccess({ id: user.id, username: user.username, role: user.role });
      navigate("/"); // 跳转到主页面
    } catch (error: any) {
      if (error.message === "用户不存在") {
        message.error("用户不存在");
        form.setFields([{ name: "username", errors: ["用户不存在"] }]);
      } else {
        message.error("服务器出问题啦，请稍后再试");
      }
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
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
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
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
