// components/SchemaExplanation/CombinedView.tsx
import { Divider, Stack, styled } from '@mui/material';
import SchemaExplanation from './SchemaExplanation';
import RelevantKnowledgeView from './RelevantKnowledgeView';

const RowComp = styled("div")({
    display: "flex",
    flexDirection: "row",
    alignItems: "stretch",
    width: "100%",
    marginTop: "28px",
    paddingTop: "35px",
    paddingBottom: "45px"
})

const ColumnComp = styled("div")({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    marginTop: "0px",
    paddingTop: "0px",
    paddingBottom: "0px"
})
interface CombinedViewProps {
    isMatch: boolean;
    currentExplanations: Explanation[];
    selectedExplanations: Explanation[];
    thumbUpExplanations: string[];
    thumbDownExplanations: string[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    setThumbUpExplanations: (id: string[]) => void;
    setThumbDownExplanations: (id: string[]) => void;
    matchingValues: string[][];
    relevantKnowledge: RelevantKnowledge[];
    isLoading: boolean;
    sourceColumn?: string;
    targetColumn?: string;
    gdcAttribute?: GDCAttribute;
}

const CombinedView = ({
    isMatch,
    currentExplanations,
    selectedExplanations,
    thumbUpExplanations,
    thumbDownExplanations,
    setSelectExplanations,
    setThumbUpExplanations,
    setThumbDownExplanations,
    matchingValues,
    relevantKnowledge,
    isLoading,
    sourceColumn,
    targetColumn,
    gdcAttribute,
}: CombinedViewProps) => {

    return (
        <Stack spacing={2}>
            <ColumnComp>
            <Stack flex={8} sx={{ maxHeight: 500 }}>
                <SchemaExplanation
                    isMatch={isMatch}
                    currentExplanations={currentExplanations}
                    selectedExplanations={selectedExplanations}
                    thumbUpExplanations={thumbUpExplanations}
                    thumbDownExplanations={thumbDownExplanations}
                    setSelectExplanations={setSelectExplanations}
                    setThumbUpExplanations={setThumbUpExplanations}
                    setThumbDownExplanations={setThumbDownExplanations}
                    valueMatches={matchingValues}
                    sourceColumn={sourceColumn}
                    targetColumn={targetColumn}
                    isLoading={isLoading}
                />
            </Stack>
            <Stack flex={4}>
                <RelevantKnowledgeView
                    relevantKnowledge={relevantKnowledge}
                    gdcAttribute={gdcAttribute}
                    isLoading={isLoading}
                />
            </Stack>
            </ColumnComp>
        </Stack>
    );
}

export default CombinedView;