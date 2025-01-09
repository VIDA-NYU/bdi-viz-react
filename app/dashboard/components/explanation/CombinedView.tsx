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
    selectedExplanations: Explanation[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    matchingValues: string[][];
    relativeKnowledge: RelativeKnowledge[];
    matches: SchemaMatch[];
    isLoading: boolean;
    sourceColumn?: string;
    targetColumn?: string;
    allSourceColumns: string[];
    allTargetColumns: string[];
}

const CombinedView = ({
    isMatch,
    currentExplanations,
    selectedExplanations,
    setSelectExplanations,
    matchingValues,
    relativeKnowledge,
    matches,
    isLoading,
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
        setSelectExplanations(explanations);
        handleExplanationsChange(explanations);
    };

    return (
        <Stack spacing={2}>
            <RowComp>
            <Stack flex={8} marginRight={2}>
                <SchemaExplanation
                isMatch={isMatch}
                currentExplanations={currentExplanations}
                selectedExplanations={selectedExplanations}
                setSelectExplanations={setSelectExplanations}
                valueMatches={matchingValues}
                matches={matches}
                sourceColumn={sourceColumn}
                targetColumn={targetColumn}
                isLoading={isLoading}
                />
            </Stack>
            <Stack flex={4}>
                <RelativeKnowledgeView
                relativeKnowledge={relativeKnowledge}
                isLoading={isLoading}
                />
            </Stack>
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