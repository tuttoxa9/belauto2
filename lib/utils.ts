import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchUsdBynRate() {
  try {
    const res = await fetch('/api/exchange-rate');
    if (!res.ok) return null;
    const data = await res.json();
    return data.rate ?? null;
  } catch {
    return null;
  }
}

export function convertUsdToByn(usd: number, rate: number): string {
  if (!rate || !usd) return '';
  return Math.round(usd * rate).toLocaleString('ru-BY');
}
