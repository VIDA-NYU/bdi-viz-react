// components/SchemaExplanation/index.tsx
import { useState } from 'react';
import { 
    Box, 
    Card, 
    CardContent, 
    List, 
    Typography,
    Button,
    Stack,
    Chip
} from '@mui/material';
import ExplanationItem, { getIcon } from './ExplanationItem';
import { Explanation, SchemaMatch } from './types';

interface SchemaExplanationProps {
    currentExplanations: Explanation[];
    matches: SchemaMatch[];
    onAcceptMatch: (explanations: Explanation[]) => void;
    sourceColumn?: string;
    targetColumn?: string;
}

const SchemaExplanation = ({
    currentExplanations,
    matches,
    onAcceptMatch,
    sourceColumn,
    targetColumn
}: SchemaExplanationProps) => {
    const [selectedExplanations, setSelectedExplanations] = useState<Explanation[]>([]);

    const handleSelect = (explanation: Explanation) => {
        setSelectedExplanations(prev => 
            prev.find(e => e.id === explanation.id)
                ? prev.filter(e => e.id !== explanation.id)
                : [...prev, explanation]
        );
    };

    return (
        <Card
            sx={{
                marginRight: 4,
                flexBasis: "700px",
                flexGrow: 1,
            }}
        >
        <CardContent>
        <Stack spacing={3}>
            {/* Match Selection Display */}
            {sourceColumn && targetColumn && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Current Selection
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={sourceColumn} color="primary" />
                        <Typography>→</Typography>
                        <Chip label={targetColumn} />
                    </Stack>
                </Box>
            )}

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
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={selectedExplanations.length === 0}
                            onClick={() => onAcceptMatch(selectedExplanations)}
                        >
                            Accept Match with Selected Explanations
                        </Button>
                    </Box>
                </>
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
        </Stack>
    </CardContent>
        </Card>
    );
}

export default SchemaExplanation;