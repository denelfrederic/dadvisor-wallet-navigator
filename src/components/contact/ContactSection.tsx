
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Section principale avec les informations de contact
 */
const ContactSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Nous contacter</CardTitle>
        <CardDescription>
          Pour toute question, suggestion ou signalement de problème
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-3">
          <Mail className="h-6 w-6 text-dadvisor-blue mt-0.5" />
          <div>
            <p className="font-medium text-lg mb-1">Email direct</p>
            <a 
              href="mailto:frederic.denel@dadvisor.ai" 
              className="text-dadvisor-blue hover:underline text-xl font-semibold flex items-center gap-2"
            >
              frederic.denel@dadvisor.ai
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-muted-foreground mt-2">
              Pour un traitement plus rapide de votre demande, merci d'inclure des détails précis 
              sur votre requête ou le problème rencontré.
            </p>
          </div>
        </div>
        
        <Alert className="mt-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-800">Délai de réponse</AlertTitle>
          <AlertDescription className="text-blue-700">
            Nous nous efforçons de répondre à tous les messages dans un délai de 48 heures ouvrées.
          </AlertDescription>
        </Alert>
        
        <div className="p-4 bg-dadvisor-lightblue/20 rounded-md border border-dadvisor-blue/30 text-sm text-blue-800 mt-2">
          <p className="font-medium mb-1">Version Alpha</p>
          <p>
            DADVISOR est actuellement en version alpha. Votre retour est précieux 
            pour nous aider à améliorer notre plateforme.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSection;
