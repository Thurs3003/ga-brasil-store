import { getSetting, DEFAULT_WA_NUMBER } from "./settings";

export { DEFAULT_WA_NUMBER };

export function getOrdersWA()  { return getSetting("wa_orders",  DEFAULT_WA_NUMBER); }
export function getSupportWA() { return getSetting("wa_support", DEFAULT_WA_NUMBER); }
export function getFooterWA()  { return getSetting("wa_footer",  DEFAULT_WA_NUMBER); }

export function buildWAUrl(number, text) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
