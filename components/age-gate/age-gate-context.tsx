"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import {
  readAgeConfirmationFromStorage,
  writeAgeConfirmationToStorage,
  type AgeConfirmationChoice
} from "@/lib/age-confirmation-storage";

export type AgeGateStatus = "loading" | "unknown" | AgeConfirmationChoice;

type AgeGateContextValue = {
  status: AgeGateStatus;
  isConfirmed: boolean;
  confirm21Plus: () => void;
  decline21Plus: () => void;
};

const AgeGateContext = createContext<AgeGateContextValue | null>(null);

export function AgeGateProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AgeGateStatus>("loading");

  useEffect(() => {
    const stored = readAgeConfirmationFromStorage();
    setStatus(stored ?? "unknown");
  }, []);

  const confirm21Plus = useCallback(() => {
    writeAgeConfirmationToStorage("confirmed");
    setStatus("confirmed");
  }, []);

  const decline21Plus = useCallback(() => {
    writeAgeConfirmationToStorage("declined");
    setStatus("declined");
  }, []);

  const value = useMemo(
    () => ({
      status,
      isConfirmed: status === "confirmed",
      confirm21Plus,
      decline21Plus
    }),
    [status, confirm21Plus, decline21Plus]
  );

  return <AgeGateContext.Provider value={value}>{children}</AgeGateContext.Provider>;
}

export function useAgeGate(): AgeGateContextValue {
  const ctx = useContext(AgeGateContext);
  if (!ctx) {
    throw new Error("useAgeGate must be used within AgeGateProvider");
  }
  return ctx;
}

/** Safe when provider is optional (returns confirmed=true outside provider). */
export function useAgeGateOptional(): AgeGateContextValue | null {
  return useContext(AgeGateContext);
}
