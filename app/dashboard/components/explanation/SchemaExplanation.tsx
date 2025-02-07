import { useState } from 'react';
import { 
    Box, 
    Card, 
    List, 
    Typography,
    Button,
    Stack,
    Chip,
    CircularProgress
} from '@mui/material';
import ExplanationItem, { getIcon } from './ExplanationItem';
import { Explanation, SchemaMatch } from './types';

interface SchemaExplanationProps {
    isMatch: boolean;
    currentExplanations: Explanation[];
    selectedExplanations: Explanation[];
    setSelectExplanations: (explanations: Explanation[]) => void;
    valueMatches: string[][];
    matches: SchemaMatch[];
    sourceColumn?: string;
    targetColumn?: string;
    isLoading: boolean;
}

const SchemaExplanation = ({
    isMatch,
    currentExplanations,
    selectedExplanations,
    setSelectExplanations,
    valueMatches,
    matches,
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

    return (
        <Stack spacing={3} sx={{ paddingLeft: 1, maxHeight: "700px", overflowY: 'scroll'}}>
            <Box>
                <Typography variant="h6" gutterBottom>
                    Current Selection
                </Typography>
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
                                <Typography variant="h6" gutterBottom>
                                    Match Explanations
                                </Typography>
                                <List>
                                    {currentExplanations.map(explanation => (
                                        <ExplanationItem
                                            key={explanation.id}
                                            explanation={explanation}
                                            selected={selectedExplanations.some(e => e.id === explanation.id)}
                                            onSelect={handleSelect}
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
                            <Typography variant="h6" gutterBottom>
                                Value Matches
                            </Typography>
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

                    {/* Accepted Matches History */}
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Accepted Matches
                        </Typography>
                        <List>
                            {matches.map((match, index) => (
                                <Card key={index} variant="outlined" sx={{ mb: 1, p: 2 }}>
                                    <Stack spacing={1}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Chip label={match.sourceColumn} size="small" />
                                            <Typography>→</Typography>
                                            <Chip label={match.targetColumn} size="small" />
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary">
                                            Based on:
                                        </Typography>
                                        {match.selectedExplanations.map(explanation => (
                                            <Stack 
                                                key={explanation.id} 
                                                direction="row" 
                                                spacing={1} 
                                                alignItems="center"
                                            >
                                                {getIcon(explanation.type)}
                                                <Typography variant="body2">
                                                    {explanation.content}
                                                </Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Card>
                            ))}
                        </List>
                    </Box>
                </>
            )}
        </Stack>
    );
}

export default SchemaExplanation;