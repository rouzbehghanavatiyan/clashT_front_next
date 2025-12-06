import * as MuiIcons from "@mui/icons-material";

type MuiIconName = keyof typeof MuiIcons;

interface IconProps {
  name: MuiIconName | string;
  className?: string;
  onClick?: () => void;
  color?: string;
  fontSize?: "small" | "medium" | "large" | "inherit";
  sx?: Record<string, any>;
  // سایر props...
}

export const Icon = ({ name, ...props }: IconProps) => {
  if (typeof name !== "string") {
    console.warn(`Icon name must be a string, received: ${typeof name}`);
    return null;
  }

  const IconComponent = (MuiIcons as Record<string, any>)[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in @mui/icons-material`);
    return null;
  }

  return <IconComponent {...props} />;
};