// components/SchemaExplanation/ExplanationItem.tsx
import { 
    Checkbox, 
    ListItem, 
    ListItemButton,
    ListItemIcon, 
    ListItemText 
} from '@mui/material';
import { 
    TextFields as TextIcon,
    Tag as TagIcon, 
    Storage as StorageIcon,
    Psychology as PsychologyIcon
} from '@mui/icons-material';
import { Explanation } from './types';



function getIcon(type: Explanation['type']) {
    switch (type) {
        case 'name':
            return <TextIcon fontSize="medium" />;
        case 'token':
            return <TagIcon fontSize="medium" />;
        case 'value':
            return <StorageIcon fontSize="medium" />;
        case 'semantic':
            return <PsychologyIcon fontSize="medium" />;
    }
}

export { getIcon };