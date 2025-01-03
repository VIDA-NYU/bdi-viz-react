import * as React from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from "@mui/material";

interface AgentDiagnosisPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: AgentDiagnosis | undefined;
  suggest: (diagnosis: DiagnoseObject[]) => void;
}

export default function AgentDiagnosisPopup({
  open,
  setOpen,
  data,
  suggest,
}: AgentDiagnosisPopupProps) {
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<DiagnoseObject[]>([]);

  const handleSelect = (d: DiagnoseObject) => {
    setSelectedDiagnosis((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    console.log(selectedDiagnosis);
    suggest(selectedDiagnosis);
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"What's the reason behind this operation?"}
        </DialogTitle>

        {data && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {data.response}
            </DialogContentText>
            <List>
              {data.diagnosis.map((d, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemButton onClick={() => handleSelect(d)}>
                    <Checkbox
                      edge="start"
                      checked={selectedDiagnosis.includes(d)}
                      tabIndex={-1}
                      disableRipple
                      onChange={() => handleSelect(d)}
                    />
                    <ListItemText primary={d.reason} />
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
          <Button onClick={() => handleConfirm()} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
