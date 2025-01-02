
declare interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
}

declare interface SourceCluster {
    sourceColumn: string;
    cluster: string[];
}

declare interface DiagnoseObject {
    reason: string;
    confidence: number;
}

declare interface AgentDiagnosis {
    diagnosis: DiagnoseObject[];
    response: string;
    status: string;
}

declare interface UserOperation {
    operation: string; // accept, reject, discard
    candidate: Candidate; // the candidate to operate on
    references: Candidate[]; // the references to the candidate
}

declare interface ExplanationObject {
    type: string;
    content: string;
    confidence: number;
}

declare interface RelativeKnowledge {
    entry: string;
    description: string;
}

declare interface CandidateExplanation {
    isMatch: boolean;
    explanations: ExplanationObject[];
    matchingValues?: string[][]; // [source value, target value]
    relativeKnowledge?: RelativeKnowledge[];
}