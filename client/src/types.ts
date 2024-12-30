export interface AppProps {
  user: { user_id: number; username: string; role: string } | null;
  onLogout: () => void;
}

export interface Vehicle {
  vehicle_id: number;
  plate_number: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  price_per_day: number;
}

export interface VehicleInfo extends Vehicle {
  status: string; // 添加状态字段
}

export interface VehiclesPageProps {
  user: { user_id: number; role: string } | null;
}

export interface AddVehicleModalProps {
  visible: boolean; // 控制 Modal 显示
  onCancel: () => void; // 关闭 Modal
  onCreate: (values: Omit<Vehicle, "vehicle_id">) => void; // 提交表单
}

export interface RentalModalProps {
  open: boolean; // 控制 Modal 显示
  onCancel: () => void; // 关闭 Modal
  onRent: (values: { start_time: string; duration_days: number }) => void; // 提交表单
}
