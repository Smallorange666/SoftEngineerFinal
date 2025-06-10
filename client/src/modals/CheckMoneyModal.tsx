import React, { useEffect, useState } from 'react';
import { Modal, InputNumber, Form, Button, Typography, message } from 'antd';
import { API_BASE_URL } from "../config";

interface Props {
  customer_id: number;
  open: boolean;
  onClose: () => void;
}

const CheckMoneyModal: React.FC<Props> = ({ customer_id, open, onClose }) => {
  const [money, setmoney] = useState<number>(0);
  const [amount, setAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch(`${API_BASE_URL}/money/${customer_id}`)
        .then(res => res.json())
        .then(data => setmoney(data.money))
        .catch(() => message.error('获取余额失败'));
    }
  }, [open, customer_id]);

  const handleRecharge = async () => {
    if (!amount || amount <= 0) {
      message.warning('请输入有效充值金额');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/money/${customer_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '充值失败');
      setmoney(data.new_money);
      message.success('充值成功');
      setAmount(null);
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="余额查询与充值" destroyOnClose>
      <Typography.Paragraph>
        当前余额：<strong>¥{money}</strong>
      </Typography.Paragraph>

      <Form layout="inline" onFinish={handleRecharge}>
        <Form.Item label="充值金额">
          <InputNumber
            value={amount ?? undefined}
            onChange={value => setAmount(value ?? null)}
            placeholder="请输入金额"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            充值
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CheckMoneyModal;