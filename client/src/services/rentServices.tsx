import { message } from "antd";

const API_BASE_URL = "http://localhost:5000/api";

export const fetchOngoingRental = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals/ongoing`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    message.error("获取进行中租赁信息失败：" + error.message);
    throw error;
  }
};

export const fetchOverdueRental = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals/overdue`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    message.error("获取逾期租赁信息失败：" + error.message);
    throw error;
  }
};

export const fetchFinishedRental = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals/finished`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    message.error("获取已完成租赁信息失败：" + error.message);
    throw error;
  }
};

export const fetchCancelledRental = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals/cancelled`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    message.error("获取已取消租赁信息失败：" + error.message);
    throw error;
  }
};

export const createRental = async (
  customer_id: number,
  vehicle_id: number,
  values: any
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id,
        vehicle_id,
        ...values,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("租赁创建成功");
  } catch (error: any) {
    message.error("租赁创建失败：" + error.message);
    throw error;
  }
};

export const cancelRental = async (rental_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals/${rental_id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("租赁取消成功");
  } catch (error: any) {
    message.error("租赁取消失败：" + error.message);
    throw error;
  }
};

export const returnRental = async (rental_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals/${rental_id}`, {
      method: "PATCH",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("租赁归还成功");
  } catch (error: any) {
    message.error("租赁归还失败：" + error.message);
    throw error;
  }
};
