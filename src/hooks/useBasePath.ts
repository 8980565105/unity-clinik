// hooks/useBasePath.ts
// ─────────────────────────────────────────────────────────────
// Role-based route prefix hook
// Admin       → ""              (e.g. /categories)
// Store Owner → "/store_owner"  (e.g. /store_owner/categories)
// ─────────────────────────────────────────────────────────────
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export const useBasePath = (): string => {
  const role = useSelector((state: RootState) => state.auth?.user?.role);
  return role === "store_owner" ? "/store_owner" : "";
};
