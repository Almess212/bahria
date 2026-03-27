/**
 * Barre supérieure de l'application
 * @param {Object} props
 * @param {Object} props.sst - Données SST { sst, source, live }
 */
export default function Header({ sst }) {
  return (
    <header className="bg-[#041E42] h-14 md:h-16 flex items-center justify-between px-3 md:px-6 shadow-md">
      {/* Logo et titre */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="BAHRIA" className="h-10 md:h-12 object-contain" />
        <p className="text-[#0EA5E9] text-lg md:text-xl font-semibold">بحرية</p>
      </div>

      {/* Badge SST */}
      {sst && (
        <div className="bg-white/10 rounded-full px-2 py-1 md:px-3">
          <span className="text-white text-xs md:text-sm">
            🌊 <span className="hidden sm:inline">SST </span>{sst.sst.toFixed(1)}°C
          </span>
        </div>
      )}
    </header>
  );
}
