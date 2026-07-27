import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,

} from '@mui/material';
import type React from 'react';
import { useTranslation } from 'react-i18next';


type GenericModalProps = {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  actions?: { label: string, listener: () => void }[]
  onClose: () => void;
  onCancel?: () => void;
};

export default function GenericModal({
  children,
  title,
  actions,
  onClose,
  open,
  onCancel
}: GenericModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        {children}
      </DialogContent>


      <DialogActions>
        {onCancel && <Button onClick={onCancel}>{t('Cancel')}</Button>}
        {actions && actions.map((item) =>
          <Button onClick={item.listener} variant="contained">
            {item.label}
          </Button>
        )}

      </DialogActions>
    </Dialog>
  );
}
