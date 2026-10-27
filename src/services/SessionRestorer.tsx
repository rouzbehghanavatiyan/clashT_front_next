"use client";

import { useAuthInitialization } from "@/hooks/useAuthInitialization";

export const SessionRestorer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useAuthInitialization();
  return <>{children}</>;
};
