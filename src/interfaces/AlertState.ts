type AlertType = "success" | "error" | "info" | "warning";

export interface AlertState {
  open: boolean;
  message: string;
  type: AlertType;
  showAlert: (type: AlertType, message: string) => void;
  closeAlert: () => void;
}
