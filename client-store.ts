"use client";

export type SavedSite = {
  slug: string;
  name: string;
  token: string;
  createdAt: string;
  source?: string;
};

const KEY = "shelf.sites.v1";

export const loadSites = (): SavedSite[] => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as SavedSite[];
    return Array.isArray(parsed) ? parsed.filter((site) => site?.slug && site?.token) : [];
  } catch {
    return [];
  }
};

const persist = (sites: SavedSite[]) => {
  window.localStorage.setItem(KEY, JSON.stringify(sites.slice(0, 100)));
};

export const saveSite = (site: SavedSite): void => {
  const sites = loadSites().filter((entry) => entry.slug !== site.slug);
  persist([site, ...sites]);
};

export const forgetSite = (slug: string): void => {
  persist(loadSites().filter((entry) => entry.slug !== slug));
};
