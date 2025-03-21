
import { Question } from "./types";
import { 
  investmentBasicsQuestions,
  riskProfileQuestions,
  personalFinanceQuestions,
  specializedInvestmentsQuestions
} from "./categories";

/**
 * Questions du questionnaire de profilage
 */
export const questions: Question[] = [
  ...investmentBasicsQuestions,
  ...riskProfileQuestions,
  ...personalFinanceQuestions,
  ...specializedInvestmentsQuestions
];
