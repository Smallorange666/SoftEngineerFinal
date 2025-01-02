import React, { useEffect, useState } from "react";
import { Modal, Form, Input, message } from "antd";
import type { UpdateProfileModalProps } from "../types";
import {
  fetchCustomerByID,
  updateCustomer,
} from "../services/customerServices"; // 导入服务函数

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  user,
  customer_id,
  open,
  onCancel,
  onUpdateProfileSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取用户信息
  const fillForm = async () => {
    setLoading(true);
    try {
      form.setFieldValue("username", user.username);
      fetchCustomerByID(customer_id).then((data) => {
        form.setFieldsValue(data);
      });
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 提交更新
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await updateCustomer(customer_id, values); // 调用服务函数
      onCancel(); // 关闭模态框
      if (user.username === values.username) {
        onCancel();
      } else {
        onUpdateProfileSuccess(); // 调用父组件传递的回调函数
      }
    } catch (error: any) {
      message.error("更新失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && customer_id) {
      fillForm();
    }
  }, [open, customer_id]);

  return (
    <Modal
      title="更改信息"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="提交"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          label="用户名（修改后需要重新登录，建议先修改密码）"
          rules={[
            { required: true, message: "请输入用户名" },
            { min: 3, message: "用户名至少 3 个字符" },
            { max: 20, message: "用户名最多 20 个字符" },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
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
          name="id_card"
          label="身份证号"
          rules={[
            { required: true, message: "请输入身份证号" },
            { pattern: /^\d{17}[\dXx]$/, message: "身份证号格式不正确" },
          ]}
        >
          <Input placeholder="请输入身份证号" />
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
      </Form>
    </Modal>
  );
};

export default UpdateProfileModal;
