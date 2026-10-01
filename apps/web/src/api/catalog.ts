import {
  type Gadget,
  GadgetResponseSchema,
  type NicheDetailResponse,
  NicheDetailResponseSchema,
  type NicheSummary,
  NichesResponseSchema,
} from "@clever-gadgets/shared";
import { apiRequest } from "./client";

export async function fetchNiches(): Promise<NicheSummary[]> {
  return (await apiRequest("/niches", NichesResponseSchema)).niches;
}

export function fetchNiche(nicheSlug: string): Promise<NicheDetailResponse> {
  return apiRequest(`/niches/${encodeURIComponent(nicheSlug)}`, NicheDetailResponseSchema);
}

export async function fetchGadget(nicheSlug: string, gadgetSlug: string): Promise<Gadget> {
  const path = `/niches/${encodeURIComponent(nicheSlug)}/gadgets/${encodeURIComponent(gadgetSlug)}`;
  return (await apiRequest(path, GadgetResponseSchema)).gadget;
}
