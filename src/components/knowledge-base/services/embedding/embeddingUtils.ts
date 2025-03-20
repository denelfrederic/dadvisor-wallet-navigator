
/**
 * Utilitaires pour la gestion des embeddings
 */

/**
 * Vérifie si un embedding est valide (tableau de nombres)
 * @param embedding L'embedding à vérifier
 * @returns true si l'embedding est valide, false sinon
 */
export const isValidEmbedding = (embedding: any): boolean => {
  // Vérifier que c'est un tableau
  if (!Array.isArray(embedding)) {
    console.error("L'embedding n'est pas un tableau:", typeof embedding);
    return false;
  }
  
  // Vérifier que le tableau n'est pas vide
  if (embedding.length === 0) {
    console.error("L'embedding est un tableau vide");
    return false;
  }
  
  // Vérifier que tous les éléments sont des nombres
  const allNumbers = embedding.every(value => typeof value === 'number');
  if (!allNumbers) {
    console.error("L'embedding contient des valeurs non numériques");
    return false;
  }
  
  return true;
};

/**
 * Parse un embedding depuis le format stocké en base de données
 * @param embeddingData L'embedding tel que stocké en base de données
 * @returns L'embedding sous forme de tableau de nombres
 */
export const parseEmbedding = (embeddingData: any): number[] | null => {
  try {
    if (!embeddingData) return null;
    
    // Si c'est déjà un tableau, vérifier que c'est bien un tableau de nombres
    if (Array.isArray(embeddingData)) {
      if (isValidEmbedding(embeddingData)) {
        return embeddingData;
      }
      return null;
    }
    
    // Si c'est une chaîne JSON, la parser
    if (typeof embeddingData === 'string') {
      try {
        const parsed = JSON.parse(embeddingData);
        if (isValidEmbedding(parsed)) {
          return parsed;
        }
        return null;
      } catch (e) {
        console.error("Erreur lors du parsing de l'embedding:", e);
        return null;
      }
    }
    
    // Cas non géré
    console.error("Format d'embedding non reconnu:", typeof embeddingData);
    return null;
  } catch (error) {
    console.error("Erreur lors du parsing de l'embedding:", error);
    return null;
  }
};

/**
 * Prépare un embedding pour le stockage en base de données
 * @param embedding L'embedding sous forme de tableau de nombres
 * @returns L'embedding formaté pour le stockage
 */
export const prepareEmbeddingForStorage = (embedding: number[]): string => {
  if (!isValidEmbedding(embedding)) {
    throw new Error("L'embedding n'est pas valide pour le stockage");
  }
  
  return JSON.stringify(embedding);
};
