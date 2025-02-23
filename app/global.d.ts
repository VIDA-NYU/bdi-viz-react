
declare interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
    matcher?: string;
}

type AggregatedCandidate = {
    id: number;
    sourceColumn: string;
    targetColumn: string;
    matchers: string[];
    score: number;
}

declare interface SourceCluster {
    sourceColumn: string;
    cluster: string[];
}

declare interface TargetOntology {
    name: string;
    parent: string;
    grandparent: string;
}

declare interface UniqueValue {
    value: string;
    count: number;
}

declare interface SourceUniqueValues {
    sourceColumn: string;
    uniqueValues: UniqueValue[];
}

declare interface TargetUniqueValues {
    targetColumn: string;
    uniqueValues: UniqueValue[];
}

declare interface ValueMatch {
    sourceColumn: string;
    sourceValues: string[];
    targets: TargetValueMatch[];
}

declare interface TargetValueMatch {
    targetColumn: string;
    targetValues: string[];
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
    id: string;
    isMatch: boolean;
    type: string;
    reason: string;
    reference: string;
    confidence: number;
}

declare type ExplanationType = 'name' | 'token' | 'value' | 'semantic';

declare interface Explanation {
    id: string;
    isMatch: boolean;
    type: ExplanationType;
    reason: string;
    reference: string;
    confidence: number;
}

declare interface RelevantKnowledge {
    entry: string;
    description: string;
}

declare interface CandidateExplanation {
    isMatch: boolean;
    explanations: ExplanationObject[];
    matchingValues?: string[][]; // [source value, target value]
    relevantKnowledge?: RelevantKnowledge[];
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

declare interface Matcher {
    name: string;
    weight: number;
}

declare interface GDCAttribute {
    name: string;
    category: string;
    node: string;
    type: string;
    description: GDCDescription[];
    enum?: string[];
    minimum?: number;
    maximum?: number;
}

declare interface GDCDescription {
    description: string;
    termDef?: object;
}