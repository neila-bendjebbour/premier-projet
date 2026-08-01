import { useState } from "react";
import { Stamp } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Compte créé ! Vérifiez votre boîte mail pour confirmer, puis connectez-vous.");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-amber-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-amber-200 p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center border-2 border-yellow-400 rounded-lg p-2 -rotate-2 mb-3">
            <Stamp size={22} className="text-amber-700" />
          </div>
          <h1 className="font-serif text-2xl text-amber-950">Notre monde</h1>
          <p className="font-mono text-xs uppercase tracking-widest text-amber-500 mt-1">
            {mode === "signin" ? "Ouverture du passeport" : "Créez votre compte du couple"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-amber-600 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm bg-amber-50 focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}
          {info && <p className="text-sm text-amber-700">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-amber-950 bg-yellow-400 hover:bg-yellow-300 transition disabled:opacity-60"
          >
            {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
            setInfo("");
          }}
          className="w-full text-center text-xs text-amber-500 hover:text-amber-700 mt-4 transition"
        >
          {mode === "signin" ? "Pas encore de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
        </button>
      </div>
    </div>
  );
}
