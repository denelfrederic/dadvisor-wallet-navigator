
// Helper to read file content
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Échec de lecture du fichier"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier"));
    };
    
    // Determine how to read the file based on its type
    if (file.type.includes('text') || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.json') || 
        file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      // For binary files, read as text but we'll only use metadata
      reader.readAsText(file);
    }
  });
};

// Function to extract text from PDF using FileReader (basic browser approach)
export const extractPdfText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error("Échec de lecture du PDF"));
        return;
      }
      
      try {
        // For PDF files we're limited in browser environment
        // This is a placeholder that will extract whatever text is easily accessible
        const arrayBuffer = event.target.result as ArrayBuffer;
        
        // Basic text extraction from binary data
        // This will only extract plain text that's directly embedded
        const textDecoder = new TextDecoder('utf-8');
        let text = textDecoder.decode(arrayBuffer);
        
        // Clean up the text - remove binary garbage
        text = text.replace(/[^\x20-\x7E\r\n]/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
        
        // If we couldn't extract meaningful text, provide a placeholder
        if (text.length < 50 || text.includes('%PDF')) {
          text = `[Document PDF: ${file.name}. Contenu binaire non extractible côté client.]`;
          console.log("Extraction de texte PDF limitée, contenu binaire détecté");
        }
        
        resolve(text);
      } catch (error) {
        console.error("Erreur lors de l'extraction du texte PDF:", error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du PDF"));
    };
    
    // Read the PDF as ArrayBuffer to process its binary content
    reader.readAsArrayBuffer(file);
  });
};
