// components/attendance/MarkDialog.tsx
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem } from "@mui/material";

const statuses = ["PRESENT","ABSENT","LATE","EXCUSED"];

export default function MarkDialog(props:{
  open:boolean; onClose:()=>void; onSave:(patch:{ status:string; remarks?:string })=>void;
  initial:{ status:string; remarks?:string };
}) {
  const [status, setStatus] = useState(props.initial.status);
  const [remarks, setRemarks] = useState(props.initial.remarks ?? "");

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Update Attendance</DialogTitle>
      <DialogContent sx={{ display:"grid", gap:2, mt:1 }}>
        <TextField select label="Status" value={status} onChange={e=>setStatus(e.target.value)}>
          {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
        <TextField label="Remarks" value={remarks} onChange={e=>setRemarks(e.target.value)} />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>Cancel</Button>
        <Button variant="contained" onClick={()=>props.onSave({ status, remarks })}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
