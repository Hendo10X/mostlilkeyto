import { useToast as useToastContext } from "../components/ToastProvider";

export const useToast = () => {
  const { addToast } = useToastContext();

  return {
    success: (message: string) => addToast(message, "success"),
    error: (message: string) => addToast(message, "error"),
    info: (message: string) => addToast(message, "info"),
  };
};
