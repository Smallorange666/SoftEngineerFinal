import React from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { Vehicle } from "../types.ts";

interface AddVehicleModalProps {
  visible: boolean; // 控制 Modal 显示
  onCancel: () => void; // 关闭 Modal
  onCreate: (values: Omit<Vehicle, "vehicle_id">) => void; // 提交表单
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  visible,
  onCancel,
  onCreate,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values); // 调用父组件传递的 onCreate 方法
      form.resetFields(); // 重置表单
    } catch (error) {
      message.error("表单验证失败，请检查输入");
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      title="新增车辆"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="创建"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="type"
          label="车辆类型"
          rules={[{ required: true, message: "请输入车辆类型" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="brand"
          label="品牌"
          rules={[{ required: true, message: "请输入品牌" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="model"
          label="型号"
          rules={[{ required: true, message: "请输入型号" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="color"
          label="颜色"
          rules={[{ required: true, message: "请输入颜色" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="price_per_day"
          label="日租金（元）"
          rules={[{ required: true, message: "请输入日租金" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="plate_number"
          label="车牌号"
          rules={[{ required: true, message: "请输入车牌号" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVehicleModal;
