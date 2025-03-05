// components/SchemaExplanation/CombinedView.tsx
import { Divider, Stack, styled } from '@mui/material';
import SchemaExplanation from './SchemaExplanation';
import RelevantKnowledgeView from './RelevantKnowledgeView';
import { SectionHeader } from '../../layout/components';

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
    onGenerateExplanation: () => void;
    matchingValues: string[][];
    relevantKnowledge: RelevantKnowledge[];
    isLoading: boolean;
    selectedCandidate?: Candidate;
    gdcAttribute?: GDCAttribute;
    relatedOuterSources: RelatedSource[];
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
    onGenerateExplanation,
    matchingValues,
    relevantKnowledge,
    isLoading,
    selectedCandidate,
    gdcAttribute,
    relatedOuterSources,
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
                    onGenerateExplanation={onGenerateExplanation}
                    valueMatches={matchingValues}
                    selectedCandidate={selectedCandidate}
                    isLoading={isLoading}
                />
            </Stack>
            <Stack flex={4} sx={{ flexGrow: 1 }}>
                <SectionHeader>
                    Relevant Knowledge
                </SectionHeader>
                <RelevantKnowledgeView
                    relevantKnowledge={relevantKnowledge}
                    gdcAttribute={gdcAttribute}
                    isLoading={isLoading}
                    relatedOuterSources={relatedOuterSources}
                />
            </Stack>
            </ColumnComp>
        </Stack>
    );
}

export default CombinedView;