import { 
    Box, 
    Card, 
    List, 
    Typography,
    Stack,
    Chip,
    CircularProgress
} from '@mui/material';
import ExplanationItem from './ExplanationItem';
import { BasicChip, SectionHeader } from '../../layout/components';
import { agentThumbRequest } from '@/app/lib/langchain/agent-helper';
import GenerateExplanationButton from './GenerateExplanationButton';
import { handleCopy } from '../../utils/clipboard';

interface SchemaExplanationProps {
    isMatch: boolean;
    currentExplanations: Explanation[];
    selectedExplanations: Explanation[];
    thumbUpExplanations: string[];
    thumbDownExplanations: string[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    setThumbUpExplanations: (id: string[]) => void;
    setThumbDownExplanations: (id: string[]) => void;
    onGenerateExplanation: () => void;
    valueMatches: string[][];
    selectedCandidate?: Candidate;
    isLoading: boolean;
}

const SchemaExplanation = ({
    isMatch,
    currentExplanations,
    selectedExplanations,
    thumbUpExplanations,
    thumbDownExplanations,
    setSelectExplanations,
    setThumbUpExplanations,
    setThumbDownExplanations,
    onGenerateExplanation,
    valueMatches,
    selectedCandidate,
    isLoading
}: SchemaExplanationProps) => {

    const handleSelect = (explanation: Explanation) => {
        if (selectedExplanations.some(e => e.id === explanation.id)) {
            setSelectExplanations(selectedExplanations.filter(e => e.id !== explanation.id));
        } else {
            setSelectExplanations([...selectedExplanations, explanation]);
        }
    };

    const handleThumbUp = (id: string) => {
        const explanation = currentExplanations.find(e => e.id === id);
        if (explanation) {
            const userOperation = {
                operation: "accept",
                candidate: {
                    sourceColumn: selectedCandidate?.sourceColumn ?? "",
                    targetColumn: selectedCandidate?.targetColumn ?? "",
                    score: explanation.confidence,
                },
                references: [],
            }
            if (explanation.isMatch) {
                agentThumbRequest(explanation, userOperation);
            } else {
                userOperation.operation = "reject";
                agentThumbRequest(explanation, userOperation);
            }
        }
        if (thumbUpExplanations.some(e => e === id)) {
            setThumbUpExplanations(thumbUpExplanations.filter(e => e !== id));
        } else {
            setThumbUpExplanations([...thumbUpExplanations, id]);
        }
    };

    const handleThumbDown = (id: string) => {
        const explanation = currentExplanations.find(e => e.id === id);
        if (explanation) {
            const userOperation = {
                operation: "reject",
                candidate: {
                    sourceColumn: selectedCandidate?.sourceColumn ?? "",
                    targetColumn: selectedCandidate?.targetColumn ?? "",
                    score: explanation.confidence,
                },
                references: [],
            }
            if (explanation.isMatch) {
                agentThumbRequest(explanation, userOperation);
            } else {
                userOperation.operation = "accept";
                agentThumbRequest(explanation, userOperation);
            }
        }
        if (thumbDownExplanations.some(e => e === id)) {
            setThumbDownExplanations(thumbDownExplanations.filter(e => e !== id));
        } else {
            setThumbDownExplanations([...thumbDownExplanations, id]);
        }
    };

    return (
        <Stack spacing={0} sx={{ paddingLeft: 0, maxHeight: "700px", overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Match Selection Display */}
                    {selectedCandidate && (
                        <Box>
                            <SectionHeader>
                                Current Selection
                            </SectionHeader>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <BasicChip 
                                    size="small" 
                                    label={selectedCandidate.sourceColumn} 
                                    color="primary" 
                                    sx={{ fontSize: '0.7rem', fontWeight: "600" }} 
                                    onClick={() => handleCopy(selectedCandidate.sourceColumn)}
                                />
                                <Typography>→</Typography>
                                <BasicChip
                                    size="small" 
                                    label={selectedCandidate.targetColumn} 
                                    color="secondary" 
                                    sx={{ fontSize: '0.7rem', fontWeight: "600" }} 
                                    onClick={() => handleCopy(selectedCandidate.targetColumn)}
                                />
                            </Stack>
                        </Box>
                    )}

                    {/* Is Match */}
                    {selectedCandidate && isMatch !== undefined &&
                        <Box>
                            <Chip
                                size="small"
                                label={isMatch ? "Our agent thinks this is a match." : "Our agent thinks this is not a match."} 
                                sx={{ backgroundColor: isMatch ? 'green' : 'red', color: 'white', fontSize: '0.75rem' }} 
                            />
                        </Box>
                    }

                    {/* Value Matches */}
                    {valueMatches.length > 0 && (
                        <Box>
                            <SectionHeader>
                                Value Matches
                            </SectionHeader>
                            <List>
                                {valueMatches.map((values, index) => (
                                    <Stack direction="row" spacing={1} key={index} sx={{ marginBottom: 0.5 }}>
                                        <BasicChip
                                            variant='filled'
                                            color='primary' 
                                            key={index} 
                                            label={values[0]} 
                                            size="small" 
                                            sx={{ fontSize: "0.6rem", fontWeight: "600" }} 
                                            onClick={() => handleCopy(values[0])}
                                        />
                                        <Typography>→</Typography>
                                        <BasicChip
                                            variant='filled'
                                            color='secondary'
                                            key={index}
                                            label={values[1]}
                                            size="small"
                                            sx={{ fontSize: "0.6rem", fontWeight: "600" }}
                                            onClick={() => handleCopy(values[1])}
                                        />
                                    </Stack>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* Generate Explanation Button */}
                    {currentExplanations.length === 0 && isMatch === true && (
                        <GenerateExplanationButton 
                            selectedCandidate={selectedCandidate as AggregatedCandidate}
                            onClick={onGenerateExplanation}
                        />
                    )}

                    {/* Current Explanations */}
                    {currentExplanations.length > 0 && (
                        <>
                            <Box>
                                <SectionHeader>
                                    Match Explanations
                                </SectionHeader>
                                <List sx={{ margin: 0.5 }}>
                                    {currentExplanations.map(explanation => (
                                        <ExplanationItem
                                            key={explanation.id}
                                            explanation={explanation}
                                            selected={selectedExplanations.some(e => e.id === explanation.id)}
                                            thumbUp={thumbUpExplanations.some(id => id === explanation.id)}
                                            thumbDown={thumbDownExplanations.some(id => id === explanation.id)}
                                            onSelect={handleSelect}
                                            onThumbUpClick={handleThumbUp}
                                            onThumbDownClick={handleThumbDown}
                                        />
                                    ))}
                                </List>
                            </Box>
                        </>
                    )}
                </>
            )}
        </Stack>
    );
}

export default SchemaExplanation;