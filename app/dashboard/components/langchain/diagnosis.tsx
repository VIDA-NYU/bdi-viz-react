import * as React from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
    ListItemButton
} from '@mui/material';


interface AgentDiagnosisPopupProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: AgentDiagnosis | undefined;
}

export default function AgentDiagnosisPopup(props: AgentDiagnosisPopupProps) {
  

  const handleClickOpen = () => {
    props.setOpen(true);
  };

  const handleClose = () => {
    props.setOpen(false);
  };

  const handleDiagnosisClick = (d: DiagnoseObject) => {
    console.log(d);
  }

  return (
    <React.Fragment>
      <Dialog
        open={props.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        
      >
        <DialogTitle id="alert-dialog-title">
          {"What's the reason behind this operation?"}
        </DialogTitle>
        
        {props.data && (
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {props.data.response}
                </DialogContentText>
                <List>
                    {props.data.diagnosis.map((d, i) => (
                        <ListItem key={i}>
                            <ListItemButton onClick={() => handleDiagnosisClick(d)}>
                                <ListItemText primary={d.reason} secondary={d.confidence} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        )}
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}