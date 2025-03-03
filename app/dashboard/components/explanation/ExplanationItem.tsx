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
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                padding: 1,
                boxShadow: 3,
                backgroundColor: 'background.paper',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                }
            }}
        >
            <ListItemText
            primaryTypographyProps={{
                sx: {
                fontSize: '0.7rem',
                fontWeight: 300,
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
            secondary={explanation.reference}
            sx={{ zIndex: 2 }}
            />
            <IconButton 
            edge="end" 
            sx={{ zIndex: 2 }}
            onClick={() => onThumbUpClick(explanation.id)}
            color={thumbUp ? 'primary' : 'default'}
            >
            <ThumbUpIcon />
            </IconButton>
            <IconButton 
            edge="end" 
            sx={{ zIndex: 2 }}
            onClick={() => onThumbDownClick(explanation.id)}
            color={thumbDown ? 'error' : 'default'}
            >
            <ThumbDownIcon />
            </IconButton>
        </ListItem>
    );
}

export default ExplanationItem;
export { getIcon };
