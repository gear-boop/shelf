import { NextResponse } from "next/server";

export const json = <T,>(body: T, status = 200, headers?: Record<string, string>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export const fail = (message: string, status = 400, extra?: Record<string, unknown>) =>
  json({ error: message, ...extra }, status);

export const sameOrigin = (request: Request): boolean => {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
};

export const emailLooksValid = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 200;

export const bearer = (request: Request): string => {
  const header = request.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
};
