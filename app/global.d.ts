
declare interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
    matcher?: string;
}

declare interface SourceCluster {
    sourceColumn: string;
    cluster: string[];
}

declare interface CandidateCluster {
    targetColumn: string;
    cluster: string[];
}

declare interface SourceUniqueValues {
    sourceColumn: string;
    uniqueValues: string[];
}

declare interface TargetUniqueValues {
    targetColumn: string;
    uniqueValues: string[];
}

declare interface DiagnoseObject {
    reason: string;
    confidence: number;
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

declare interface AgentAction {
    action: string;
    reason: string;
    confidence: number;
}

declare interface AgentSuggestions {
    actions: AgentAction[];
}

declare interface UserReaction {
    actions: AgentAction[];
    previousOperation: UserOperation;
}

declare interface ActionResponse {
    status: string;
    response: string;
    action: string;
    targetCandidates: Candidate[];
}