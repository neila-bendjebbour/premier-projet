import { useMemo, useState } from "react";
import { Search, Stamp, Plane } from "lucide-react";
import { COUNTRIES } from "../data/countries";
import { useTrip } from "../context/TripContext";
import Flag from "./Flag";

export default function CountryList({ onSelectCountry }) {
  const { state } = useTrip();
  const [query, setQuery] = useState("");

  const sorted = useMemo(
    () => [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [sorted, query]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un pays…"
          className="w-full rounded-lg border border-amber-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="rounded-xl border border-amber-200 bg-white divide-y divide-amber-100 max-h-[60vh] overflow-y-auto">
        {filtered.map((country) => {
          const status = state.countryStatus[country.name];
          return (
            <button
              key={country.name}
              onClick={() => onSelectCountry(country.name)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-amber-50 transition"
            >
              <Flag iso2={country.iso2} className="w-7 h-5 rounded" />
              <span className="flex-1 text-sm text-amber-950">{country.name}</span>
              {status === "visited" && (
                <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide bg-amber-900 text-amber-50 border border-yellow-400 rounded px-1.5 py-0.5 -rotate-1">
                  <Stamp size={10} /> Tamponné
                </span>
              )}
              {status === "planned" && (
                <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide bg-rose-50 text-rose-700 border border-dashed border-rose-300 rounded px-1.5 py-0.5">
                  <Plane size={10} /> Projet
                </span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-amber-400 py-8">Aucun pays ne correspond à cette recherche.</p>
        )}
      </div>
    </div>
  );
}
