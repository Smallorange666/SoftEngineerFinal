import React, { useState } from "react";
import { Modal, Form, Input, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { DeleteAccountModalProps } from "../types";
import { deleteAccount } from "../services/userServices";

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  user,
  visible,
  onCancel,
  onDeleteAccountSuccess,
}) => {
  const [form] = Form.useForm();
  const [isConfirming, setIsConfirming] = useState(false); // 是否在二次确认状态
  const [formValues, setFormValues] = useState<{ password: string } | null>(
    null
  ); // 保存表单的值

  const handleSubmit = async () => {
    try {
      if (!isConfirming) {
        // 第一次确认，获取表单的值
        const values = await form.validateFields();
        setFormValues(values); // 保存表单的值
        setIsConfirming(true); // 进入二次确认状态
      } else {
        // 第二次确认，执行注销操作
        if (formValues) {
          console.log("values:", formValues);
          await deleteAccount(user.user_id, formValues.password);
          form.resetFields(); // 重置表单
          onDeleteAccountSuccess();
          onCancel(); // 关闭模态框
        }
      }
    } catch (error) {
      console.error("表单验证失败:", error);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#ff4d4f", marginRight: 8 }}
          />
          {isConfirming ? "确认注销账号" : "注销账号"}
        </span>
      }
      open={visible}
      onCancel={() => {
        form.resetFields(); // 重置表单
        setIsConfirming(false); // 重置确认状态
        setFormValues(null); // 清空保存的表单值
        onCancel(); // 关闭模态框
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" danger onClick={handleSubmit}>
          {isConfirming ? "确认注销" : "下一步"}
        </Button>,
      ]}
    >
      {isConfirming ? (
        <p>您确定要注销账号吗？此操作不可逆，请谨慎操作。</p>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            label="请输入密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default DeleteAccountModal;
