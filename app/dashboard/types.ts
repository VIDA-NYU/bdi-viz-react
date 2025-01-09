

type ExplanationType = 'name' | 'token' | 'value' | 'semantic';

type Explanation = {
    id: string;
    type: ExplanationType;
    content: string;
    confidence: number;
}

type Candidate = {
    sourceColumn: string;
    targetColumn: string;
    score: number;
}

type SourceCluster = {
    id: string;
    columns: string[];
}

type UserOperation = {
    operation: 'accept' | 'reject' | 'discard';
    candidate: Candidate;
    references: Candidate[];
}

type DashboardFilters = {
    selectedCandidate: Candidate | undefined;
    sourceColumn: string;
    candidateType: string;
    similarSources: number;
    candidateThreshold: number;
}

type ControlPanelProps = {
    sourceColumns: string[];
    onSourceColumnSelect: (column: string) => void;
    onCandidateTypeSelect: (type: string) => void;
    onSimilarSourcesSelect: (num: number) => void;
    onCandidateThresholdSelect: (num: number) => void;
    acceptMatch: () => void;
    rejectMatch: () => void;
    discardColumn: () => void;
    undo: () => void;
    redo: () => void;
}

type HeatMapProps = {
    data: Candidate[];
    sourceClusters: SourceCluster[];
    setSelectedCandidate: (candidate: Candidate | undefined) => void;
    filters: DashboardFilters;
}

type FileUploadingProps = {
    callback: (candidates: Candidate[], sourceClusters: SourceCluster[]) => void;
}

type ChatBoxProps = {
    callback: (candidates: Candidate[]) => void;
};

// Core Types
export type {
    ExplanationType,
    Explanation,
    Candidate,
    SourceCluster,
    UserOperation,
    DashboardFilters,
    ControlPanelProps,
    HeatMapProps,
    FileUploadingProps,
    ChatBoxProps
};