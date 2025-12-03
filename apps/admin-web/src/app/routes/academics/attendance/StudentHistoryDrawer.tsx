// routes/academics/attendance/StudentHistoryDrawer.tsx
import { Drawer, List, ListItem, ListItemText, Typography } from "@mui/material";
export default function StudentHistoryDrawer({ open, onClose, history }:{
  open:boolean; onClose:()=>void; history?: { records:Array<{ date:string; status:string; remarks?:string | null }> };
}) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div style={{ width:360, padding:16 }}>
        <Typography variant="h6" gutterBottom>Attendance History</Typography>
        <List>
          {history?.records.map((r, i)=>(
            <ListItem key={i}>
              <ListItemText primary={`${r.date} — ${r.status}`} secondary={r.remarks ?? undefined}/>
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
}
