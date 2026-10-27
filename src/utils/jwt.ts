import { jwtDecode } from "jwt-decode";

const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    return jwtDecode<Record<string, unknown>>(token);
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string): number | null {
  const decoded = decodeJwtPayload(token);
  if (!decoded) return null;

  const raw =
    decoded.userId ??
    decoded.UserId ??
    decoded.id ??
    decoded.nameid ??
    decoded.sub ??
    decoded[NAME_IDENTIFIER_CLAIM];

  const userId = Number(raw);
  if (!userId || Number.isNaN(userId)) return null;
  return userId;
}
