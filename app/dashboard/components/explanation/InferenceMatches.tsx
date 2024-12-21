// components/SchemaExplanation/InferredMatches.tsx
import { 
    Box, 
    Card, 
    CardContent, 
    Typography, 
    List, 
    ListItem,
    Chip,
    Stack,
    IconButton, styled
} from '@mui/material';
import { 
    AddCircleOutline as AddIcon,
    Close as CloseIcon 
} from '@mui/icons-material';

interface InferredMatch {
    sourceColumn: string;
    targetColumn: string;
    confidence: number;
}

interface InferredMatchesProps {
    inferredMatches: InferredMatch[];
    onAcceptInferred: (match: InferredMatch) => void;
    onRejectInferred: (match: InferredMatch) => void;
}



const InferredMatches = ({ 
    inferredMatches,
    onAcceptInferred,
    onRejectInferred
}: InferredMatchesProps) => {
    return (
        <Card>
            {/* display horizontally */}
            <CardContent
                
            >
                <Typography variant="h6" gutterBottom>
                    Suggested Matches
                </Typography>
                {inferredMatches.length === 0 ? (
                    <Typography color="text.secondary">
                        No suggested matches based on current selection
                    </Typography>
                ) : (
                    <List>
                        {inferredMatches.map((match, index) => (
                            <ListItem
                                key={index}
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    mb: 1,
                                    bgcolor: 'background.default'
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    width="100%"
                                >
                                    <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                                        <Chip 
                                            label={match.sourceColumn} 
                                            size="small" 
                                            color="primary"
                                        />
                                        <Typography>→</Typography>
                                        <Chip 
                                            label={match.targetColumn} 
                                            size="small"
                                        />
                                    </Stack>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ minWidth: 80 }}
                                    >
                                        {(match.confidence * 100).toFixed(0)}%
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            size="small"
                                            color="success"
                                            onClick={() => onAcceptInferred(match)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => onRejectInferred(match)}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </Stack>
                                </Stack>
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
}

export default InferredMatches;
export type { InferredMatch };