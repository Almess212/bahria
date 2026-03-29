export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041E42] via-[#0EA5E9] to-[#041E42] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="BAHRIA" className="h-16 object-contain" />
            <h1 className="text-white text-4xl font-bold">BAHRIA</h1>
          </div>
          <p className="text-[#0EA5E9] text-2xl font-semibold">بحرية</p>
          <p className="text-white/80 text-sm mt-2">
            Plateforme IA de gestion des ressources marines
          </p>
        </div>

        {/* Contenu (formulaire de connexion) */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-xs mt-6">
          © 2026 BAHRIA • NEGAM SAS • Dakhla, Maroc
        </p>
      </div>
    </div>
  );
}
