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
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                <ListItemIcon>
                    {getIcon(explanation.type)}
                </ListItemIcon>
                <ListItemText
                    primary={explanation.content}
                    secondary={`Confidence: ${(explanation.confidence * 100).toFixed(0)}%`}
                />
                <Checkbox 
                    edge="end"
                    checked={selected}
                    onChange={() => onSelect(explanation)}
                />
            </ListItemButton>
        </ListItem>
    );
}

export default ExplanationItem;
export { getIcon };