import GenericModal from "@/components/modals/generic-modal";
import { Alert } from '@mui/material';
import { useTranslation } from "react-i18next";

type AlertType = 'success' | 'error' | 'warning' | 'info';

type AlertModalProps = {
  open: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
};

export default function AlertModal({
  open,
  title,
  message,
  type = 'info',
  onClose,
}: AlertModalProps) {
  const { t } = useTranslation();

  return (
    <GenericModal
      open={open}
      title={title || t('Alert')}
      onClose={onClose}
      onCancel={onClose}
      actions={[{ label: t('OK'), listener: onClose }]}
    >
      <Alert severity={type}>{message}</Alert>
    </GenericModal>
  );
}
