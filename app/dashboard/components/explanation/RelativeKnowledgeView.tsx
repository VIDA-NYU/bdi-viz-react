// components/SchemaExplanation/RelativeKnowledge.tsx
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

interface RelativeKnowledgeProps {
    relativeKnowledge: RelativeKnowledge[];
}


const RelativeKnowledgeView = ({ relativeKnowledge }: RelativeKnowledgeProps) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Relative Knowledge
                </Typography>
                {relativeKnowledge.length === 0 ? (
                    <Typography color="text.secondary">
                        No relative knowledge available
                    </Typography>
                ) : (
                    <List>
                        {relativeKnowledge.map((knowledge, index) => (
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
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={2}
                                >
                                    <Typography variant="body1">
                                        {knowledge.entry}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </Stack>
                                <Typography variant="body2">
                                    {knowledge.description}
                                </Typography>
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};


export default RelativeKnowledgeView;