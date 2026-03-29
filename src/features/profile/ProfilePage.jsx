import { useState, useEffect } from 'react';
import { User, Ship, Anchor, Save, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import useAppStore from '../../store/appStore';
import { useTranslation } from '../../i18n/translations';

export default function ProfilePage() {
  const { language } = useAppStore();
  const t = useTranslation(language);
  const [saved, setSaved] = useState(false);
  const [profileData, setProfileData] = useState({
    // Informations personnelles
    nom_complet: '',
    telephone: '',
    email: '',

    // Informations navire
    navire_nom: '',
    navire_immatriculation: '',
    navire_type: '',
    navire_longueur: '',
    navire_puissance: '',

    // Informations capitaine/patron
    capitaine_nom: '',
    capitaine_licence: '',
    equipage_habituel: '',

    // Port d'attache
    port_attache: 'Dakhla',

    // Engin principal
    engin_principal: '',

    // Zone de pêche habituelle
    zone_habituelle: '',
  });

  // Charger les données du localStorage au montage
  useEffect(() => {
    const savedProfile = localStorage.getItem('bahria_fisher_profile');
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Erreur chargement profil:', error);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Sauvegarder dans localStorage
    localStorage.setItem('bahria_fisher_profile', JSON.stringify(profileData));
    setSaved(true);

    // Afficher la confirmation pendant 3 secondes
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#041E42] flex items-center gap-2">
            <User className="w-8 h-8" />
            {t.profile.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.profile.subtitle}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284c7] transition-colors font-semibold"
        >
          <Save className="w-5 h-5" />
          {t.profile.saveButton}
        </button>
      </div>

      {/* Message de confirmation */}
      {saved && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-bold text-green-900">✅ {t.profile.saved}</h3>
              <p className="text-sm text-green-800">{t.profile.savedDesc}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info réglementaire */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 mb-1">ℹ️ {t.profile.whyInfo}</h3>
            <p className="text-sm text-blue-800">
              {t.profile.whyInfoDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Informations personnelles */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-xl text-[#041E42] mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            {t.profile.personalInfo}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.fullName}</label>
              <input
                type="text"
                value={profileData.nom_complet}
                onChange={(e) => handleChange('nom_complet', e.target.value)}
                placeholder={t.profile.placeholders.fullName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.phone}</label>
              <input
                type="tel"
                value={profileData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                placeholder={t.profile.placeholders.phone}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.email}</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder={t.profile.placeholders.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
          </div>
        </div>

        {/* Section Navire */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-xl text-[#041E42] mb-4 flex items-center gap-2">
            <Ship className="w-6 h-6 text-cyan-600" />
            {t.profile.vesselInfo}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.vesselNameRequired}</label>
              <input
                type="text"
                value={profileData.navire_nom}
                onChange={(e) => handleChange('navire_nom', e.target.value)}
                placeholder={t.profile.placeholders.vesselName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.registrationRequired}</label>
              <input
                type="text"
                value={profileData.navire_immatriculation}
                onChange={(e) => handleChange('navire_immatriculation', e.target.value)}
                placeholder={t.profile.placeholders.registration}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.vesselType}</label>
              <select
                value={profileData.navire_type}
                onChange={(e) => handleChange('navire_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              >
                <option value="">{t.profile.vesselTypes.select}</option>
                <option>{t.profile.vesselTypes.artisanal}</option>
                <option>{t.profile.vesselTypes.coastal}</option>
                <option>{t.profile.vesselTypes.seiner}</option>
                <option>{t.profile.vesselTypes.longliner}</option>
                <option>{t.profile.vesselTypes.netter}</option>
                <option>{t.profile.vesselTypes.shrimper}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.length}</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.navire_longueur}
                  onChange={(e) => handleChange('navire_longueur', e.target.value)}
                  placeholder={t.profile.placeholders.length}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.power}</label>
                <input
                  type="number"
                  value={profileData.navire_puissance}
                  onChange={(e) => handleChange('navire_puissance', e.target.value)}
                  placeholder={t.profile.placeholders.power}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Capitaine/Patron */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-xl text-[#041E42] mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-green-600" />
            {t.profile.captainInfo}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.captainNameRequired}</label>
              <input
                type="text"
                value={profileData.capitaine_nom}
                onChange={(e) => handleChange('capitaine_nom', e.target.value)}
                placeholder={t.profile.placeholders.captainName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
              <p className="text-xs text-gray-500 mt-1">{t.profile.captainNote}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.license}</label>
              <input
                type="text"
                value={profileData.capitaine_licence}
                onChange={(e) => handleChange('capitaine_licence', e.target.value)}
                placeholder={t.profile.placeholders.license}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.crewNumberRequired}</label>
              <input
                type="number"
                value={profileData.equipage_habituel}
                onChange={(e) => handleChange('equipage_habituel', e.target.value)}
                placeholder={t.profile.placeholders.crewNumber}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
          </div>
        </div>

        {/* Section Activité */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-bold text-xl text-[#041E42] mb-4 flex items-center gap-2">
            <Anchor className="w-6 h-6 text-orange-600" />
            {t.profile.fishingActivity}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.homePortRequired}</label>
              <select
                value={profileData.port_attache}
                onChange={(e) => handleChange('port_attache', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              >
                <option>{t.profile.ports.dakhla}</option>
                <option>{t.profile.ports.laayoune}</option>
                <option>{t.profile.ports.tantan}</option>
                <option>{t.profile.ports.sidiIfni}</option>
                <option>{t.profile.ports.agadir}</option>
                <option>{t.profile.ports.essaouira}</option>
                <option>{t.profile.ports.safi}</option>
                <option>{t.profile.ports.elJadida}</option>
                <option>{t.profile.ports.casablanca}</option>
                <option>{t.profile.ports.mohammedia}</option>
                <option>{t.profile.ports.kenitra}</option>
                <option>{t.profile.ports.larache}</option>
                <option>{t.profile.ports.tanger}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.mainGearRequired}</label>
              <select
                value={profileData.engin_principal}
                onChange={(e) => handleChange('engin_principal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              >
                <option value="">{t.profile.gearTypes.select}</option>
                <option>{t.profile.gearTypes.seine}</option>
                <option>{t.profile.gearTypes.gillnet}</option>
                <option>{t.profile.gearTypes.longline}</option>
                <option>{t.profile.gearTypes.traps}</option>
                <option>{t.profile.gearTypes.line}</option>
                <option>{t.profile.gearTypes.trawl}</option>
                <option>{t.profile.gearTypes.dredge}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile.usualZone}</label>
              <input
                type="text"
                value={profileData.zone_habituelle}
                onChange={(e) => handleChange('zone_habituelle', e.target.value)}
                placeholder={t.profile.placeholders.usualZone}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-[#0EA5E9]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bouton enregistrer en bas */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-8 py-4 bg-[#0EA5E9] text-white rounded-xl hover:bg-[#0284c7] transition-colors font-bold text-lg shadow-lg"
        >
          <Save className="w-6 h-6" />
          {t.profile.saveButton}
        </button>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-l-4 border-gray-400 rounded-xl p-4 text-sm text-gray-700">
        <p className="font-medium mb-1">🔒 {t.profile.privacy}</p>
        <p>
          {t.profile.privacyText}
        </p>
      </div>
    </div>
  );
}
