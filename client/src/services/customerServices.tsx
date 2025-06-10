import { message } from "antd";
import { API_BASE_URL } from "../config";

export const fetchAllCustomers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/all`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    message.error("获取客户列表失败：" + error.message);
    throw error;
  }
};

export const fetchCustomerByID = async (customer_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customer_id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    message.error("获取客户信息失败：" + error.message);
    throw error;
  }
};

export const searchCustomers = async (searchText: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/customers?search=${searchText}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching customers:", error);
    throw error;
  }
};

export const deleteCustomer = async (customer_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customer_id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("客户删除成功");
  } catch (error: any) {
    message.error("客户删除失败：" + error.message);
    throw error;
  }
};

export const createCustomer = async (values: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("客户创建成功");
  } catch (error: any) {
    message.error("客户创建失败：" + error.message);
    throw error;
  }
};

export const updateCustomer = async (customer_id: number, values: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${customer_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
  } catch (error: any) {
    message.error("更新信息失败：" + error.message);
    throw error;
  }
};
