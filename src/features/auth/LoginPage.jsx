import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserCircle, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';
import { USER_ROLES } from '../../config/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signInDemo, isLoading } = useAuthStore();
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await signIn(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Erreur de connexion');
    }
  };

  const handleDemoLogin = (role) => {
    signInDemo(role);
    navigate('/dashboard');
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-[#041E42] mb-6 text-center">
        {t.login.title}
      </h2>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.login.email}
          </label>
          <div className="relative">
            <UserCircle className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent`}
              placeholder={t.login.emailPlaceholder}
              required
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.login.password}
          </label>
          <div className="relative">
            <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent`}
              placeholder={t.login.passwordPlaceholder}
              required
            />
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Bouton */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0EA5E9] text-white py-3 rounded-lg font-semibold hover:bg-[#0284c7] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t.login.signingIn}
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              {t.login.signIn}
            </>
          )}
        </button>
      </form>

      {/* Séparateur */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">{t.login.orDemoMode}</span>
        </div>
      </div>

      {/* Boutons démo */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleDemoLogin(USER_ROLES.FISHERMAN)}
          className="px-4 py-2 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
        >
          🎣 {t.login.fisherman}
        </button>
        <button
          onClick={() => handleDemoLogin(USER_ROLES.FACTORY)}
          className="px-4 py-2 border-2 border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors text-sm font-medium"
        >
          🏭 {t.login.factory}
        </button>
        <button
          onClick={() => handleDemoLogin(USER_ROLES.SCIENTIST)}
          className="px-4 py-2 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
        >
          🔬 {t.login.scientist}
        </button>
        <button
          onClick={() => handleDemoLogin(USER_ROLES.ADMIN)}
          className="px-4 py-2 border-2 border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
        >
          ⚙️ {t.login.admin}
        </button>
      </div>

      <p className="text-center text-gray-500 text-xs mt-4">
        {t.login.demoNote}
      </p>
    </div>
  );
}
