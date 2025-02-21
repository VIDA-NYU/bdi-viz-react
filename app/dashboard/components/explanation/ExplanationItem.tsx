// components/SchemaExplanation/ExplanationItem.tsx
import { 
    Checkbox, 
    ListItem, 
    ListItemButton,
    ListItemIcon, 
    ListItemText 
} from '@mui/material';
import { Explanation } from './types';
import { getIcon } from './icons';

interface ExplanationItemProps {
    explanation: Explanation;
    selected: boolean;
    onSelect: (explanation: Explanation) => void;
}

function ExplanationItem({ explanation, selected, onSelect }: ExplanationItemProps) {
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
                />
            </ListItemButton>
        </ListItem>
    );
}

export default ExplanationItem;
export { getIcon };
