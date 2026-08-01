import { useMemo, useState } from "react";
import { ArrowLeft, Sparkles, Printer } from "lucide-react";
import { useTrip } from "../context/TripContext";
import { COUNTRIES } from "../data/countries";
import Flag from "./Flag";

function iso2For(countryName) {
  return COUNTRIES.find((c) => c.name === countryName)?.iso2;
}

function inRange(memory, start, end) {
  const ref = memory.dateStart || memory.createdAt;
  if (!ref) return false;
  const d = new Date(ref);
  if (start && d < new Date(start)) return false;
  if (end && d > new Date(end)) return false;
  return true;
}

export default function TripRecap({ onBack }) {
  const { state } = useTrip();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [generated, setGenerated] = useState(false);

  const filtered = useMemo(() => {
    if (!generated) return [];
    return state.memories
      .filter((m) => inRange(m, start, end))
      .sort((a, b) => new Date(a.dateStart || a.createdAt) - new Date(b.dateStart || b.createdAt));
  }, [generated, state.memories, start, end]);

  const countries = [...new Set(filtered.map((m) => m.countryName))];
  const cities = [...new Set(filtered.map((m) => m.cityName).filter(Boolean))];
  const photoCount = filtered.reduce((n, m) => n + (m.photos?.length || 0), 0);

  return (
    <div className="max-w-2xl mx-auto px-5 pb-10">
      <button
        onClick={onBack}
        className="no-print flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-amber-600 hover:text-amber-900 mb-5 transition"
      >
        <ArrowLeft size={14} /> Retour à l'album
      </button>

      <div className="text-center mb-8 no-print">
        <h2 className="font-serif text-3xl text-amber-950 flex items-center justify-center gap-2">
          <Sparkles size={22} className="text-yellow-500" /> Récap de voyage
        </h2>
        <p className="text-sm text-amber-600 mt-1">Choisissez une période pour compiler vos souvenirs</p>
      </div>

      <div className="flex flex-wrap items-end justify-center gap-4 mb-10 no-print">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Du</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-lg border border-amber-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Au</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-lg border border-amber-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <button
          onClick={() => setGenerated(true)}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-amber-950 bg-yellow-400 hover:bg-yellow-300 transition"
        >
          Générer le récap
        </button>
        {generated && filtered.length > 0 && (
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-amber-700 border border-amber-200 hover:bg-amber-50 transition flex items-center gap-2"
          >
            <Printer size={15} /> Exporter en PDF
          </button>
        )}
      </div>

      {generated && (
        <div id="recap-content" className="bg-white rounded-xl border border-amber-200 p-6 sm:p-10">
          {filtered.length === 0 ? (
            <p className="text-center text-amber-500 py-12">Aucun souvenir sur cette période.</p>
          ) : (
            <>
              <header className="text-center mb-8">
                <p className="font-mono text-xs uppercase tracking-widest text-amber-500 mb-2">{state.settings.title}</p>
                <h1 className="font-serif text-4xl text-amber-950 mb-4">Notre récap de voyage</h1>
                <p className="text-sm text-amber-600">
                  {start ? new Date(start).toLocaleDateString("fr-FR") : "…"} — {end ? new Date(end).toLocaleDateString("fr-FR") : "…"}
                </p>
              </header>

              <div className="grid grid-cols-4 gap-2 mb-10 pb-8 border-b border-amber-100">
                {[
                  ["Pays", countries.length],
                  ["Villes", cities.length],
                  ["Souvenirs", filtered.length],
                  ["Photos", photoCount],
                ].map(([label, value]) => (
                  <div key={label} className="text-center">
                    <p className="font-serif text-2xl text-amber-950">{value}</p>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-amber-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8">
                {filtered.map((m) => (
                  <section key={m.id} className="break-inside-avoid">
                    <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-amber-500 mb-2">
                      <Flag iso2={iso2For(m.countryName)} />
                      {m.countryName.toUpperCase()}
                      {m.cityName ? ` · ${m.cityName.toUpperCase()}` : ""}
                      {m.dateStart ? ` · ${new Date(m.dateStart).toLocaleDateString("fr-FR")}` : ""} · PAR{" "}
                      {m.author.toUpperCase()}
                    </p>
                    {m.photos?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {m.photos.map((src, i) => (
                          <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    {m.text && <p className="text-sm leading-relaxed text-amber-900 whitespace-pre-wrap">{m.text}</p>}
                    <p className="text-lg mt-2">{m.mood}</p>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
