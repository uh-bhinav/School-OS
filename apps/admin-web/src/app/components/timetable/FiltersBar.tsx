import { Box, TextField, MenuItem, Button } from "@mui/material";

export default function FiltersBar({
  value,
  onChange,
  onApply,
  classes,
  sections,
}: {
  value: { academic_year_id: number; class_id: number; section: string; week_start: string };
  onChange: (v: Partial<typeof value>) => void;
  onApply: () => void;
  classes: number[];
  sections: string[];
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
      <TextField label="Academic Year" value={value.academic_year_id}
        onChange={(e) => onChange({ academic_year_id: Number(e.target.value) })}
        sx={{ minWidth: 160 }} />
      <TextField select label="Class" value={value.class_id}
        onChange={(e) => onChange({ class_id: Number(e.target.value) })}
        sx={{ minWidth: 160 }}>
        {classes.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
      </TextField>
      <TextField select label="Section" value={value.section}
        onChange={(e) => onChange({ section: e.target.value })}
        sx={{ minWidth: 160 }}>
        {sections.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
      </TextField>
      <TextField type="date" label="Week (any day)" value={value.week_start}
        onChange={(e) => onChange({ week_start: e.target.value })} />
      <Button variant="contained" onClick={onApply}>Apply</Button>
    </Box>
  );
}
