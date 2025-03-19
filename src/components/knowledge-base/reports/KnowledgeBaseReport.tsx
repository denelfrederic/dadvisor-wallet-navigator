
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import KnowledgeBaseCard from "./components/KnowledgeBaseCard";
import EmptyReportState from "./components/EmptyReportState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KnowledgeBaseStats } from "../types";
import { isValidEmbedding } from "../services/embedding/embeddingUtils";

const KnowledgeBaseReport = () => {
  const [report, setReport] = useState<KnowledgeBaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Générer le rapport au chargement initial
  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsLoading(true);
    console.log("Génération du rapport de la base de connaissances...");
    try {
      // Récupérer le nombre total d'entrées
      const { count, error } = await supabase
        .from('knowledge_entries')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
      }
      
      // Vérifier les catégories (sources) et les embeddings
      let categories: Record<string, number> = {};
      let withEmbeddings = 0;
      
      // Récupérer toutes les entrées pour analyse
      const { data: entries, error: entriesError } = await supabase
        .from('knowledge_entries')
        .select('id, source, embedding');
      
      if (entriesError) {
        throw new Error(`Erreur lors de l'analyse des entrées: ${entriesError.message}`);
      }
      
      if (entries) {
        console.log(`Analyse de ${entries.length} entrées de connaissances pour embeddings`);
        
        // Compter les entrées avec embeddings valides
        for (const entry of entries) {
          try {
            const hasValidEmbedding = entry.embedding && isValidEmbedding(entry.embedding);
            if (hasValidEmbedding) {
              withEmbeddings++;
              console.log(`Entrée ${entry.id.substring(0, 8)} a un embedding valide`);
            } else {
              console.log(`Entrée ${entry.id.substring(0, 8)} n'a PAS d'embedding valide`);
            }
            
            // Analyser les sources comme catégories
            const category = entry.source || 'Non catégorisé';
            categories[category] = (categories[category] || 0) + 1;
          } catch (e) {
            console.error(`Erreur lors de la vérification de l'embedding pour l'entrée ${entry.id}:`, e);
          }
        }
      }
      
      // Créer le rapport
      const newReport: KnowledgeBaseStats = { 
        count: count || 0,
        withEmbeddings: withEmbeddings,
        categories: categories,
        categoriesCount: Object.keys(categories).length
      };
      
      console.log("Rapport généré:", newReport);
      setReport(newReport);
      
      // Enregistrer le rapport pour le débogage
      if (typeof window !== 'undefined') {
        (window as any).__knowledgeBaseReport = newReport;
      }
      
      toast({
        title: "Rapport généré",
        description: `${count || 0} entrées analysées dans la base de connaissances`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error("Error generating knowledge base report:", message);
      
      toast({
        title: "Erreur",
        description: `Impossible de générer le rapport: ${message}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">État de la base de connaissances</h2>
        <Button 
          onClick={generateReport} 
          disabled={isLoading}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Analyse...' : 'Actualiser le rapport'}
        </Button>
      </div>

      {report ? (
        <KnowledgeBaseCard knowledgeBaseStats={report} />
      ) : (
        <EmptyReportState 
          isLoading={isLoading} 
          onGenerateReport={generateReport} 
        />
      )}
      
      {/* Bouton de débogage */}
      <div className="text-xs text-gray-400 mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            console.log("Rapport actuel de la base de connaissances:", report);
          }}
        >
          Afficher les données dans la console
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeBaseReport;
