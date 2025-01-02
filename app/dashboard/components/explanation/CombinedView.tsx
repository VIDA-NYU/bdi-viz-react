// components/SchemaExplanation/CombinedView.tsx
import { Stack, styled } from '@mui/material';
import SchemaExplanation from './SchemaExplanation';
import InferredMatches, { InferredMatch } from './InferenceMatches';
import RelativeKnowledgeView from './RelativeKnowledgeView';
import { Explanation } from './types';
import {useInferredMatches} from './useInferenceMatches';
import { SchemaMatch } from './types';

const RowComp = styled("div")({
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    marginTop: "28px",
    paddingTop: "35px",
    paddingBottom: "45px"
})
interface CombinedViewProps {
    isMatch: boolean;
    currentExplanations: Explanation[];
    matchingValues: string[][];
    relativeKnowledge: RelativeKnowledge[];
    matches: SchemaMatch[];
    onAcceptMatch: (explanations: Explanation[]) => void;
    sourceColumn?: string;
    targetColumn?: string;
    allSourceColumns: string[];
    allTargetColumns: string[];
}

const CombinedView = ({
    isMatch,
    currentExplanations,
    matchingValues,
    relativeKnowledge,
    matches,
    onAcceptMatch,
    sourceColumn,
    targetColumn,
    allSourceColumns,
    allTargetColumns
}: CombinedViewProps) => {
    const {
        inferredMatches,
        handleExplanationsChange,
        acceptInferredMatch,
        rejectInferredMatch
    } = useInferredMatches({
        sourceColumn,
        allSourceColumns,
        allTargetColumns
    });

    const handleAcceptMatch = (explanations: Explanation[]) => {
        onAcceptMatch(explanations);
        handleExplanationsChange(explanations);
    };

    return (
        <Stack spacing={2}>
            <RowComp>
            <SchemaExplanation
                isMatch={isMatch}
                currentExplanations={currentExplanations}
                valueMatches={matchingValues}
                matches={matches}
                onAcceptMatch={handleAcceptMatch}
                sourceColumn={sourceColumn}
                targetColumn={targetColumn}
            />
            <RelativeKnowledgeView
                relativeKnowledge={relativeKnowledge}
            />
            {/* <InferredMatches
                inferredMatches={inferredMatches}
                onAcceptInferred={acceptInferredMatch}
                onRejectInferred={rejectInferredMatch}
            /> */}
            </RowComp>
            
        </Stack>
    );
}

export default CombinedView;