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
