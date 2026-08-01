import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useTrip } from "../context/TripContext";
import { supabase } from "../lib/supabaseClient";

const MOODS = ["🥰", "😍", "😂", "🥹", "😎", "🌙", "🎉", "🥂", "☀️", "🌧️"];

async function uploadPhoto(file) {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("photos").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}

export default function MemoryForm({ countryName, existing, onDone }) {
  const { state, dispatch } = useTrip();
  const [cityName, setCityName] = useState(existing?.cityName || "");
  const [dateStart, setDateStart] = useState(existing?.dateStart || "");
  const [dateEnd, setDateEnd] = useState(existing?.dateEnd || "");
  const [text, setText] = useState(existing?.text || "");
  const [mood, setMood] = useState(existing?.mood || MOODS[0]);
  const [author, setAuthor] = useState(existing?.author || state.settings.partnerNames[0]);
  const [photos, setPhotos] = useState(existing?.photos || []);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [photoError, setPhotoError] = useState("");

  async function handlePhotos(e) {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);
    setUploadingCount(files.length);
    setPhotoError("");
    try {
      const urls = await Promise.all(files.map(uploadPhoto));
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      setPhotoError(err.message || "Échec de l'envoi de la photo.");
    } finally {
      setUploadingCount(0);
      e.target.value = "";
    }
  }

  function removePhoto(idx) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const memory = {
      id: existing?.id || crypto.randomUUID(),
      countryName,
      cityName: cityName.trim(),
      dateStart,
      dateEnd,
      text: text.trim(),
      mood,
      author,
      photos,
      createdAt: existing?.createdAt || new Date().toISOString(),
    };
    dispatch({ type: existing ? "UPDATE_MEMORY" : "ADD_MEMORY", payload: memory });
    onDone?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">
            Ville (optionnel)
          </label>
          <input
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="ex. Kyoto"
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Du</label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Au</label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">
          Ce qu'on a à dire sur ce moment
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Racontez ce souvenir..."
          className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-2">
          Humeur du souvenir
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMood(m)}
              className={`w-10 h-10 rounded-full text-lg flex items-center justify-center transition ${
                mood === m ? "bg-yellow-300 ring-2 ring-yellow-500 scale-110" : "bg-amber-50 hover:bg-amber-100"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Signé par</label>
        <div className="flex gap-2">
          {state.settings.partnerNames.map((name) => (
            <button
              type="button"
              key={name}
              onClick={() => setAuthor(name)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                author === name ? "bg-amber-900 text-amber-50" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-2">Photos</label>
        <div className="grid grid-cols-4 gap-3">
          {photos.map((src, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute inset-0 bg-amber-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <div key={`skeleton-${i}`} className="aspect-square rounded-lg bg-amber-100 animate-pulse" />
          ))}
          <label className="aspect-square rounded-lg border-2 border-dashed border-amber-300 flex flex-col items-center justify-center gap-1 text-amber-400 cursor-pointer hover:bg-amber-50 transition text-[10px] text-center px-1">
            <ImagePlus size={18} />
            Ajouter
            <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
          </label>
        </div>
        {photoError && <p className="text-xs text-rose-600 mt-2">{photoError}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={uploadingCount > 0}
          className="px-6 py-2 rounded-lg text-sm font-semibold text-amber-950 bg-yellow-400 hover:bg-yellow-300 transition disabled:opacity-60"
        >
          {existing ? "Enregistrer" : "Sauvegarder une copie"}
        </button>
      </div>
    </form>
  );
}
