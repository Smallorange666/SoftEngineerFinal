import { message } from "antd";

const API_BASE_URL = "http://localhost:5000/api";

// 获取车辆列表
export const fetchAllVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    message.error("获取车辆列表失败：" + error.message);
    throw error;
  }
};

export const fetchVehicleByID = async (vehicle_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicle_id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    const data = await response.json();
    return data;
  } catch (error: any) {
    message.error("获取车辆信息失败：" + error.message);
    throw error;
  }
};

export const updateVehicle = async (vehicle_id: number, values: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicle_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
  } catch (error: any) {
    message.error("更新车辆信息失败" + error.message);
    throw error;
  }
};

// 删除车辆
export const deleteVehicle = async (vehicle_id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles/${vehicle_id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("车辆删除成功");
  } catch (error: any) {
    message.error("车辆删除失败：" + error.message);
    throw error;
  }
};

// 创建车辆
export const createVehicle = async (values: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
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
    message.success("车辆创建成功");
  } catch (error: any) {
    message.error("车辆创建失败：" + error.message);
    throw error;
  }
};

// 租赁车辆
export const rentVehicle = async (
  vehicleId: number,
  customerId: number,
  values: { start_time: string; duration_days: number }
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rentals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicle_id: vehicleId,
        customer_id: customerId,
        start_time: values.start_time,
        duration_days: values.duration_days,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }
    message.success("租赁成功");
  } catch (error: any) {
    message.error("租赁失败：" + error.message);
    throw error;
  }
};
