import { PropsWithChildren, useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuthStore } from "../stores/useAuthStore";
import { useConfigStore } from "../stores/useConfigStore";
import { fetchSchoolConfig } from "../services/config";

export function ConfigRoot({ children }: PropsWithChildren) {
  const { schoolId } = useAuthStore();
  const setConfig = useConfigStore((s) => s.set);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!schoolId) {
      setReady(false);
      return;
    }

    (async () => {
      try {
        const cfg = await fetchSchoolConfig(schoolId);
        setConfig(cfg);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch school config:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load configuration"
        );
      } finally {
        setReady(true);
      }
    })();
  }, [schoolId, setConfig]);

  if (!schoolId) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">Loading configuration...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          Configuration Error
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
