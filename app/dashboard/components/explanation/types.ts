// types/explanation.ts
interface SchemaMatch {
    sourceColumn: string;
    targetColumn: string;
    selectedExplanations: Explanation[];
    score: number;
}

export type {
    SchemaMatch
};
