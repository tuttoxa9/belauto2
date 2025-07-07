"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchUsdBynRate } from "@/lib/utils";

const UsdBynRateContext = createContext<number | null>(null);

export const useUsdBynRate = () => useContext(UsdBynRateContext);

export function UsdBynRateProvider({ children }: { children: React.ReactNode }) {
  const [usdBynRate, setUsdBynRate] = useState<number | null>(null);

  useEffect(() => {
    fetchUsdBynRate().then(setUsdBynRate);
  }, []);

  return (
    <UsdBynRateContext.Provider value={usdBynRate}>
      {children}
    </UsdBynRateContext.Provider>
  );
}
