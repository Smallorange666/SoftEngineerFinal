import React from "react";
import { Modal, Button } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { ReturnModalProps } from "../types";
import { returnRental } from "../services/rentServices";

const ReturnRentalModal: React.FC<ReturnModalProps> = ({
  rental_id,
  open,
  onCancel,
  onReturnSuccess,
}) => {
  const handleSubmit = async () => {
    try {
      // 执行归还操作
      await returnRental(rental_id); // 调用归还接口
      onReturnSuccess(); // 触发归还成功回调
      onCancel(); // 关闭模态框
    } catch (error) {
      console.error("归还失败:", error);
    }
  };

  return (
    <Modal
      title={
        <span>
          <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
          归还租赁
        </span>
      }
      open={open}
      onCancel={onCancel} // 关闭模态框
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          确认归还
        </Button>,
      ]}
    >
      <p>您确定要归还该租赁吗？请确认车辆已检查无误。</p>
    </Modal>
  );
};

export default ReturnRentalModal;
