
declare interface Candidate {
    sourceColumn: string;
    targetColumn: string;
    score: number;
}

declare interface SourceCluster {
    sourceColumn: string;
    cluster: string[];
}

declare interface UserOperation {
    operation: string; // accept, reject, discard
    candidate: Candidate; // the candidate to operate on
    references: Candidate[]; // the references to the candidate
}