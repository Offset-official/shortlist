export interface CodingProblem {
    id: number;
    title: string;
    difficulty: string; // Expected values: "Easy", "Medium", "Hard"
    description: string;
    category: string[]; // E.g., ["Arrays", "Dynamic Programming"]
  }
  
