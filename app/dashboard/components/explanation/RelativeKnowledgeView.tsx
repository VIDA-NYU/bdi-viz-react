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
    CircularProgress
} from '@mui/material';


interface RelativeKnowledgeProps {
    relativeKnowledge: RelativeKnowledge[];
    isLoading: boolean;
}


const RelativeKnowledgeView = ({
    relativeKnowledge,
    isLoading
}: RelativeKnowledgeProps) => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Relative Knowledge
                </Typography>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {relativeKnowledge.map((rk, i) => (
                            <ListItem key={i}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Chip label={rk.entry} color="primary" />
                                    <Typography variant="body2" color="textSecondary">
                                        {rk.description}
                                    </Typography>
                                </Stack>
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};


export default RelativeKnowledgeView;