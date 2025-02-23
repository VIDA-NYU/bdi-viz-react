// components/SchemaExplanation/RelevantKnowledge.tsx
import { 
    Box,
    Typography, 
    List, 
    ListItem,
    Chip,
    Stack,
    CircularProgress
} from '@mui/material';
import { SectionHeader } from '../../layout/components';


interface RelevantKnowledgeProps {
    relevantKnowledge: RelevantKnowledge[];
    isLoading: boolean;
}


const RelevantKnowledgeView = ({
    relevantKnowledge,
    isLoading
}: RelevantKnowledgeProps) => {
    return (
        <Box>
                <SectionHeader>
                    Relevant Knowledge
                </SectionHeader>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {relevantKnowledge.map((rk, i) => (
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
        </Box>
    );
};


export default RelevantKnowledgeView;