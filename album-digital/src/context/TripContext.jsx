import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const TripContext = createContext(null);

const initialState = {
  hydrated: false,
  countryStatus: {},
  memories: [],
  settings: {
    title: "Notre monde",
    partnerNames: ["Nadim", "Jihane"],
  },
};

function mapMemoryFromDb(row) {
  return {
    id: row.id,
    countryName: row.country_name,
    cityName: row.city_name || "",
    dateStart: row.date_start || "",
    dateEnd: row.date_end || "",
    text: row.text || "",
    mood: row.mood || "🥰",
    author: row.author,
    photos: row.photos || [],
    createdAt: row.created_at,
  };
}

function mapMemoryToDb(memory) {
  return {
    id: memory.id,
    country_name: memory.countryName,
    city_name: memory.cityName,
    date_start: memory.dateStart || null,
    date_end: memory.dateEnd || null,
    text: memory.text,
    mood: memory.mood,
    author: memory.author,
    photos: memory.photos,
  };
}

export function TripProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: memoriesData }, { data: countriesData }, { data: settingsData }] = await Promise.all([
        supabase.from("memories").select("*").order("date_start", { ascending: true }),
        supabase.from("visited_countries").select("country_name, status"),
        supabase.from("settings").select("*").eq("id", 1).single(),
      ]);
      if (cancelled) return;
      const countryStatus = {};
      (countriesData || []).forEach((c) => {
        countryStatus[c.country_name] = c.status || "visited";
      });
      setState({
        hydrated: true,
        memories: (memoriesData || []).map(mapMemoryFromDb),
        countryStatus,
        settings: settingsData
          ? { title: settingsData.title, partnerNames: settingsData.partner_names }
          : initialState.settings,
      });
    }
    load();

    const channel = supabase
      .channel("trip-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "memories" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "visited_countries" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "settings" }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  async function dispatch(action) {
    switch (action.type) {
      case "SET_COUNTRY_STATUS": {
        const { countryName, status } = action.payload;
        if (!status) {
          await supabase.from("visited_countries").delete().eq("country_name", countryName);
        } else {
          await supabase.from("visited_countries").upsert({ country_name: countryName, status });
        }
        break;
      }

      case "ADD_MEMORY": {
        const memory = action.payload;
        await supabase.from("memories").insert(mapMemoryToDb(memory));
        await supabase.from("visited_countries").upsert({ country_name: memory.countryName, status: "visited" });
        break;
      }

      case "UPDATE_MEMORY": {
        const { id, ...rest } = mapMemoryToDb(action.payload);
        await supabase.from("memories").update(rest).eq("id", id);
        break;
      }

      case "DELETE_MEMORY": {
        await supabase.from("memories").delete().eq("id", action.payload);
        break;
      }

      case "UPDATE_SETTINGS": {
        const payload = action.payload;
        await supabase
          .from("settings")
          .update({
            ...(payload.title !== undefined ? { title: payload.title } : {}),
            ...(payload.partnerNames !== undefined ? { partner_names: payload.partnerNames } : {}),
          })
          .eq("id", 1);
        break;
      }

      default:
        break;
    }
  }

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip doit être utilisé dans un TripProvider");
  return ctx;
}
