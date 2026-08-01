import { useEffect, useState } from "react";
import { ArrowLeft, Plane, Stamp, Pencil } from "lucide-react";
import { useTrip } from "../context/TripContext";
import { COUNTRIES } from "../data/countries";
import Modal from "./Modal";
import MemoryForm from "./MemoryForm";
import ArmedDeleteButton from "./ArmedDeleteButton";
import Flag from "./Flag";

function formatStampLine(memory, countryName) {
  const parts = [countryName.toUpperCase()];
  if (memory.cityName) parts.push(memory.cityName.toUpperCase());
  if (memory.dateStart) {
    const d = new Date(memory.dateStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    parts.push(d.toUpperCase());
  }
  parts.push(`PAR ${memory.author.toUpperCase()}`);
  return parts.join(" · ");
}

export default function CountryPanel({ countryName, onClose }) {
  const { state, dispatch } = useTrip();
  const [mode, setMode] = useState("view");
  const [editingMemory, setEditingMemory] = useState(null);

  useEffect(() => {
    setMode("view");
    setEditingMemory(null);
  }, [countryName]);

  const country = COUNTRIES.find((c) => c.name === countryName);
  const status = countryName ? state.countryStatus[countryName] : null;
  const memories = state.memories
    .filter((m) => m.countryName === countryName)
    .sort((a, b) => new Date(b.dateStart || b.createdAt) - new Date(a.dateStart || a.createdAt));

  function setStatus(next) {
    dispatch({
      type: "SET_COUNTRY_STATUS",
      payload: { countryName, status: status === next ? null : next },
    });
  }

  return (
    <Modal open={!!countryName} onClose={onClose} wide>
      {country && mode === "view" && (
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Flag iso2={country.iso2} className="w-16 h-11 rounded" />
            <div>
              <h2 className="font-serif text-2xl text-amber-950">{country.name}</h2>
              {status === "visited" && (
                <span className="inline-block mt-1 font-mono text-[10px] uppercase tracking-widest bg-amber-900 text-amber-50 border-2 border-yellow-400 rounded px-2 py-0.5 -rotate-1">
                  Tamponné
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              onClick={() => setStatus("visited")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wide transition ${
                status === "visited"
                  ? "bg-amber-900 text-amber-50 border-2 border-yellow-400"
                  : "bg-white text-amber-700 border border-amber-200 hover:border-amber-400"
              }`}
            >
              <Stamp size={14} /> Tamponné
            </button>
            <button
              onClick={() => setStatus("planned")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wide transition ${
                status === "planned"
                  ? "bg-rose-50 text-rose-700 border-2 border-dashed border-rose-300"
                  : "bg-white text-amber-700 border border-amber-200 hover:border-amber-400"
              }`}
            >
              <Plane size={14} /> En projet
            </button>
          </div>

          <p className="font-mono text-xs uppercase tracking-widest text-amber-600 mb-3">
            Souvenirs · {memories.length}
          </p>

          <button
            onClick={() => setMode("form")}
            className="w-full mb-5 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wide border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 transition"
          >
            + Ajouter un souvenir
          </button>

          {memories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🧳</p>
              <p className="font-serif text-lg text-amber-800">L'album est encore vierge</p>
              <p className="text-sm text-amber-500 mt-1">Ouvrez ce pays et racontez votre premier moment.</p>
            </div>
          )}

          <div className="space-y-4">
            {memories.map((m) => (
              <div key={m.id} className="rounded-xl bg-white border border-amber-200 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-amber-500 leading-relaxed">
                    <Flag iso2={country.iso2} />
                    {formatStampLine(m, country.name)}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingMemory(m);
                        setMode("form");
                      }}
                      className="text-amber-400 hover:text-amber-700 transition"
                      aria-label="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <ArmedDeleteButton onConfirm={() => dispatch({ type: "DELETE_MEMORY", payload: m.id })} />
                  </div>
                </div>
                {m.text && <p className="text-sm text-amber-900 leading-relaxed mb-2">{m.text}</p>}
                {m.photos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {m.photos.map((src, i) => (
                      <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                <p className="text-lg mt-2">{m.mood}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {country && mode === "form" && (
        <div>
          <button
            onClick={() => {
              setMode("view");
              setEditingMemory(null);
            }}
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-amber-600 hover:text-amber-900 mb-4 transition"
          >
            <ArrowLeft size={14} /> Retour
          </button>
          <h2 className="font-serif text-2xl text-amber-950 mb-4">
            {editingMemory ? "Modifier le souvenir" : `Nouveau souvenir · ${country.name}`}
          </h2>
          <MemoryForm
            countryName={countryName}
            existing={editingMemory}
            onDone={() => {
              setMode("view");
              setEditingMemory(null);
            }}
          />
        </div>
      )}
    </Modal>
  );
}
