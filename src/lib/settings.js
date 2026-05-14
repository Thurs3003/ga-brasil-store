import { supabase } from "./supabaseClient";

export const DEFAULT_WA_NUMBER = "5511975795839";

const _cache = {};
const _listeners = new Set();

function _notify() {
  _listeners.forEach((fn) => fn({ ..._cache }));
}

export async function loadSettings() {
  const { data } = await supabase.from("settings").select("key, value");
  if (data) {
    data.forEach(({ key, value }) => { _cache[key] = value; });
    _notify();
  }
}

export function getSetting(key, defaultValue = null) {
  const v = _cache[key];
  return v !== undefined && v !== null ? v : defaultValue;
}

export async function saveSetting(key, value) {
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (!error) {
    _cache[key] = value;
    _notify();
  }
  return error;
}

export function subscribeToSettings(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function startSettingsSync() {
  return supabase
    .channel("settings-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "settings" },
      (payload) => {
        if (payload.new?.key !== undefined) {
          _cache[payload.new.key] = payload.new.value;
          _notify();
        }
      }
    )
    .subscribe();
}
