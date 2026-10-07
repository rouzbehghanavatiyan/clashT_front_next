// src/components/ui/Icon.tsx
"use client";

import React, { useMemo } from "react";
import * as MdIcons from "react-icons/md";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const formatIconName = (name: string): string => {
  if (!name) return "";
  const cleaned = name.replace(/Icon$/, "");
  const pascal = cleaned
    .replace(/(^\w|-\w)/g, (clear) => clear.replace("-", "").toUpperCase())
    .replace(/^[a-z]/, (char) => char.toUpperCase());

  return pascal.startsWith("Md") ? pascal : `Md${pascal}`;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  className = "",
  onClick,
  style,
}) => {
  const componentName = useMemo(() => formatIconName(name), [name]);

  // انتخاب آیکون مناسب از پکیج Material
  const IconComponent =
    (MdIcons as Record<string, any>)[componentName] || MdIcons.MdHelpOutline;

  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      className={`inline-block shrink-0 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <IconComponent size={size} color={color} />
    </span>
  );
};

export default Icon;
