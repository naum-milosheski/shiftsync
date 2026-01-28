import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format date to readable string (e.g., "Fri, Dec 30")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Format date with relative context (e.g., "Today", "Tomorrow", "Fri, Dec 30")
 */
export function formatDateRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Reset time for comparison
  const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return "Today";
  }
  if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return "Tomorrow";
  }
  return formatDate(d);
}

/**
 * Format time to 12-hour format (e.g., "6:00 PM")
 * Handles various input formats: "18:00", "18:00:00", "6:00 PM"
 */
export function formatTime(time: string): string {
  // If already formatted (contains AM/PM), return as is
  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  // Extract hours and minutes (handles "18:00" and "18:00:00")
  const parts = time.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    return time; // Return original if parsing fails
  }

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  // Special case for midnight
  if (hours === 0 && minutes === 0) {
    return "12:00 AM";
  }

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format time range (e.g., "6:00 PM - 12:00 AM")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  // Special case: if end is 12:00 AM, show "Midnight"
  if (end === "12:00 AM") {
    return `${start} - Midnight`;
  }

  return `${start} - ${end}`;
}

/**
 * Calculate hours between two times
 */
export function calculateHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let hours = endH - startH;
  let minutes = endM - startM;

  if (hours < 0) hours += 24; // Handle overnight shifts
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }

  return hours + minutes / 60;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Delay utility for async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
