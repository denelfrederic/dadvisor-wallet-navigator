
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEmbeddingsUpdate } from "../search/hooks/useEmbeddingsUpdate";
import { Database, RefreshCcw, AlertCircle, Info, Download, HelpCircle, Repeat } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const EmbeddingMaintenance = () => {
  const { 
    isUpdating, 
    progress, 
    logs, 
    errorSummary,
    updateDocumentEmbeddings, 
    clearLogs,
    exportLogs,
    retryLastOperation
  } = useEmbeddingsUpdate();

  // Format progress as an integer
  const displayProgress = Math.round(progress);

  // Handler pour indexation standard
  const handleStandardUpdate = () => {
    updateDocumentEmbeddings(false);
  };

  // Handler pour indexation forcée
  const handleForceUpdate = () => {
    updateDocumentEmbeddings(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Indexation Pinecone
        </CardTitle>
        <CardDescription>
          Indexez vos documents dans Pinecone pour la recherche sémantique
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            className="flex items-center justify-center gap-2 h-auto py-6"
            onClick={handleStandardUpdate}
            disabled={isUpdating}
          >
            <div className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-500" />
              <div className="text-left">
                <div className="font-semibold">Indexer nouveaux documents</div>
                <div className="text-xs text-muted-foreground">Mettre à jour les documents non indexés</div>
              </div>
            </div>
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  className="flex items-center justify-center gap-2 h-auto py-6"
                  onClick={handleForceUpdate}
                  disabled={isUpdating}
                  variant="outline"
                >
                  <div className="flex items-center">
                    <Repeat className="h-5 w-5 mr-2 text-orange-500" />
                    <div className="text-left">
                      <div className="font-semibold">Réindexer TOUS les documents</div>
                      <div className="text-xs text-muted-foreground">Forcer la réindexation même des documents déjà indexés</div>
                    </div>
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">Cette option force la réindexation de tous les documents, même ceux déjà indexés. Utile en cas de changement de configuration Pinecone.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {isUpdating && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Progression: {displayProgress}%</p>
            <Progress value={displayProgress} className="h-2" />
          </div>
        )}
        
        {errorSummary && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur détectée</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{errorSummary}</p>
              
              {errorSummary.includes("403") && (
                <div className="mt-2 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  <p className="font-semibold">Erreur d'autorisation (403 Forbidden):</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Vérifiez que la clé API Pinecone est correctement configurée dans les secrets Supabase</li>
                    <li>Vérifiez que l'index "{Pinecone_index}" existe dans votre compte Pinecone</li>
                    <li>Vérifiez que l'URL de base Pinecone est correcte</li>
                  </ul>
                </div>
              )}
              
              {/* Bouton de solution alternative */}
              <Button
                variant="outline"
                size="sm"
                onClick={retryLastOperation}
                className="mt-2"
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Réessayer avec configuration alternative
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          <ScrollArea className="h-48 border rounded-md p-2">
            <div className="space-y-1">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <p key={index} className="text-xs font-mono">
                    {log}
                  </p>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                  <p className="text-sm">Aucun log disponible</p>
                  <p className="text-xs mt-1">Lancez une indexation pour générer des logs</p>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {logs.length > 0 && (
            <div className="absolute bottom-2 right-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={exportLogs}
                    >
                      <Download className="h-3 w-3" />
                      <span className="sr-only">Exporter les logs</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Exporter les logs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {!isUpdating && logs.length > 0 && !errorSummary && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Opération terminée</AlertTitle>
            <AlertDescription>
              L'indexation des documents est terminée.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-1">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            L'indexation via Pinecone permet d'améliorer la recherche sémantique
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={clearLogs}
          disabled={logs.length === 0}
        >
          Effacer les logs
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmbeddingMaintenance;
