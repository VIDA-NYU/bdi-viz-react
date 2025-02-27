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
    gdcAttribute?: GDCAttribute;
    isLoading: boolean;
}

const RelevantKnowledgeView = ({
    relevantKnowledge,
    gdcAttribute,
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
                                <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                                    {rk.description}
                                </Typography>
                            </Stack>
                        </ListItem>
                    ))}
                </List>
            )}

            {gdcAttribute && (
                <Box>
                    <SectionHeader>
                        GDC Attribute
                    </SectionHeader>
                    <Typography variant="body1" sx={{ fontSize: '0.7rem' }}>
                        <strong>Name:</strong> {gdcAttribute.name}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '0.7rem' }}>
                        <strong>Category:</strong> {gdcAttribute.category}
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '0.7rem' }}>
                        <strong>Node:</strong> {gdcAttribute.node}
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ fontSize: '0.7rem' }}>
                        <strong>Type:</strong> {gdcAttribute.type}
                    </Typography>
                    {gdcAttribute.minimum !== null && gdcAttribute.minimum !== undefined && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            <strong>Minimum:</strong> {gdcAttribute.minimum}
                        </Typography>
                    )}
                    {gdcAttribute.maximum !== null && gdcAttribute.maximum !== undefined && (
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            <strong>Maximum:</strong> {gdcAttribute.maximum}
                        </Typography>
                    )}
                    {gdcAttribute.description && gdcAttribute.description.map((desc, i) => (
                        <Typography key={i} variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: '0.7rem' }}>
                            <strong>Description:</strong> {desc.description}
                        </Typography>
                    ))}
                    {gdcAttribute.enum && (
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                            <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                <strong>Enum:</strong>
                            </Typography>
                            {gdcAttribute.enum.map((enumValue, index) => (
                                <Chip key={index} label={enumValue} color="info" size='small' sx={{ fontSize: "0.65rem" }} />
                            ))}
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default RelevantKnowledgeView;
