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
  const [selectedActions, setSelectedActions] = React.useState<number[]>(
    []
  );

  const handleSelect = (a: AgentAction, i: number) => {
    console.log(a);
    if (selectedActions.includes(i)) {
      setSelectedActions(selectedActions.filter((x) => x !== i));
    } else {
      setSelectedActions([...selectedActions, i]);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    console.log(selectedActions);
    if (!data) return;
    const selectActionObjects = selectedActions.map((i) => data.actions[i]);
    onSelectedActions(selectActionObjects);
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
                    <ListItemButton onClick={() => handleSelect(action, index)}>
                      <Checkbox
                        edge="start"
                        checked={selectedActions.includes(index)}
                        tabIndex={-1}
                        onChange={() => handleSelect(action, index)}
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
