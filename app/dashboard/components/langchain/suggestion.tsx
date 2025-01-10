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

interface AgentSuggestionsPopupProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: AgentSuggestions | undefined;
  onSelectedActions: (actions: AgentAction[]) => void;
}

export default function AgentSuggestionsPopup({
  open,
  setOpen,
  data,
  onSelectedActions,
}: AgentSuggestionsPopupProps) {
  const [selectedActions, setSelectedActions] = React.useState<AgentAction[]>(
    []
  );

  const handleSelect = (a: AgentAction) => {
    console.log(a);
    setSelectedActions((prev) =>
      prev.includes(a) ? prev.filter((item) => item !== a) : [...prev, a]
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    console.log(selectedActions);
    onSelectedActions(selectedActions);
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
          {"We suggest the following actions. Do you want to apply them?"}
        </DialogTitle>

        {data && (
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <List>
                {data.actions.map((action, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton onClick={() => handleSelect(action)}>
                      <Checkbox
                        edge="start"
                        checked={selectedActions.includes(action)}
                        tabIndex={-1}
                        onChange={() => handleSelect(action)}
                      />
                      <ListItemText
                        primary={
                          <React.Fragment>
                            <span style={{ fontWeight: 'bold' }}>{action.action}</span>
                            <br />
                            <span style={{ fontSize: '0.875em', color: 'gray' }}>{action.reason}</span>
                          </React.Fragment>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </DialogContentText>
          </DialogContent>
        )}

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} autoFocus>
            Apply Actions
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
