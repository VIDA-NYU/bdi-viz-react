// types/explanation.ts
type ExplanationType = 'name' | 'token' | 'value' | 'semantic';

interface Explanation {
    id: string;
    type: ExplanationType;
    content: string;
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
