import GenericModal from "@/components/modals/generic-modal";
import { useTranslation } from "react-i18next";

type ConfirmModalProps = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ open, message, onConfirm, onCancel }: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <GenericModal
      open={open}
      title={t('Confirm')}
      onClose={onCancel}
      onCancel={onCancel}
      actions={[{ label: t('Yes'), listener: onConfirm }]}
    >
      {message}
    </GenericModal>
  );
}
