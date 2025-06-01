export const PHONE_PATTERN = /^\d{11}$/;
export const ID_CARD_PATTERN = /^\d{17}[\dXx]$/;
export const PLATE_NUMBER_PATTERN = /^[\u4e00-\u9fa5]{1}[A-Z]{1}[A-Z_0-9]{5}$/;

export interface User {
  user: {
    user_id: number;
    username: string;
    role: string;
    customer_id: number;
  };
}

export interface CustomerInfo {
  customer_id: number;
  username: string;
  name: string;
  phone: string;
  address: string;
  id_card: string;
  money: number;
}

export interface CreateCustomerInfo extends CustomerInfo {
  password: string;
  role: string;
}

export interface VehicleInfo {
  vehicle_id: number;
  plate_number: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  price_per_day: number;
  status: string;
}

export interface PersonalRentalInfo {
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

export interface BaseRentalInfo {
  rental_id: number;
  plate_number: string;
  name: string;
  phone: string;
  total_fee: number;
}

export interface OngoningRentalInfo extends BaseRentalInfo {
  expected_return_time: string;
}

export interface OverdueRentalInfo extends OngoningRentalInfo {}

export interface FinishedRentalInfo extends BaseRentalInfo {
  actual_return_time: string;
}

export interface CancelledRentalInfo extends BaseRentalInfo {}
