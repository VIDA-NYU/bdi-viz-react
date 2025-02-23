// components/SchemaExplanation/ExplanationItem.tsx
import { 
    TextFields as TextIcon,
    Tag as TagIcon, 
    Storage as StorageIcon,
    Psychology as PsychologyIcon
} from '@mui/icons-material';



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