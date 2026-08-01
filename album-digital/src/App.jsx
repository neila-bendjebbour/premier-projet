import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Map as MapIcon, BookOpen, Settings, LogOut } from "lucide-react";
import { TripProvider, useTrip } from "./context/TripContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabaseConfigured } from "./lib/supabaseClient";
import { TOTAL_COUNTRIES } from "./data/countries";
import WorldMap from "./components/WorldMap";
import CountryList from "./components/CountryList";
import CountryPanel from "./components/CountryPanel";
import Album from "./components/Album";
import TripRecap from "./components/TripRecap";
import Modal from "./components/Modal";
import Login from "./components/Login";
import SetupNotice from "./components/SetupNotice";

const TABS = [
  { key: "map", label: "Le monde", icon: MapIcon },
  { key: "album", label: "L'album", icon: BookOpen },
];

function SettingsModal({ open, onClose }) {
  const { state, dispatch } = useTrip();
  const [title, setTitle] = useState(state.settings.title);
  const [nameA, setNameA] = useState(state.settings.partnerNames[0]);
  const [nameB, setNameB] = useState(state.settings.partnerNames[1]);

  function handleSave(e) {
    e.preventDefault();
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { title: title.trim() || "Notre monde", partnerNames: [nameA.trim() || "Moi", nameB.trim() || "Toi"] },
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Personnaliser">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">
            Titre du carnet
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Prénom 1</label>
            <input
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Prénom 2</label>
            <input
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-sm font-semibold text-amber-950 bg-yellow-400 hover:bg-yellow-300 transition"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Shell() {
  const { state } = useTrip();
  const { signOut } = useAuth();
  const [tab, setTab] = useState("map");
  const [mapView, setMapView] = useState("carte");
  const [recapOpen, setRecapOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!state.hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-500">Ouverture du passeport…</p>
      </div>
    );
  }

  const stampedCount = Object.values(state.countryStatus).filter((s) => s === "visited").length;

  return (
    <div className="min-h-screen pb-24">
      <header className="no-print max-w-2xl mx-auto px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-xs uppercase tracking-widest text-amber-600">
            {state.settings.partnerNames[0]} ✕ {state.settings.partnerNames[1]} — carnet de voyages
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-amber-400 hover:text-amber-700 transition"
              aria-label="Personnaliser"
            >
              <Settings size={15} />
            </button>
            <button onClick={signOut} className="text-amber-400 hover:text-amber-700 transition" aria-label="Déconnexion">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <h1 className="font-serif text-4xl text-amber-950">{state.settings.title}</h1>
          <div className="shrink-0 border-2 border-yellow-400 rounded-lg px-3 py-1.5 -rotate-2 text-center">
            <p className="font-mono font-bold text-amber-600 leading-none text-base">
              {stampedCount}/{TOTAL_COUNTRIES}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-amber-500 mt-0.5">Pays tamponnés</p>
          </div>
        </div>

        <div className="h-px mt-4 bg-gradient-to-r from-yellow-400 via-amber-300 to-transparent" />
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={tab === "album" && recapOpen ? "recap" : tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "map" && (
            <div className="max-w-2xl mx-auto px-5">
              <div className="flex justify-center mb-4">
                <div className="flex gap-1 bg-amber-100 rounded-full p-1 no-print">
                  {[
                    { key: "carte", label: "Carte" },
                    { key: "liste", label: "Liste" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setMapView(opt.key)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                        mapView === opt.key ? "bg-white shadow text-amber-900" : "text-amber-600 hover:text-amber-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {mapView === "carte" ? (
                <WorldMap onSelectCountry={setSelectedCountry} selectedCountry={selectedCountry} />
              ) : (
                <CountryList onSelectCountry={setSelectedCountry} />
              )}
            </div>
          )}
          {tab === "album" && !recapOpen && <Album onOpenRecap={() => setRecapOpen(true)} />}
          {tab === "album" && recapOpen && <TripRecap onBack={() => setRecapOpen(false)} />}
        </motion.main>
      </AnimatePresence>

      <nav className="no-print fixed bottom-0 inset-x-0 bg-amber-50/95 backdrop-blur border-t border-amber-200 z-30">
        <div className="max-w-2xl mx-auto grid grid-cols-2">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setRecapOpen(false);
                }}
                className={`flex flex-col items-center gap-1 py-2.5 border-b-2 transition ${
                  active ? "text-amber-950 border-yellow-500" : "text-amber-500 border-transparent"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <CountryPanel countryName={selectedCountry} onClose={() => setSelectedCountry(null)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function Gate() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-500">Ouverture du passeport…</p>
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <TripProvider>
      <Shell />
    </TripProvider>
  );
}

export default function App() {
  if (!supabaseConfigured) return <SetupNotice />;

  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
