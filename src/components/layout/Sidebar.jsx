/**
 * Menu latéral de navigation
 * @param {Object} props
 * @param {string} props.activePage - Page active
 * @param {Function} props.onNavigate - Callback de navigation
 */
export default function Sidebar({ activePage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
    { id: 'analysis', icon: '🔬', label: 'Nouvelle analyse' },
    { id: 'species', icon: '📋', label: 'Espèces' }
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white border-r h-full flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🐙</span>
          <h2 className="text-[#041E42] font-bold text-lg">BAHRIA</h2>
        </div>
        <p className="text-gray-500 text-xs">Repos biologique intelligent</p>
      </div>

      {/* Menu items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${activePage === item.id
                  ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t">
        <p className="text-gray-400 text-xs text-center">NEGAM SAS</p>
        <p className="text-gray-400 text-xs text-center">Smart Sailors</p>
      </div>
    </aside>
  );
}
