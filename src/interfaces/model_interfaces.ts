export interface CodingProblem {
    id: number;
    title: string;
    difficulty: string; // Expected values: "Easy", "Medium", "Hard"
    description: string;
    category: string[]; // E.g., ["Arrays", "Dynamic Programming"]
  }
  
export type Candidate = {
  id: number;
  name: string;
  email: string;
  year?: number | null;
  collegeName?: string | null;
  location?: string | null;
  resume?: any;
  dreamCompanies: string[];
  skills: string[];
  createdAt: string; // coming as ISO string from JSON
  jobListingId?: number | null;
  shortlistedJobListingId?: number | null;
  resumeAnalysis?: any;
};