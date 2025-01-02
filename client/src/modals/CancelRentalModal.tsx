import React, { useState } from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { CancelRentalModalProps } from "../types";
import { cancelRental } from "../services/rentServices";

const CancelRentalModal: React.FC<CancelRentalModalProps> = ({
  rental_id,
  open,
  onCancel,
  onCancelSuccess,
}) => {
  const [isConfirming, setIsConfirming] = useState(false); // 是否在二次确认状态

  const handleSubmit = async () => {
    try {
      if (!isConfirming) {
        // 第一次确认，进入二次确认状态
        setIsConfirming(true);
      } else {
        // 第二次确认，执行取消租赁操作
        await cancelRental(rental_id); // 调用取消租赁的接口
        onCancel(); // 关闭模态框
        onCancelSuccess(); // 触发取消成功回调
      }
    } catch (error) {
      console.error("取消租赁失败:", error);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined
            style={{ color: "#ff4d4f", marginRight: 8 }}
          />
          {isConfirming ? "确认取消租赁" : "取消租赁"}
        </span>
      }
      open={open}
      onCancel={() => {
        setIsConfirming(false); // 重置确认状态
        onCancel(); // 关闭模态框
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" danger onClick={handleSubmit}>
          {isConfirming ? "确认取消" : "下一步"}
        </Button>,
      ]}
    >
      {isConfirming ? (
        <p>您确定要取消该租赁吗？此操作不可逆，请谨慎操作。</p>
      ) : (
        <p>您即将取消租赁，请确认是否继续。</p>
      )}
    </Modal>
  );
};

export default CancelRentalModal;
