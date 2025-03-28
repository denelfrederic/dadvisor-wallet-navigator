
import { motion } from "framer-motion";

/**
 * Interface pour les propriétés du composant ProgressBar
 * @param currentStep - Étape actuelle dans le processus
 * @param totalSteps - Nombre total d'étapes
 * @param labels - Libellés optionnels pour chaque étape
 */
interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

/**
 * Composant ProgressBar - Barre de progression pour les processus multi-étapes
 * Utilisé dans le questionnaire pour indiquer la progression de l'utilisateur
 */
const ProgressBar = ({ currentStep, totalSteps, labels }: ProgressBarProps) => {
  // Calcul du pourcentage de progression
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="relative">
        {/* Piste de fond */}
        <div className="h-1 bg-secondary rounded-full w-full"></div>
        
        {/* Superposition de progression avec animation */}
        <motion.div 
          className="absolute top-0 left-0 h-1 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        ></motion.div>
        
        {/* Marqueurs d'étapes */}
        <div className="flex justify-between mt-1">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep - 1;
            
            return (
              <div key={index} className="flex flex-col items-center">
                <motion.div 
                  className={`w-3 h-3 rounded-full ${
                    isCompleted || isCurrent ? "bg-primary" : "bg-secondary"
                  } relative`}
                  initial={{ scale: 1 }}
                  animate={{ 
                    scale: isCurrent ? 1.5 : 1,
                    boxShadow: isCurrent ? "0 0 0 4px rgba(59, 130, 246, 0.2)" : "none"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Coche pour les étapes complétées */}
                  {isCompleted && !isCurrent && (
                    <motion.svg 
                      className="absolute inset-0 text-white" 
                      viewBox="0 0 24 24"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path 
                        fill="currentColor" 
                        d="M9.55 18l-5.7-5.7 1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"
                      />
                    </motion.svg>
                  )}
                </motion.div>
                
                {/* Libellés des étapes si fournis */}
                {labels && (
                  <span className={`text-xs mt-2 transition-colors ${
                    isCompleted || isCurrent ? "text-primary font-medium" : "text-muted-foreground"
                  }`}>
                    {labels[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
