export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-amber-50">
      <div className="max-w-md bg-white rounded-2xl shadow-sm border border-amber-200 p-8 text-center space-y-3">
        <h1 className="font-serif text-2xl text-amber-950">Configuration requise</h1>
        <p className="text-sm text-amber-800">
          Pour synchroniser vos souvenirs entre vos deux téléphones, créez un fichier{" "}
          <code className="bg-amber-50 px-1.5 py-0.5 rounded">.env.local</code> à la racine du projet avec vos
          identifiants Supabase (voir <code className="bg-amber-50 px-1.5 py-0.5 rounded">.env.example</code>), puis
          relancez le serveur.
        </p>
      </div>
    </div>
  );
}
