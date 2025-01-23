// components/visualizations/VisualizationComponents.tsx
import React from 'react';
import { Typography } from '@mui/material';
import { VisualizationCard, VisualizationContainer } from './components';

interface VisualizationProps {
  title: string;
  children?: React.ReactNode;
}

export const VisualizationPanel: React.FC<VisualizationProps> = ({ title, children }) => {
  return (
    <VisualizationCard elevation={2}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <VisualizationContainer>
        {children || <div className="placeholder" />}
      </VisualizationContainer>
    </VisualizationCard>
  );
};

// Control Panel Component
export const ControlPanel: React.FC = () => {
  return (
    <VisualizationCard elevation={2}>
      <Typography variant="h6" gutterBottom>
        Controls
      </Typography>
      {/* Your existing control panel content */}
    </VisualizationCard>
  );
};

// Filter Panel Component
export const FilterPanel: React.FC = () => {
  return (
    <VisualizationCard elevation={2}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>
      {/* Your existing filter content */}
    </VisualizationCard>
  );
};