import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { useSwapEntries } from "../../services/timetable.hooks";

export default function SwapDialog({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const [aId, setAId] = useState<number>(0);
  const [bId, setBId] = useState<number>(0);
  const swapMut = useSwapEntries();

  async function handleSwap() {
    await swapMut.mutateAsync({ a_id: aId, b_id: bId });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Swap Two Periods</DialogTitle>
      <DialogContent sx={{ display:"grid", gap:2, mt:1 }}>
        <TextField type="number" label="Entry A ID" value={aId} onChange={(e)=>setAId(Number(e.target.value))}/>
        <TextField type="number" label="Entry B ID" value={bId} onChange={(e)=>setBId(Number(e.target.value))}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSwap} disabled={!aId || !bId}>Swap</Button>
      </DialogActions>
    </Dialog>
  );
}
