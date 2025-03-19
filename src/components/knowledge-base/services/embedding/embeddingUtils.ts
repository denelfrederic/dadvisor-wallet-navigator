
import { KnowledgeEntry } from "../../types";

// Fonction pour déterminer si un embedding est valide
export const isValidEmbedding = (embedding: any): boolean => {
  try {
    // Convertir l'embedding en tableau si c'est une chaîne
    const embeddingArray = typeof embedding === 'string' 
      ? parseEmbedding(embedding)
      : embedding;
    
    // Vérifier si c'est un tableau non vide
    if (!Array.isArray(embeddingArray) || embeddingArray.length === 0) {
      return false;
    }
    
    // Vérifier les dimensions - accepter 384 et 768 (modèles miniLM et mpnet)
    const validDimensions = [384, 768, 1536];
    if (!validDimensions.includes(embeddingArray.length)) {
      console.log(`Embedding de dimensions non valides: ${embeddingArray.length}, attendu l'un de: ${validDimensions.join(', ')}`);
      return false;
    }
    
    // Vérifier que tous les éléments sont des nombres
    const allNumbers = embeddingArray.every(val => typeof val === 'number' && !isNaN(val));
    if (!allNumbers) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'embedding:", error);
    return false;
  }
};

// Fonction pour analyser un embedding stocké sous forme de chaîne
export const parseEmbedding = (embeddingString: string): number[] => {
  try {
    if (!embeddingString) return [];
    
    // Si c'est déjà un tableau, le retourner
    if (Array.isArray(embeddingString)) {
      return embeddingString;
    }
    
    // Analyser la chaîne JSON
    const parsed = JSON.parse(embeddingString);
    
    // Vérifier si c'est un tableau valide après l'analyse
    if (!Array.isArray(parsed)) {
      return [];
    }
    
    return parsed;
  } catch (error) {
    console.error("Erreur lors de l'analyse de l'embedding:", error);
    return [];
  }
};

// Fonction pour préparer un embedding pour le stockage
export const prepareEmbeddingForStorage = (embedding: number[] | string): string => {
  if (typeof embedding === 'string') {
    // Vérifier si c'est déjà une chaîne JSON valide
    try {
      JSON.parse(embedding);
      return embedding;
    } catch {
      // Si ce n'est pas une chaîne JSON valide, essayer de l'encoder
      return JSON.stringify(embedding);
    }
  }
  
  // Si c'est un tableau, le convertir en chaîne JSON
  return JSON.stringify(embedding);
};

// Fonction pour préparer le texte d'une entrée pour l'embedding
export const processEntryForEmbedding = (question: string, answer: string): string => {
  return `Question: ${question.trim()}\nRéponse: ${answer.trim()}`;
};
