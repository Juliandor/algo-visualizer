/** Shared metadata for all algorithms (explanation, complexity, pseudocode). */
export interface AlgorithmInfo {
  id: string;
  name: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
    space: string;
  };
  description: string;
  pros: string[];
  cons: string[];
  /** Pseudocode lines. Steps reference these lines by index. */
  pseudocode: string[];
}
