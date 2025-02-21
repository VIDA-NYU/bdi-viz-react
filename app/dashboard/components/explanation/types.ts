// types/explanation.ts
type ExplanationType = 'name' | 'token' | 'value' | 'semantic';

interface Explanation {
    id: string;
    isMatch: boolean;
    type: ExplanationType;
    reason: string;
    reference: string;
    confidence: number;
}

interface SchemaMatch {
    sourceColumn: string;
    targetColumn: string;
    selectedExplanations: Explanation[];
    score: number;
}

export type {
    ExplanationType,
    Explanation,
    SchemaMatch
};
