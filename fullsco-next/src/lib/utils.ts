import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\u0621-\u064A\u0660-\u0669a-z0-9 -]/g, "") // keep Arabic, English letters, numbers and hyphens
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getYouTubeEmbedUrl(url: string) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

export function removeTags(str: string) {
  if (!str) return "";
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

export function isRTL(text: string) {
  const rtlChars = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC";
  const rtlDirCheck = new RegExp(`^[^${rtlChars}]*?[${rtlChars}]`);
  return rtlDirCheck.test(text);
}

export const storage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  },
};
