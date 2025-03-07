// components/SchemaExplanation/ExplanationItem.tsx
import { 
    Checkbox, 
    ListItem, 
    ListItemButton,
    ListItemIcon, 
    ListItemText 
} from '@mui/material';
import { getIcon } from './icons';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import IconButton from '@mui/material/IconButton';

interface ExplanationItemProps {
    explanation: Explanation;
    selected: boolean;
    thumbUp: boolean;
    thumbDown: boolean;
    onSelect: (explanation: Explanation) => void;
    onThumbUpClick: (id: string) => void;
    onThumbDownClick: (id: string) => void;
}

function ExplanationItem({
    explanation,
    selected,
    thumbUp,
    thumbDown,
    onSelect,
    onThumbUpClick,
    onThumbDownClick
}: ExplanationItemProps) {
    return (
        <ListItem 
            disablePadding
            sx={{
                mb: 1,
                borderRadius: 2,
                border: 3,
                borderColor: explanation.isMatch ? 'success.dark' : 'error.dark',
                position: 'relative',
                overflow: 'hidden',
                padding: 1,
                // boxShadow: 3,
                backgroundColor: 'background.paper',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                    // boxShadow: 6,
                }
            }}
        >
            <ListItemText
                primaryTypographyProps={{
                    sx: {
                        fontSize: '0.7rem',
                        fontWeight: 400,
                        color: explanation.isMatch ? 'text.primary' : 'error.main',
                    }
                }}
                secondaryTypographyProps={{
                    sx: {
                        fontSize: '0.65rem',
                        fontWeight: 400,
                        color: 'text.secondary'
                    }
                }}
                primary={explanation.reason}
                secondary={
                    <>
                        {explanation.reference &&  (
                            <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'gray' }}>
                                {explanation.reference}
                                <br />
                            </span>
                        )}
                        <span style={{ fontSize: '0.65rem', fontWeight: 400, color: 'gray' }}>
                            {`Confidence: ${explanation.confidence}`}
                        </span>
                    </>
                }
                sx={{ zIndex: 2, margin: 0 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingRight: 10 }}>
                <IconButton 
                    edge="end" 
                    sx={{ zIndex: 2, borderRadius: 1, px: 0.5, py: 0.5 }}
                    onClick={() => onThumbUpClick(explanation.id)}
                    color={thumbUp ? 'primary' : 'default'}
                >
                    <ThumbUpIcon />
                </IconButton>
                
                <IconButton 
                    edge="end" 
                    sx={{ zIndex: 2, borderRadius: 1, px: 0.5, py: 0.5 }}
                    onClick={() => onThumbDownClick(explanation.id)}
                    color={thumbDown ? 'error' : 'default'}
                >
                    <ThumbDownIcon />
                </IconButton>
            </div>
        </ListItem>
    );
}

export default ExplanationItem;
export { getIcon };
