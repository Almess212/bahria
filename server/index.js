import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer pour upload d'images
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Accepter tous les types d'images courants
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff'
    ];

    // Accepter aussi si le mimetype commence par 'image/'
    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non autorisé: ${file.mimetype}`));
    }
  }
});

// Initialiser Anthropic (nécessite ANTHROPIC_API_KEY dans .env)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Espèces cibles BAHRIA Cam
const ESPECES_BAHRIA = {
  sardine: {
    nom_scientifique: 'Sardina pilchardus',
    icone: '🐟',
    L50_cm: 11,
    calibres: {
      petit: '< 12 cm',
      moyen: '12-14 cm',
      grand: '> 14 cm'
    },
    allometric: { a: 0.0052, b: 3.12 }
  },
  maquereau: {
    nom_scientifique: 'Scomber scombrus',
    icone: '🐟',
    L50_cm: 24,
    calibres: {
      petit: '< 25 cm',
      moyen: '25-30 cm',
      grand: '> 30 cm'
    },
    allometric: { a: 0.0041, b: 3.24 }
  },
  chinchard: {
    nom_scientifique: 'Trachurus trachurus',
    icone: '🐟',
    L50_cm: 21,
    calibres: {
      petit: '< 22 cm',
      moyen: '22-26 cm',
      grand: '> 26 cm'
    },
    allometric: { a: 0.0058, b: 3.15 }
  },
  anchois: {
    nom_scientifique: 'Engraulis encrasicolus',
    icone: '🐟',
    L50_cm: 9,
    calibres: {
      petit: '< 9 cm',
      moyen: '9-11 cm',
      grand: '> 11 cm'
    },
    allometric: { a: 0.0039, b: 3.28 }
  },
  poulpe: {
    nom_scientifique: 'Octopus vulgaris',
    icone: '🐙',
    L50_cm: null, // Pas applicable pour poulpe
    calibres: {
      petit: '< 500 g',
      moyen: '500-1000 g',
      grand: '> 1000 g'
    },
    allometric: { a: 1, b: 1 } // Poids direct
  },
  seiche: {
    nom_scientifique: 'Sepia officinalis',
    icone: '🦑',
    L50_cm: 10,
    calibres: {
      petit: '< 12 cm',
      moyen: '12-18 cm',
      grand: '> 18 cm'
    },
    allometric: { a: 0.0092, b: 2.89 }
  },
  courbine: {
    nom_scientifique: 'Argyrosomus regius',
    icone: '🐟',
    L50_cm: 42,
    calibres: {
      petit: '< 50 cm',
      moyen: '50-70 cm',
      grand: '> 70 cm'
    },
    allometric: { a: 0.0087, b: 3.06 }
  }
};

// Fonction d'analyse démo (sans API Anthropic)
function analyzeImageDemo(filename) {
  const name = filename.toLowerCase();

  // Détection basique par nom de fichier
  if (name.includes('poulpe') || name.includes('octopus')) {
    return {
      espece: 'poulpe',
      confidence: 85,
      comptage: 1,
      taille_estimee_cm: 30,
      qualite: 'Bonne',
      fraicheur: 'Fraîche',
      raison: 'Détecté via le nom du fichier (mode démo - API Anthropic non configurée)'
    };
  }
  if (name.includes('sardine')) {
    return {
      espece: 'sardine',
      confidence: 88,
      comptage: 1,
      taille_estimee_cm: 13,
      qualite: 'Excellente',
      fraicheur: 'Très fraîche',
      raison: 'Détecté via le nom du fichier (mode démo - API Anthropic non configurée)'
    };
  }
  if (name.includes('maquereau') || name.includes('mackerel')) {
    return {
      espece: 'maquereau',
      confidence: 86,
      comptage: 1,
      taille_estimee_cm: 25,
      qualite: 'Bonne',
      fraicheur: 'Fraîche',
      raison: 'Détecté via le nom du fichier (mode démo - API Anthropic non configurée)'
    };
  }

  // Par défaut
  return {
    espece: 'sardine',
    confidence: 70,
    comptage: 1,
    taille_estimee_cm: 12,
    qualite: 'Bonne',
    fraicheur: 'Fraîche',
    raison: 'Analyse démo basique (configurez ANTHROPIC_API_KEY pour une vraie analyse IA)'
  };
}

// Route d'analyse d'image
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    console.log('📸 Analyse d\'image:', req.file.originalname);

    let analysisData;

    // Mode démo désactivé par défaut (Claude Sonnet 4.6 disponible)
    // Pour forcer le mode démo, mettre USE_DEMO_MODE=true dans .env
    const useDemoMode = process.env.USE_DEMO_MODE === 'true';

    if (useDemoMode || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes('votre')) {
      console.log('⚠ Mode démo activé (détection par nom de fichier)');
      analysisData = analyzeImageDemo(req.file.originalname);
    } else {
      // Lire l'image en base64
      const imageBuffer = await fs.readFile(req.file.path);
      let base64Image = imageBuffer.toString('base64');
      let mediaType = req.file.mimetype;

      // Claude Vision accepte uniquement: jpeg, png, gif, webp
      // Convertir les autres formats (avif, bmp, tiff, etc.) en message d'erreur clair
      const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!supportedTypes.includes(mediaType)) {
        console.warn(`⚠ Format ${mediaType} non supporté par Claude Vision. Formats acceptés: JPEG, PNG, GIF, WebP`);
        // Utiliser le mode démo pour ces formats
        analysisData = analyzeImageDemo(req.file.originalname);
        analysisData.raison = `Format ${mediaType} non supporté par Claude Vision (accepte uniquement JPEG, PNG, GIF, WebP). Analyse basique effectuée. Convertissez l'image en JPEG/PNG pour une analyse IA complète.`;
      } else {

      // Analyser avec Claude Vision
      const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6', // Version mars 2026
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Tu es un expert en identification de poissons et céphalopodes pour l'industrie de la pêche à Dakhla (Maroc).

IMPORTANT: Analyse cette image avec PRÉCISION. Les espèces cibles du plan de gestion sont :
- **Sardine** (Sardina pilchardus) - petit poisson argenté, corps élancé, écailles brillantes
- **Maquereau** (Scomber scombrus) - rayures ondulées noires/bleues sur le dos, corps fuselé
- **Chinchard** (Trachurus trachurus) - ligne latérale avec écailles épineuses, corps argenté
- **Anchois** (Engraulis encrasicolus) - très petit, corps translucide argenté
- **Poulpe** (Octopus vulgaris) - 8 tentacules avec ventouses, corps mou sans coquille
- **Seiche** (Sepia officinalis) - 10 tentacules (8 + 2 longs), os interne, corps ovale
- **Courbine** (Argyrosomus regius) - grand poisson argenté/doré, bouche large

Réponds UNIQUEMENT avec un JSON valide (sans markdown, sans backticks) au format suivant:
{
  "espece": "nom_commun_francais_de_l_espece",
  "confidence": 95,
  "comptage": 1,
  "taille_estimee_cm": 15,
  "qualite": "Excellente",
  "fraicheur": "Très fraîche",
  "raison": "Description courte des caractéristiques observées"
}

RÈGLES CRITIQUES:
1. Dans "espece", mets TOUJOURS le nom commun français de l'espèce (ex: "Requin baleine", "Thon rouge", "Daurade")
2. Si c'est une espèce CIBLE (dans la liste ci-dessus), mets son nom en minuscules (ex: "sardine", "poulpe")
3. Si ce N'EST PAS une espèce cible, mets le nom commun avec majuscules (ex: "Requin baleine", "Thon rouge")
4. Base-toi sur les VRAIES caractéristiques visuelles de l'image
5. Si l'image ne montre aucune des espèces CIBLES, mets confidence < 50
6. Comptage = nombre d'individus visibles
7. Qualité et Fraîcheur: si ce n'est pas une espèce cible, mets "Non applicable"

Exemples de réponses:
- Si tu vois une SARDINE: {"espece": "sardine", "confidence": 95, ...}
- Si tu vois un REQUIN BALEINE: {"espece": "Requin baleine", "confidence": 20, "qualite": "Non applicable", "fraicheur": "Non applicable", ...}

Réponse (JSON uniquement):`,
            },
          ],
        },
      ],
    });

      // Extraire la réponse
      const responseText = message.content[0].text.trim();
      console.log('🤖 Réponse Claude:', responseText);

      // Parser le JSON
      try {
        // Nettoyer les backticks markdown si présents
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysisData = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError);
        return res.status(500).json({ error: 'Format de réponse invalide', details: responseText });
      }
    }
    }

    // Valider que l'espèce est reconnue dans le plan de gestion
    const especeDetectee = analysisData.espece.toLowerCase();
    if (!ESPECES_BAHRIA[especeDetectee]) {
      console.warn('⚠ Espèce hors plan de gestion:', especeDetectee);

      // Retourner les informations détectées même si hors plan de gestion
      const result = {
        espece: analysisData.espece || 'Espèce non identifiée',
        nom_scientifique: 'N/A',
        icone: '🐟',
        confidence: analysisData.confidence || 0,
        taille_moyenne_cm: analysisData.taille_estimee_cm || 0,
        poids_moyen_g: 0,
        comptage: analysisData.comptage || 0,
        poids_total_kg: '0.00',
        qualite: analysisData.qualite || 'N/A',
        fraicheur: analysisData.fraicheur || 'N/A',
        calibre: 'N/A',
        conformite_L50: false,
        ratio_L50_pct: 0,
        conformite_export_ue: false,
        raison_analyse: analysisData.raison || 'Espèce identifiée mais non suivie par le plan de gestion',
        hors_plan_gestion: true, // Flag spécial
        date: new Date().toISOString(),
      };

      // Nettoyer le fichier temporaire
      await fs.unlink(req.file.path);

      console.log('✓ Analyse terminée (hors plan):', result.espece, `${result.confidence}%`);
      return res.json(result);
    }

    // Enrichir avec les données BAHRIA
    const especeInfo = ESPECES_BAHRIA[especeDetectee];
    const tailleCm = analysisData.taille_estimee_cm || 15;
    const poidsG = especeInfo.allometric.a * Math.pow(tailleCm, especeInfo.allometric.b);
    const comptage = analysisData.comptage || 1;
    const poidsTotal = (poidsG * comptage) / 1000; // en kg

    // Déterminer le calibre
    let calibre = 'Moyen';
    if (especeDetectee === 'poulpe') {
      if (poidsG < 500) calibre = 'Petit';
      else if (poidsG > 1000) calibre = 'Grand';
    } else {
      if (tailleCm < parseFloat(especeInfo.calibres.petit.match(/\d+/)?.[0] || 0)) {
        calibre = 'Petit';
      } else if (tailleCm > parseFloat(especeInfo.calibres.grand.match(/\d+/)?.[0] || 0)) {
        calibre = 'Grand';
      }
    }

    // Conformité L50
    const conformiteL50 = especeInfo.L50_cm ? tailleCm >= especeInfo.L50_cm : true;
    const ratioL50 = especeInfo.L50_cm ? ((tailleCm / especeInfo.L50_cm) * 100).toFixed(0) : 100;

    // Résultat final
    const result = {
      espece: especeDetectee.charAt(0).toUpperCase() + especeDetectee.slice(1),
      nom_scientifique: especeInfo.nom_scientifique,
      icone: especeInfo.icone,
      confidence: analysisData.confidence,
      taille_moyenne_cm: tailleCm,
      poids_moyen_g: Math.round(poidsG),
      comptage: comptage,
      poids_total_kg: poidsTotal.toFixed(2),
      qualite: analysisData.qualite || 'Bonne',
      fraicheur: analysisData.fraicheur || 'Fraîche',
      calibre: calibre,
      conformite_L50: conformiteL50,
      ratio_L50_pct: ratioL50,
      conformite_export_ue: conformiteL50 && analysisData.qualite !== 'Médiocre',
      raison_analyse: analysisData.raison,
      date: new Date().toISOString(),
    };

    console.log('✓ Analyse terminée:', result.espece, `${result.confidence}%`);

    // Nettoyer le fichier temporaire
    await fs.unlink(req.file.path);

    res.json(result);

  } catch (error) {
    console.error('❌ Erreur analyse:', error);

    // Nettoyer le fichier si erreur
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    res.status(500).json({
      error: 'Erreur lors de l\'analyse',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BAHRIA Cam API' });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 BAHRIA Cam API démarrée sur le port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Analyse: POST http://localhost:${PORT}/api/analyze-image`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠ ANTHROPIC_API_KEY non définie - l\'analyse ne fonctionnera pas');
  }
});
