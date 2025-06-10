import { message } from "antd";
import { User } from "../types/common";
import { API_BASE_URL } from "../config";

export const login = async (
  username: string,
  password: string
): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const userData: User = await response.json();
    return userData;
  } catch (error: any) {
    throw new Error("登录失败：" + error.message);
  }
};

export const modifyPassword = async (user_id: number, values: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${user_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: values.password,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
  } catch (error: any) {
    message.error("修改密码失败" + error.message);
    throw error;
  }
};

export const deleteAccount = async (user_id: number, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${user_id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        password: password,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
  } catch (error: any) {
    message.error("注销账号失败" + error.message);
    throw error;
  }
};
