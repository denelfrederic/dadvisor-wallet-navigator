
// Service pour l'insertion de vecteurs dans Pinecone
import { PINECONE_API_KEY, PINECONE_BASE_URL, ALTERNATIVE_PINECONE_URL, PINECONE_INDEX } from "../../config.ts";
import { PINECONE_HEADERS, REQUEST_TIMEOUT, validatePineconeConfig } from "./config.ts";

/**
 * Insère un vecteur dans Pinecone
 * @param id Identifiant du document
 * @param vector Vecteur d'embedding
 * @param metadata Métadonnées associées au document
 */
export async function upsertToPinecone(id: string, vector: number[], metadata: any): Promise<any> {
  if (!validatePineconeConfig()) {
    throw new Error('Configuration Pinecone invalide');
  }
  
  console.log(`Insertion dans Pinecone pour document ID: ${id}, avec metadata: ${JSON.stringify(metadata)}`);
  
  try {
    const vectorData = {
      vectors: [
        {
          id,
          values: vector,
          metadata
        }
      ],
      namespace: 'documents' // Organisation en namespaces
    };
    
    // Logs détaillés pour le debugging
    console.log(`Tentative d'insertion à l'URL: ${PINECONE_BASE_URL}/vectors/upsert`);
    
    // Requête avec un timeout plus long (30 secondes)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      const response = await fetch(`${PINECONE_BASE_URL}/vectors/upsert`, {
        method: 'POST',
        headers: PINECONE_HEADERS,
        body: JSON.stringify(vectorData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Capturer le texte de la réponse pour debugging
      const responseText = await response.text();
      
      if (!response.ok) {
        // Logging détaillé de l'erreur
        console.error(`Erreur API Pinecone (${response.status}): ${responseText}`);
        
        // Essai avec URL alternative
        console.log("Première tentative échouée, essai avec une URL alternative...");
        return await tryAlternativePineconeStructure(vectorData);
      }
      
      const result = responseText ? JSON.parse(responseText) : {};
      console.log(`Insertion Pinecone réussie`);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Erreur lors de la première tentative d'insertion", error instanceof Error ? error.message : String(error));
      
      // Essai avec URL alternative en cas d'erreur
      console.log("Tentative avec structure alternative suite à une exception...");
      return await tryAlternativePineconeStructure(vectorData);
    }
  } catch (error) {
    console.error('Error upserting to Pinecone', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Tentative avec une structure Pinecone alternative
 * Cette méthode utilise un format de requête différent compatible avec certaines versions de l'API Pinecone
 */
async function tryAlternativePineconeStructure(vectorData: any): Promise<any> {
  // Format de payload alternatif pour les nouvelles versions de l'API
  const alternativePayload = {
    upsertRequest: {
      vectors: vectorData.vectors,
      namespace: vectorData.namespace
    }
  };
  
  console.log(`Tentative avec URL alternative: ${ALTERNATIVE_PINECONE_URL}/upsert`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  
  try {
    const response = await fetch(`${ALTERNATIVE_PINECONE_URL}/upsert`, {
      method: 'POST',
      headers: PINECONE_HEADERS,
      body: JSON.stringify(alternativePayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseText = await response.text();
    console.log(`Réponse alternative (${response.status}): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      console.log(`Alternative également échouée (${response.status}): ${responseText}`);
      
      // En dernier recours, tenter une troisième structure d'URL
      console.log("Dernière tentative avec structure d'API legacy...");
      return await tryLegacyPineconeEndpoint(vectorData);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    console.log("Tentative alternative réussie!");
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Erreur lors de la tentative alternative", error instanceof Error ? error.message : String(error));
    
    // Dernier essai avec structure legacy
    return await tryLegacyPineconeEndpoint(vectorData);
  }
}

/**
 * Dernière tentative avec un endpoint legacy de Pinecone
 */
async function tryLegacyPineconeEndpoint(vectorData: any): Promise<any> {
  // Format compatible avec les anciennes versions de l'API
  const legacyUrl = `https://api.pinecone.io/v1/vectors/upsert?environment=${PINECONE_INDEX}`;
  
  console.log(`Dernière tentative avec URL legacy: ${legacyUrl}`);
  
  try {
    const response = await fetch(legacyUrl, {
      method: 'POST',
      headers: PINECONE_HEADERS,
      body: JSON.stringify(vectorData),
    });
    
    const responseText = await response.text();
    console.log(`Réponse legacy (${response.status}): ${responseText.substring(0, 500)}`);
    
    if (!response.ok) {
      console.log(`Tentative legacy également échouée (${response.status}): ${responseText}`);
      throw new Error(`Toutes les tentatives d'insertion dans Pinecone ont échoué (${response.status}): ${responseText}`);
    }
    
    const result = responseText ? JSON.parse(responseText) : {};
    console.log("Tentative legacy réussie!");
    return result;
  } catch (error) {
    console.error("Échec de toutes les tentatives d'insertion dans Pinecone", error instanceof Error ? error.message : String(error));
    throw new Error(`Échec de toutes les tentatives d'insertion dans Pinecone: ${error instanceof Error ? error.message : String(error)}`);
  }
}
