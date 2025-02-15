
export interface TimelineNode {
    timelineId: number;
    operation: string;
    candidate: Candidate | undefined;
}