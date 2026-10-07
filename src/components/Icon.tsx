import * as MuiIcons from "@mui/icons-material";

type MuiIconName = keyof typeof MuiIcons;

interface IconProps {
  name: MuiIconName | string;
  size?: number | string;
  className?: string;
  onClick?: () => void;
  color?: "inherit" | "action" | "disabled" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  fontSize?: "small" | "medium" | "large" | "inherit";
  sx?: Record<string, any>;
  [key: string]: any;
}

export const Icon = ({ name, size, sx, ...props }: IconProps) => {
  if (typeof name !== "string") {
    console.warn(`Icon name must be a string, received: ${typeof name}`);
    return null;
  }

  // تبدیل نام‌هایی مثل "person" به "Person" برای سازگاری با MUI
  const formattedName =
    name.charAt(0).toUpperCase() + name.slice(1);

  const IconComponent =
    (MuiIcons as Record<string, any>)[name] ||
    (MuiIcons as Record<string, any>)[formattedName];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in @mui/icons-material`);
    return null;
  }

  // ادغام size عددی با sx
  const combinedSx = size ? { fontSize: size, ...sx } : sx;

  return <IconComponent sx={combinedSx} {...props} />;
};
