import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, message } from "antd";
import { fetchVehicleById, updateVehicle } from "../services/vehicleServices"; // 导入服务函数
import { UpdateVehicleModalProps } from "../types";

const UpdateVehicleModal: React.FC<UpdateVehicleModalProps> = ({
  vehicle_id,
  visible,
  onCancel,
  onUpdateSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 车牌号正则验证
  const plateNumberPattern = /^[\u4e00-\u9fa5][A-Z][A-Z0-9]{5}$/;

  // 获取车辆信息并填充表单
  const fillForm = async () => {
    setLoading(true);
    try {
      if (vehicle_id !== null) {
        const vehicleData = await fetchVehicleById(vehicle_id);
        form.setFieldsValue(vehicleData);
      }
    } catch (error: any) {
      message.error("获取车辆信息失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 提交更新
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (vehicle_id !== null) {
        await updateVehicle(vehicle_id, values); // 调用服务函数
        message.success("车辆信息更新成功");
        onCancel(); // 关闭模态框
        onUpdateSuccess(); // 调用父组件传递的回调函数
      }
    } catch (error: any) {
      message.error("更新失败：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 当 modal 可见且 vehicle_id 变化时，填充表单
  useEffect(() => {
    if (visible && vehicle_id !== null) {
      fillForm();
    }
  }, [visible, vehicle_id]);

  return (
    <Modal
      title="更新车辆信息"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="提交"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="type"
          label="车辆类型"
          rules={[
            { required: true, message: "请输入车辆类型" },
            { max: 50, message: "车辆类型不能超过 50 个字符" },
          ]}
        >
          <Input placeholder="请输入车辆类型" />
        </Form.Item>
        <Form.Item
          name="brand"
          label="品牌"
          rules={[
            { required: true, message: "请输入品牌" },
            { max: 50, message: "品牌不能超过 50 个字符" },
          ]}
        >
          <Input placeholder="请输入品牌" />
        </Form.Item>
        <Form.Item
          name="model"
          label="型号"
          rules={[
            { required: true, message: "请输入型号" },
            { max: 50, message: "型号不能超过 50 个字符" },
          ]}
        >
          <Input placeholder="请输入型号" />
        </Form.Item>
        <Form.Item
          name="color"
          label="颜色"
          rules={[
            { required: true, message: "请输入颜色" },
            { max: 20, message: "颜色不能超过 20 个字符" },
          ]}
        >
          <Input placeholder="请输入颜色" />
        </Form.Item>
        <Form.Item
          name="price_per_day"
          label="日租金（元）"
          rules={[
            { required: true, message: "请输入日租金" },
            { type: "number", min: 0, message: "日租金必须为正数" },
          ]}
        >
          <InputNumber placeholder="请输入日租金" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="plate_number"
          label="车牌号"
          rules={[
            { required: true, message: "请输入车牌号" },
            {
              pattern: plateNumberPattern,
              message: "车牌号格式不正确（例：粤A12345）",
            },
          ]}
        >
          <Input placeholder="请输入车牌号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateVehicleModal;
