
import { TimelineNode } from "./types";
import { useMemo } from "react";

interface useTimelineProps {
    userOperations: UserOperation[];
}

interface useTimelineStates {
    nodes: TimelineNode[];
}

export const useTimeline = ({ userOperations }: useTimelineProps): useTimelineStates => {
    
    const nodes = useMemo(() => {
        const nodes: TimelineNode[] = [];
        userOperations.forEach((operation: UserOperation, index: number) => {
            nodes.push({
                timelineId: index,
                operation: operation.operation,
                candidate: operation.candidate,
            });
        });
        return nodes;
    }, [userOperations]);

    return { nodes };
};