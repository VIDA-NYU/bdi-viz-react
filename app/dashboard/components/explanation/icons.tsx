// components/SchemaExplanation/ExplanationItem.tsx
import { 
    TextFields as TextIcon,
    Tag as TagIcon, 
    Storage as StorageIcon,
} from '@mui/icons-material';



// function getIcon(type: Explanation['type']) {
//     switch (type) {
//         case 'name':
//             return <TextIcon fontSize="medium" />;
//         case 'token':
//             return <TagIcon fontSize="medium" />;
//         case 'value':
//             return <StorageIcon fontSize="medium" />;
//         case 'semantic':
//             return <PsychologyIcon fontSize="medium" />;
//     }
// }

// components/SchemaExplanation/icons.tsx
import React from 'react';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import CodeIcon from '@mui/icons-material/Code';
import DataArrayIcon from '@mui/icons-material/DataArray';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type ExplanationType = 'name' | 'token' | 'value' | 'semantic' | 'pattern' | 'history' | 'knowledge' | 'other';

/**
 * Returns an appropriate icon component for each explanation type
 * @param type The explanation type
 * @returns React icon component
 */
const getIcon = (type: Explanation['type']): React.ReactElement => {
  switch (type as ExplanationType) {
    case 'name':
      return <TextFormatIcon fontSize="small" />; // Text/label matching
    case 'token':
      return <CodeIcon fontSize="small" />; // Code/tokenized text matching
    case 'value':
      return <DataArrayIcon fontSize="small" />; // Data value matching
    case 'semantic':
      return <PsychologyIcon fontSize="small" />; // Semantic meaning
    case 'pattern':
      return <AutoFixHighIcon fontSize="small" />; // Pattern recognition
    case 'history':
      return <HistoryIcon fontSize="small" />; // Historical mappings
    case 'knowledge':
      return <SchoolIcon fontSize="small" />; // Domain knowledge
    case 'other':
    default:
      return <HelpOutlineIcon fontSize="small" />; // Default/unknown
  }
};

/**
 * Returns a description for each explanation type
 * @param type The explanation type
 * @returns Description string
 */
const getTypeDescription = (type: Explanation['type']): string => {
  switch (type as ExplanationType) {
    case 'name':
      return 'Based on column name similarity';
    case 'token':
      return 'Based on tokenized text patterns';
    case 'value':
      return 'Based on similar data values';
    case 'semantic':
      return 'Based on semantic meaning';
    case 'pattern':
      return 'Based on similar data patterns';
    case 'history':
      return 'Based on historical mappings';
    case 'knowledge':
      return 'Based on domain knowledge';
    case 'other':
    default:
      return 'Other type of explanation';
  }
};

/**
 * Returns a default title for explanation types
 * @param type The explanation type
 * @param isMatch Whether the explanation indicates a match
 * @returns A default title string
 */
export const getDefaultTitle = (type: Explanation['type'], isMatch: boolean): string => {
    const matchText = isMatch ? "Match" : "No Match";
    
    switch (type as ExplanationType) {
      case 'name':
        return `Column Name ${matchText}`;
      case 'token':
        return `Token-based ${matchText}`;
      case 'value':
        return `Value-based ${matchText}`;
      case 'semantic':
        return `Semantic ${matchText}`;
      case 'pattern':
        return `Pattern ${matchText}`;
      case 'history':
        return `Historical ${matchText}`;
      case 'knowledge':
        return `Knowledge-based ${matchText}`;
      case 'other':
      default:
        return `${type.charAt(0).toUpperCase() + type.slice(1)} ${matchText}`;
    }
  };

/**
 * Returns a color for each explanation type
 * @param type The explanation type
 * @returns Hex color code
 */
const getTypeColor = (type: Explanation['type']): string => {
    switch (type as ExplanationType) {
      case 'name':
        return '#3f51b5'; // Indigo
      case 'token':
        return '#9c27b0'; // Purple
      case 'value':
        return '#2196f3'; // Blue
      case 'semantic':
        return '#009688'; // Teal
      case 'pattern':
        return '#ff9800'; // Orange
      case 'history':
        return '#795548'; // Brown
      case 'knowledge':
        return '#4caf50'; // Green
      case 'other':
      default:
        return '#607d8b'; // Blue Grey
    }
  };


export { getIcon, getTypeDescription, getTypeColor };