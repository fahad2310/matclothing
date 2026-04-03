"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = "high" | "medium" | "low";

interface DeviceCapability {
  tier: DeviceTier;
  hasWebGL: boolean;
  isMobile: boolean;
  supportsWebGL2: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

function detectMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function detectSlowConnection(): boolean {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
  };
  const conn = nav.connection;
  if (!conn) return false;
  return conn.effectiveType === "2g" || conn.effectiveType === "slow-2g";
}

function calculateTier(): DeviceCapability {
  const hasWebGL = detectWebGL();
  const supportsWebGL2 = detectWebGL2();
  const isMobile = detectMobile();
  const slowConnection = detectSlowConnection();

  let tier: DeviceTier = "high";

  if (!hasWebGL) {
    tier = "low";
  } else if (!supportsWebGL2 || slowConnection) {
    tier = "low";
  } else if (isMobile) {
    tier = "medium";
  }

  return { tier, hasWebGL, isMobile, supportsWebGL2 };
}

const defaultCapability: DeviceCapability = {
  tier: "high",
  hasWebGL: true,
  isMobile: false,
  supportsWebGL2: true,
};

let cachedCapability: DeviceCapability | null = null;

function getCapability(): DeviceCapability {
  if (typeof window === "undefined") return defaultCapability;
  if (!cachedCapability) cachedCapability = calculateTier();
  return cachedCapability;
}

function subscribe() {
  // Device capability doesn't change — no-op
  return () => {};
}

export function useDeviceCapability(): DeviceCapability {
  return useSyncExternalStore(subscribe, getCapability, () => defaultCapability);
}
