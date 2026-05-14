export const WA_LS_KEY          = "ga_brasil_whatsapp";
export const WA_SUPPORT_LS_KEY  = "ga_brasil_whatsapp_support";
export const WA_FOOTER_LS_KEY   = "ga_brasil_whatsapp_footer";
export const DEFAULT_WA_NUMBER  = "5511975795839";

export function getOrdersWA()  { return localStorage.getItem(WA_LS_KEY)         || DEFAULT_WA_NUMBER; }
export function getSupportWA() { return localStorage.getItem(WA_SUPPORT_LS_KEY) || DEFAULT_WA_NUMBER; }
export function getFooterWA()  { return localStorage.getItem(WA_FOOTER_LS_KEY)  || DEFAULT_WA_NUMBER; }

export function buildWAUrl(number, text) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
