import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { Card, Tag } from "./shared";

const PROJECTS = [
  {
    name: "DPAI – Phase 2 Rollout",
    meta: "Client 2 · SPOC: Nikita K. · Due: 28 Feb 2026",
    statusLabel: "In progress",
    statusBg: "#FAEEDA", statusColor: "#854F0B",
    pct: 68,
    info: "68% complete · 3 milestones remaining",
    milestones: [
      { label: "Requirements sign-off", state: "done", note: "Completed" },
      { label: "UAT environment setup", state: "done", note: "Completed" },
      { label: "Integration testing", state: "active", note: "In progress" },
      { label: "User acceptance sign-off", state: "pending", note: "Pending" },
      { label: "Prod go-live", state: "pending", note: "Pending" },
    ],
    summary: "✦ Auto-summary: Integration testing delayed due to 3 open environment tickets. Resolution target: 20 Apr 2026.",
  },
  {
    name: "TMS – Configuration Upgrade",
    meta: "Client 2 · SPOC: Nikita K. · Due: 15 May 2026",
    statusLabel: "Planned",
    statusBg: "#E6F1FB", statusColor: "#185FA5",
    pct: 22,
    info: "22% complete · Kickoff done",
    milestones: [
      { label: "Kickoff & scoping", state: "done", note: "Completed" },
      { label: "Design & architecture", state: "active", note: "In progress" },
      { label: "Build & configure", state: "pending", note: "Pending" },
    ],
    summary: null,
  },
];

const MS_DOT = { done: "#639922", active: "#EF9F27", pending: "#D1D5DB" };

const ProjectsPanel = () => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {PROJECTS.map(proj => (
        <Card key={proj.name}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.2 }}>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: theme.palette.text.primary }}>{proj.name}</Typography>
              <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mt: 0.3 }}>{proj.meta}</Typography>
            </Box>
            <Tag label={proj.statusLabel} bg={proj.statusBg} color={proj.statusColor} />
          </Box>
          <Box sx={{ height: 5, backgroundColor: theme.palette.divider, borderRadius: 4, overflow: "hidden", mb: 1 }}>
            <Box sx={{ height: "100%", width: `${proj.pct}%`, backgroundColor: "#378ADD", borderRadius: 4 }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, mb: 1.2 }}>{proj.info}</Typography>
          {proj.milestones.map(ms => (
            <Box key={ms.label} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: MS_DOT[ms.state], flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12, flex: 1, color: theme.palette.text.primary }}>{ms.label}</Typography>
              <Typography sx={{ fontSize: 11, color: ms.state === "active" ? "#854F0B" : theme.palette.text.disabled }}>{ms.note}</Typography>
            </Box>
          ))}
          {proj.summary && (
            <Box sx={{ mt: 1.2, p: "8px", backgroundColor: theme.palette.action.hover, borderRadius: "6px", fontSize: 12, color: theme.palette.text.secondary }}>
              {proj.summary}
            </Box>
          )}
        </Card>
      ))}
    </Box>
  );
};

export default ProjectsPanel;
