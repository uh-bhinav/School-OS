import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import { useAuthStore } from "../stores/useAuthStore";

export default function RootRedirect() {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  useEffect(() => {
    if (!role) return;

    if (role === "admin") {
      navigate("/admin", { replace: true });
    } else if (role === "front_office") {
      navigate("/frontoffice", { replace: true });
    } else {
      navigate("/auth/login", { replace: true });
    }
  }, [role, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
