import { useState, useEffect } from "react";
import { Box, Chip, Button, Alert, Fade } from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { usePublishWeek } from "../../services/timetable.hooks";

interface PublishBarProps {
  filters: {
    academic_year_id: number;
    class_id: number;
    section: string;
    week_start: string;
  };
  isPublished: boolean;
}

/**
 * Component for publishing/unpublishing a timetable week
 */
export default function PublishBar({ filters, isPublished }: PublishBarProps) {
  const [state, setState] = useState(isPublished);
  const [showSuccess, setShowSuccess] = useState(false);
  const pubMut = usePublishWeek();

  // Sync state with prop changes
  useEffect(() => {
    setState(isPublished);
  }, [isPublished]);

  async function toggle() {
    try {
      const res = await pubMut.mutateAsync({ ...filters, publish: !state });
      setState(res?.is_published ?? !state);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Publish failed:", error);
    }
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <Chip
          label={state ? "Published" : "Draft"}
          color={state ? "success" : "default"}
          icon={state ? <CheckCircleIcon /> : undefined}
          sx={{
            fontWeight: 600,
            px: 1,
          }}
        />
        <Button
          variant={state ? "outlined" : "contained"}
          onClick={toggle}
          disabled={pubMut.isPending}
          startIcon={state ? <UnpublishedIcon /> : <PublishIcon />}
          color={state ? "error" : "success"}
        >
          {pubMut.isPending
            ? state
              ? "Unpublishing..."
              : "Publishing..."
            : state
              ? "Unpublish"
              : "Publish Week"}
        </Button>
      </Box>

      <Fade in={showSuccess}>
        <Alert severity="success" sx={{ mt: 1 }}>
          Timetable {state ? "published" : "unpublished"} successfully!
        </Alert>
      </Fade>

      {!state && (
        <Alert severity="info" sx={{ mt: 1 }}>
          This timetable is in draft mode. Publish it to make it visible to teachers and students.
        </Alert>
      )}
    </Box>
  );
}
