export interface User {
  user: {
    user_id: number;
    username: string;
    role: string;
    customer_id: number;
  };
}

export interface AppProps extends User {
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

export interface AddVehicleModalProps {
  open: boolean; // 控制 Modal 显示
  onCancel: () => void; // 关闭 Modal
  onCreate: (values: Omit<Vehicle, "vehicle_id">) => void; // 提交表单
}

export interface RentalModalProps {
  customer_id: number; // 用户 ID
  vehicle_id: number; // 车辆 ID
  open: boolean; // 控制 Modal 显示
  onCancel: () => void; // 关闭 Modal
  onRentSuccess: () => void; // 租赁成功回调
}

export interface RentalInfo {
  rental_id: number;
  vehicle_id: number;
  customer_id: number;
  start_time: string;
  duration_days: number;
  expected_return_time: string;
  actual_return_time: string | null;
  total_fee: number;
  status: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  price_per_day: number;
}

export interface AddCustomerModalProps {
  open: boolean; // 控制模态框显示
  onCancel: () => void; // 取消按钮回调
  onCreateSuccess: () => void; // 创建成功回调
}

export interface UpdateProfileModalProps extends User {
  customer_id: number;
  open: boolean;
  onCancel: () => void;
  onUpdateProfileSuccess: () => void;
}

export interface CustomerInfo {
  customer_id: number;
  username: string;
  name: string;
  phone: string;
  address: string;
  id_card: string;
}

export interface CreateCustomerInfo extends CustomerInfo {
  password: string;
  role: string;
}

export interface ModifyPasswordModalProps extends User {
  open: boolean; // 控制模态框显示/隐藏
  onCancel: () => void; // 关闭模态框的回调
  onModifySuccess: () => void; // 修改成功的回调
}

export interface DeleteAccountModalProps extends User {
  open: boolean; // 控制模态框显示/隐藏
  onCancel: () => void; // 关闭模态框的回调s
  onDeleteAccountSuccess: () => void; // 注销账号的回调
}

export interface UpdateVehicleModalProps {
  vehicle_id: number | null;
  open: boolean;
  onCancel: () => void;
  onUpdateSuccess: () => void;
}
