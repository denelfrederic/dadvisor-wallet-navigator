
/**
 * Fonctions de recommandation de portefeuilles
 */

import { portfolios } from "./data";
import { QuestionnaireResponses } from "@/utils/questionnaire/types";

/**
 * Détermine le profil d'investissement recommandé basé sur le score de risque
 * et les réponses spécifiques au questionnaire
 * @param riskScore Le score de risque calculé
 * @param answers Les réponses au questionnaire (optionnel)
 * @returns L'ID du portefeuille recommandé
 */
export const getRecommendedPortfolio = (riskScore: number, answers?: QuestionnaireResponses): string => {
  // Vérification si answers est défini
  let questionnaireAnswers: QuestionnaireResponses | null = answers || null;
  
  // Pour le débogage
  console.log("Recommandation de portefeuille pour score:", riskScore, "avec réponses:", 
    questionnaireAnswers ? Object.keys(questionnaireAnswers).length : "aucune");
  
  if (!questionnaireAnswers) {
    try {
      const storedAnswers = localStorage.getItem('dadvisor_temp_answers');
      if (storedAnswers) {
        questionnaireAnswers = JSON.parse(storedAnswers);
        console.log("Réponses chargées du localStorage pour recommandation:", 
          Object.keys(questionnaireAnswers || {}).length);
      } else {
        console.log("Aucune réponse trouvée dans le localStorage pour recommandation");
      }
    } catch (error) {
      console.error("Erreur lors du chargement des réponses du localStorage:", error);
    }
  }
  
  // Si toujours pas de réponses, utiliser uniquement le score
  if (!questionnaireAnswers || Object.keys(questionnaireAnswers).length === 0) {
    console.log("Utilisation uniquement du score pour recommandation:", riskScore);
    return getRecommendationByScore(riskScore);
  }
  
  // PRIORITÉ ABSOLUE: Vérification de la préférence pour la souveraineté économique
  if (questionnaireAnswers.sovereignty) {
    console.log("Réponse détaillée sur la souveraineté:", JSON.stringify(questionnaireAnswers.sovereignty, null, 2));
    
    // Vérification des ID d'options et valeurs numériques (plus stricte)
    if (questionnaireAnswers.sovereignty.optionId === "sovereignty-3" || 
        questionnaireAnswers.sovereignty.optionId === "sovereignty-4") {
      
      console.log("⭐ MATCH sur préférence forte pour souveraineté - Option 3 ou 4 sélectionnée");
      return "wareconomy"; // ID de "Économie de guerre"
    }
    
    // Si valeur est >= 3, c'est aussi une préférence forte
    if (questionnaireAnswers.sovereignty.value >= 3) {
      console.log("⭐ MATCH sur préférence forte pour souveraineté - Valeur >= 3");
      return "wareconomy";
    }
    
    // Vérification du texte des réponses pour la souveraineté
    if (questionnaireAnswers.sovereignty.text) {
      const lowercaseText = questionnaireAnswers.sovereignty.text.toLowerCase();
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté") ||
          lowercaseText.includes("national") ||
          lowercaseText.includes("patriot")) {
        
        console.log("⭐ MATCH sur le texte de souveraineté:", lowercaseText);
        return "wareconomy"; // ID de "Économie de guerre"
      }
    }
  }
  
  // Recherche de mots-clés liés à la souveraineté dans TOUTES les réponses - ANALYSE APPROFONDIE
  for (const questionId in questionnaireAnswers) {
    if (!questionnaireAnswers[questionId]) continue;
    
    const answer = questionnaireAnswers[questionId];
    
    if (answer && answer.text) {
      const lowercaseText = answer.text.toLowerCase();
      
      // Recherche de mots-clés pertinents avec plus de précision
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté") ||
          lowercaseText.includes("national") ||
          lowercaseText.includes("local") ||
          lowercaseText.includes("patriot") ||
          lowercaseText.includes("indépend")) {
        
        console.log("⭐ MATCH sur le texte dans la question", questionId, ":", lowercaseText);
        return "wareconomy"; // ID de "Économie de guerre"
      }
    }
  }
  
  // Si aucune préférence de souveraineté n'est détectée, utiliser la logique basée sur le score
  console.log("Aucune préférence de souveraineté détectée, utilisation du score:", riskScore);
  return getRecommendationByScore(riskScore);
};

/**
 * Obtient une recommandation basée uniquement sur le score
 * @param riskScore Le score de risque calculé
 * @returns L'ID du portefeuille recommandé
 */
function getRecommendationByScore(riskScore: number): string {
  console.log("Recommandation basée uniquement sur le score:", riskScore);
  
  if (riskScore < 40) {
    return "conservative";
  } else if (riskScore < 70) {
    return "balanced";
  } else {
    return "growth";
  }
}

/**
 * Analyse les réponses du questionnaire pour extraire les préférences thématiques
 * @param answers Les réponses au questionnaire
 * @returns Un objet contenant les préférences détectées
 */
export const analyzeInvestmentPreferences = (answers: QuestionnaireResponses): Record<string, boolean> => {
  const preferences: Record<string, boolean> = {
    sovereigntyFocus: false,
    cryptoInterest: false
  };
  
  if (!answers || Object.keys(answers).length === 0) return preferences;
  
  // Détecte l'intérêt pour la souveraineté économique
  if (answers.sovereignty) {
    if (answers.sovereignty.value >= 3 || 
        answers.sovereignty.optionId === "sovereignty-3" || 
        answers.sovereignty.optionId === "sovereignty-4") {
      preferences.sovereigntyFocus = true;
    } else if (answers.sovereignty.value >= 2 || 
               answers.sovereignty.optionId === "sovereignty-2") {
      // Préférence modérée pour la souveraineté
      preferences.sovereigntyFocus = true;
    }
    
    // Vérification basée sur le texte
    if (answers.sovereignty.text) {
      const lowercaseText = answers.sovereignty.text.toLowerCase();
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté")) {
        preferences.sovereigntyFocus = true;
      }
    }
  }
  
  // Vérification dans toutes les réponses
  for (const questionId in answers) {
    if (!answers[questionId]) continue;
    
    const answer = answers[questionId];
    if (answer && answer.text) {
      const lowercaseText = answer.text.toLowerCase();
      if (lowercaseText.includes("france") || 
          lowercaseText.includes("europe") || 
          lowercaseText.includes("français") || 
          lowercaseText.includes("européen") || 
          lowercaseText.includes("souveraineté") ||
          lowercaseText.includes("national") ||
          lowercaseText.includes("local") ||
          lowercaseText.includes("patriot")) {
        preferences.sovereigntyFocus = true;
      }
    }
  }
  
  // Détecte l'intérêt pour les cryptomonnaies
  if (answers.crypto && answers.crypto.value >= 3) {
    preferences.cryptoInterest = true;
  }
  
  return preferences;
};
