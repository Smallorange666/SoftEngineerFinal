import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import type { User } from "../types";

const ProfilePage: React.FC<User> = ({ user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取用户信息
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${user.user_id}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "无法获取用户信息");
      }

      const profileData = await response.json();
      form.setFieldsValue(profileData); // 将数据填充到表单中
    } catch (error: any) {
      message.error("获取用户信息失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 提交更新
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/customers/${user.customer_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新失败");
      }

      message.success("个人信息更新成功");
    } catch (error: any) {
      message.error("更新失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchProfile();
    }
  }, [user?.user_id]);

  return (
    <div>
      <h2>个人信息</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: "请输入姓名" }]}
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
          name="id_card"
          label="身份证号"
          rules={[
            { required: true, message: "请输入身份证号" },
            { pattern: /^\d{17}[\dXx]$/, message: "身份证号格式不正确" },
          ]}
        >
          <Input placeholder="请输入身份证号" />
        </Form.Item>
        <Form.Item name="address" label="地址">
          <Input placeholder="请输入地址" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProfilePage;
