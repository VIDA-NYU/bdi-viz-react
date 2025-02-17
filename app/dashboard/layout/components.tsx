// components/styled/LayoutComponents.tsx
import { styled } from '@mui/material/styles';
import { Box, Paper } from '@mui/material';

export const Sidebar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const ContentArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const VisualizationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

export const VisualizationContainer = styled(Box)({
  flex: 1,
  minHeight: 0, // Important for proper scrolling
  position: 'relative',
});

export const TopRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(2),
  minHeight: '400px',
}));

export const MiddleRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: theme.spacing(2),
  minHeight: '300px',
}));

export const BottomRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: theme.spacing(2),
  minHeight: '400px',
}));

export const Footer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(3),
}));


// components/styled/LayoutComponents.tsx

export const RootContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: "#f5f5f5",
  padding: theme.spacing(0.5),
}));

export const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

export const MainContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '400px 2fr 1.2fr', // Three columns: controls, main viz, secondary viz
  gap: theme.spacing(2),
  flex: 1,
  height: 'calc(100vh - 140px)', // Adjust based on header/footer height
  overflow: 'hidden',
  paddingTop: theme.spacing(2),
}));

// Left Column - Control Panel
export const ControlColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  justifyContent: 'flex-start',
  alignContent: 'flex-start',
}));

export const LeftColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  justifyContent: 'flex-start',
  alignContent: 'flex-start',
  flexWrap: "wrap",
  flex: "1 1 auto",
  alignItems: "center",
  minWidth: "min-content",
  paddingRight: theme.spacing(1),
}));

// Middle Column - Main Visualizations
export const MainColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  overflowY: 'auto',
  overflow: 'hidden',
  backgroundColor: 'white',
  borderRadius: theme.shape.borderRadius,
}));

// Right Column - Auxiliary Visualizations
export const AuxColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflowY: 'auto',
}));



export const ScrollableCard = styled(VisualizationCard)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
}));

// Specific height containers for different visualizations
export const LargeVizContainer = styled(VisualizationCard)(({ theme }) => ({
  height: '500px',
}));

export const MediumVizContainer = styled(VisualizationCard)(({ theme }) => ({
  height: '300px',
}));

export const SmallVizContainer = styled(VisualizationCard)(({ theme }) => ({
  height: '200px',
}));