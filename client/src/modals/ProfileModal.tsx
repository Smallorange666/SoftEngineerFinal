import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import type { UpdateProfileModalProps } from "../types";
import {
  fetchCustomerById,
  updateCustomer,
} from "../services/customerServices"; // 导入服务函数

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  user,
  visible,
  onCancel,
  onUpdateProfileSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取用户信息
  const fillProfile = async () => {
    setLoading(true);
    try {
      fetchCustomerById(user.customer_id).then((data) => {
        form.setFieldsValue(data);
      });
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
      await updateCustomer(user.customer_id, values); // 调用服务函数
      message.success("个人信息更新成功");
      onCancel(); // 关闭模态框
      onUpdateProfileSuccess(); // 调用父组件传递的回调函数
    } catch (error: any) {
      message.error("更新失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && user?.user_id) {
      fillProfile();
    }
  }, [visible, user?.user_id]);

  return (
    <Modal
      title="更改信息"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="提交"
      cancelText="取消"
      confirmLoading={loading}
    >
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
      </Form>
    </Modal>
  );
};

export default UpdateProfileModal;
