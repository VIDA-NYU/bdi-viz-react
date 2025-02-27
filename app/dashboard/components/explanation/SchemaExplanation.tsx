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
import { SectionHeader } from '../../layout/components';
import { agentThumbRequest } from '@/app/lib/langchain/agent-helper';

interface SchemaExplanationProps {
    isMatch: boolean;
    currentExplanations: Explanation[];
    selectedExplanations: Explanation[];
    thumbUpExplanations: string[];
    thumbDownExplanations: string[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    setThumbUpExplanations: (id: string[]) => void;
    setThumbDownExplanations: (id: string[]) => void
    valueMatches: string[][];
    sourceColumn?: string;
    targetColumn?: string;
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
    valueMatches,
    sourceColumn,
    targetColumn,
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
                    sourceColumn: sourceColumn ?? "",
                    targetColumn: targetColumn ?? "",
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
                    sourceColumn: sourceColumn ?? "",
                    targetColumn: targetColumn ?? "",
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
                    {sourceColumn && targetColumn && (
                        <Box>
                            <SectionHeader>
                                Current Selection
                            </SectionHeader>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip size="small" label={sourceColumn} color="primary" sx={{ fontSize: '0.7rem', fontWeight: "600" }} />
                                <Typography>→</Typography>
                                <Chip size="small" label={targetColumn} color="secondary" sx={{ fontSize: '0.7rem', fontWeight: "600" }} />
                            </Stack>
                        </Box>
                    )}

                    {/* Is Match */}
                    {sourceColumn && targetColumn && isMatch !== undefined &&
                        <Box>
                            <Chip
                                size="small"
                                label={isMatch ? "Our agent thinks this is a match." : "Our agent thinks this is not a match."} 
                                sx={{ backgroundColor: isMatch ? 'green' : 'red', color: 'white', fontSize: '0.75rem' }} 
                            />
                        </Box>
                    }

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

                    {/* Value Matches */}
                    {valueMatches.length > 0 && (
                        <Box>
                            <SectionHeader>
                                Value Matches
                            </SectionHeader>
                            <List>
                                {valueMatches.map((values, index) => (
                                    <Stack direction="row" spacing={1} key={index} sx={{ marginBottom: 0.5 }}>
                                        <Chip variant='filled' color='primary' key={index} label={values[0]} size="small" sx={{ fontSize: "0.6rem", fontWeight: "600" }} />
                                        <Typography>→</Typography>
                                        <Chip variant='filled' color='secondary' key={index} label={values[1]} size="small" sx={{ fontSize: "0.6rem", fontWeight: "600" }} />
                                    </Stack>
                                ))}
                            </List>
                        </Box>
                    )}
                </>
            )}
        </Stack>
    );
}

export default SchemaExplanation;