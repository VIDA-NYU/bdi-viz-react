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
        if (thumbUpExplanations.some(e => e === id)) {
            setThumbUpExplanations(thumbUpExplanations.filter(e => e !== id));
        } else {
            setThumbUpExplanations([...thumbUpExplanations, id]);
        }
    };

    const handleThumbDown = (id: string) => {
        if (thumbDownExplanations.some(e => e === id)) {
            setThumbDownExplanations(thumbDownExplanations.filter(e => e !== id));
        } else {
            setThumbDownExplanations([...thumbDownExplanations, id]);
        }
    };

    return (
        <Stack spacing={3} sx={{ paddingLeft: 1, maxHeight: "700px", overflowY: 'scroll'}}>
            <Box>
                <SectionHeader>
                    Current Selection
                </SectionHeader>
            </Box>
            {isLoading ? (
                <Box  display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {/* Match Selection Display */}
                    {sourceColumn && targetColumn && (
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip label={sourceColumn} color="primary" />
                                <Typography>→</Typography>
                                <Chip label={targetColumn} />
                            </Stack>
                        </Box>
                    )}

                    {/* Is Match */}
                    {sourceColumn && targetColumn && isMatch !== undefined &&
                        <Box>
                            <Chip 
                                label={isMatch ? "Our agent thinks this is a match." : "Our agent thinks this is not a match."} 
                                sx={{ backgroundColor: isMatch ? 'green' : 'red', color: 'white' }} 
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
                                <List>
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
                                {/* <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={selectedExplanations.length === 0}
                                    onClick={() => onSelectExplanations(selectedExplanations)}
                                >
                                    Accept Match with Selected Explanations
                                </Button> */}
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
                                    <Card key={index} variant="outlined" sx={{ mb: 1, p: 2 }}>
                                        <Stack direction="row" spacing={1}>
                                            {values.map((value, index) => (
                                                <Chip key={index} label={value} size="small" />
                                            ))}
                                        </Stack>
                                    </Card>
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