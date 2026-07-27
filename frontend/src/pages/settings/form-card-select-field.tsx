import { TextField, MenuItem } from "@mui/material";

type Option = {
  value: string;
  label: string;
};

type FormCardSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
};

export default function FormCardSelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: FormCardSelectFieldProps) {
  return (
    <TextField
      fullWidth
      select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      size="small"
    >
      {options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
