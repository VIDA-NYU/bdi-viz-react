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
            sx={{ mb: 1 }}
        >
            <ListItemButton
                dense
                onClick={() => onSelect(explanation)}
                sx={{ 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${explanation.confidence * 100}%`,
                        height: '100%',
                        bgcolor: explanation.isMatch ? 'lightgreen' : 'lightcoral',
                        zIndex: 1
                    },
                    '&:hover:before': {
                        bgcolor: explanation.isMatch ? 'green' : 'coral'
                    }
                }}
            >
                <ListItemIcon sx={{ zIndex: 2 }}>
                    {getIcon(explanation.type)}
                </ListItemIcon>
                <ListItemText
                    primary={explanation.reason}
                    secondary={explanation.reference}
                    sx={{ zIndex: 2 }}
                />
                <Checkbox 
                    edge="end"
                    checked={selected}
                    onChange={() => onSelect(explanation)}
                    sx={{ zIndex: 2 }}
                    disabled
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
            </ListItemButton>
        </ListItem>
    );
}

export default ExplanationItem;
export { getIcon };
