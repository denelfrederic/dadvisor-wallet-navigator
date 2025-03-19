
import { updateDocumentEmbeddings } from "./documentUpdateService";
import { updateEntriesEmbeddings } from "./entry";

/**
 * Combined service to update both document and knowledge entry embeddings
 */
export const updateAllEmbeddings = async (
  onProgress?: (message: string) => void
) => {
  onProgress?.("Démarrage de la mise à jour complète des embeddings...");
  
  // Update document embeddings
  onProgress?.("Mise à jour des embeddings de documents...");
  const docResult = await updateDocumentEmbeddings(onProgress);
  
  // Update knowledge entries embeddings
  onProgress?.("Mise à jour des embeddings d'entrées de connaissance...");
  const { succeeded: entriesSucceeded, failures: entriesFailures } = 
    await updateEntriesEmbeddings([], onProgress);
  
  // Compile results
  const totalSucceeded = (docResult?.count || 0) + entriesSucceeded;
  const totalFailures = ((docResult?.success === false) ? 1 : 0) + entriesFailures;
  
  onProgress?.(`Mise à jour terminée. Réussis: ${totalSucceeded}, Échoués: ${totalFailures}`);
  
  return {
    updated: totalSucceeded,
    failed: totalFailures,
    success: docResult.success,
    error: docResult.error
  };
};
