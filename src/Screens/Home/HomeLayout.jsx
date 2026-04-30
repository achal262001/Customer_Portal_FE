import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import { logout } from "../../Supportive Files/api";
import { useAppTheme } from "../../ThemeContext";
import { ToastContainer } from "./shared";
import DashboardPanel from "./DashboardPanel";
import AllTicketsPanel from "./AllTicketsPanel";
import MyTicketsPanel from "./MyTicketsPanel";
import { RaiseIssuePanel } from "./RaiseIssuePanel";
import AnalyticsPanel from "./AnalyticsPanel";
import ProjectsPanel from "./ProjectsPanel";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "mytickets", label: "My tickets" },
  { key: "raise", label: "Raise a Ticket" },
  { key: "analytics", label: "Analytics" },
  { key: "projects", label: "Projects" },
];

const PANELS = {
  dashboard: <DashboardPanel />,
  alltickets: <AllTicketsPanel />,
  mytickets: <MyTicketsPanel />,
  raise: <RaiseIssuePanel />,
  analytics: <AnalyticsPanel />,
  projects: <ProjectsPanel />,
};

const HomeLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const { mode, toggleTheme } = useAppTheme();

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: muiTheme.palette.background.default, fontFamily: "inherit" }}>
      <ToastContainer />

      {/* ── Top bar ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "20px", py: "14px", borderBottom: `0.5px solid ${muiTheme.palette.divider}`, backgroundColor: muiTheme.palette.background.paper, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "6px", backgroundColor: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16, color: "#185FA5" }} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: muiTheme.palette.text.primary }}>Relay</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box component="button" onClick={toggleTheme} title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "6px", border: `0.5px solid ${muiTheme.palette.divider}`, backgroundColor: muiTheme.palette.background.paper, color: muiTheme.palette.text.secondary, cursor: "pointer", "&:hover": { backgroundColor: muiTheme.palette.action.hover }, transition: "all .15s" }}>
            {mode === "light" ? (
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </Box>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#E6F1FB", color: "#185FA5", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", border: `0.5px solid ${muiTheme.palette.divider}` }}>C2</Box>
          <Typography sx={{ fontSize: 13, color: muiTheme.palette.text.secondary }}>Client 1</Typography>
          <Box component="button" onClick={handleLogout}
            sx={{ ml: "4px", display: "flex", alignItems: "center", gap: "5px", px: "10px", py: "5px", borderRadius: "6px", border: `0.5px solid ${muiTheme.palette.divider}`, backgroundColor: muiTheme.palette.background.paper, color: muiTheme.palette.text.secondary, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", "&:hover": { backgroundColor: "#FCEBEB", color: "#A32D2D", borderColor: "#FECACA" }, transition: "all .15s" }}>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </Box>
        </Box>
      </Box>

      {/* ── Tab bar ── */}
      <Box sx={{ display: "flex", borderBottom: `0.5px solid ${muiTheme.palette.divider}`, backgroundColor: muiTheme.palette.background.paper, px: "20px", overflowX: "auto", flexShrink: 0, "&::-webkit-scrollbar": { height: 2 } }}>
        {TABS.map(tab => (
          <Box key={tab.key} onClick={() => setActiveTab(tab.key)}
            sx={{ px: "14px", py: "10px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", color: activeTab === tab.key ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary, borderBottom: activeTab === tab.key ? `2px solid ${muiTheme.palette.primary.main}` : "2px solid transparent", fontWeight: activeTab === tab.key ? 500 : 400, transition: "color .15s", "&:hover": { color: activeTab === tab.key ? muiTheme.palette.primary.main : muiTheme.palette.text.primary } }}>
            {tab.label}
          </Box>
        ))}
      </Box>

      {/* ── Content ── */}
      <Box sx={{ flex: 1, overflowY: "auto", p: "20px" }}>
        {PANELS[activeTab]}
      </Box>
    </Box>
  );
};

export default HomeLayout;
