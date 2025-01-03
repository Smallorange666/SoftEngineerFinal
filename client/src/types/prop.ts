import { User } from "./common";

export interface AppProps extends User {
  onLogout: () => void;
}

export interface ModifyPasswordModalProps extends User {
  open: boolean;
  onCancel: () => void;
  onModifySuccess: () => void;
}

export interface DeleteAccountModalProps extends User {
  open: boolean;
  onCancel: () => void;
  onDeleteAccountSuccess: () => void;
}

export interface AddCustomerModalProps {
  open: boolean;
  onCancel: () => void;
  onCreateSuccess: () => void;
}

export interface UpdateProfileModalProps extends User {
  customer_id: number;
  open: boolean;
  onCancel: () => void;
  onUpdateProfileSuccess: () => void;
}

export interface AddVehicleModalProps {
  open: boolean;
  onCancel: () => void;
  onAddSuccess: () => void;
}

export interface UpdateVehicleModalProps {
  vehicle_id: number | null;
  open: boolean;
  onCancel: () => void;
  onUpdateSuccess: () => void;
}

export interface AdminRentalModalProps {
  vehicle_id: number;
  open: boolean;
  onCancel: () => void;
  onRentSuccess: () => void;
}

export interface CustomerRentalModalProps extends AdminRentalModalProps {
  customer_id: number;
}

export interface CancelRentalModalProps {
  rental_id: number;
  open: boolean;
  onCancel: () => void;
  onCancelSuccess: () => void;
}

export interface ReturnModalProps {
  rental_id: number;
  open: boolean;
  onCancel: () => void;
  onReturnSuccess: () => void;
}
