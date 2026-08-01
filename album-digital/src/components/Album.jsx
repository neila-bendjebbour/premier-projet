import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTrip } from "../context/TripContext";
import { COUNTRIES } from "../data/countries";
import Flag from "./Flag";

function iso2For(countryName) {
  return COUNTRIES.find((c) => c.name === countryName)?.iso2;
}

function stampLine(memory) {
  const parts = [memory.countryName.toUpperCase()];
  if (memory.cityName) parts.push(memory.cityName.toUpperCase());
  if (memory.dateStart) {
    const d = new Date(memory.dateStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    parts.push(d.toUpperCase());
  }
  parts.push(`PAR ${memory.author.toUpperCase()}`);
  return parts.join(" · ");
}

function MemoryCard({ memory }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white border border-amber-200 p-5"
    >
      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-amber-500 leading-relaxed mb-3">
        <Flag iso2={iso2For(memory.countryName)} />
        {stampLine(memory)}
      </p>

      {memory.photos?.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {memory.photos.map((src, i) => (
            <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
          ))}
        </div>
      )}

      {memory.text && <p className="text-sm leading-relaxed text-amber-900 whitespace-pre-wrap">{memory.text}</p>}

      <p className="text-lg mt-2">{memory.mood}</p>
    </motion.article>
  );
}

export default function Album({ onOpenRecap }) {
  const { state } = useTrip();
  const [groupBy, setGroupBy] = useState("date");

  const sorted = useMemo(
    () =>
      [...state.memories].sort(
        (a, b) => new Date(b.dateStart || b.createdAt) - new Date(a.dateStart || a.createdAt)
      ),
    [state.memories]
  );

  const grouped = useMemo(() => {
    if (groupBy === "date") return { "Tous nos souvenirs": sorted };
    const byCountry = {};
    for (const m of sorted) {
      byCountry[m.countryName] = byCountry[m.countryName] || [];
      byCountry[m.countryName].push(m);
    }
    return byCountry;
  }, [sorted, groupBy]);

  return (
    <div className="max-w-2xl mx-auto px-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1 bg-amber-100 rounded-full p-1 no-print">
          {[
            { key: "date", label: "Chronologique" },
            { key: "country", label: "Par pays" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setGroupBy(opt.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                groupBy === opt.key ? "bg-white shadow text-amber-900" : "text-amber-600 hover:text-amber-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {sorted.length > 0 && (
          <button
            onClick={onOpenRecap}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-amber-700 hover:text-amber-950 transition no-print"
          >
            <Sparkles size={14} /> Générer un récap
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">📖</p>
          <p className="font-serif text-xl text-amber-800 mb-1">L'album est encore vierge</p>
          <p className="text-sm text-amber-500">Ouvre un pays et raconte votre premier moment.</p>
        </div>
      ) : (
        <div className="space-y-10 pb-6">
          {Object.entries(grouped).map(([groupName, items]) => (
            <section key={groupName}>
              {groupBy === "country" && (
                <h3 className="flex items-center gap-2 font-serif text-xl text-amber-800 mb-3">
                  <Flag iso2={iso2For(groupName)} className="w-6 h-4 rounded" />
                  {groupName}
                </h3>
              )}
              <div className="space-y-4">
                {items.map((m) => (
                  <MemoryCard key={m.id} memory={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
