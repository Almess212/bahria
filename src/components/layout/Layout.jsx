import Header from './Header';
import Sidebar from './Sidebar';

/**
 * Layout principal de l'application
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenu de la page
 * @param {string} props.activePage - Page active
 * @param {Function} props.onNavigate - Callback de navigation
 * @param {Object} props.sst - Données SST
 */
export default function Layout({ children, activePage, onNavigate, sst }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header en haut */}
      <Header sst={sst} />

      {/* Zone principale : Sidebar + Contenu */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar fixe à gauche */}
        <Sidebar activePage={activePage} onNavigate={onNavigate} />

        {/* Zone de contenu */}
        <main className="flex-1 bg-gray-50 overflow-y-auto p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
