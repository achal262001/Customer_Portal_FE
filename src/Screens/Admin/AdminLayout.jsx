import { Typography } from "@mui/material";
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RaiseIssuePanel } from "../Home/HomeLayout";

const NewTicketCtx = createContext(() => {});
import {
  getAllTickets, getDashboardStats, getRecentActivities,
  getTicketsByClient, getAllClients, getAllUsers,
  getAllProjects, getTicketsByModule, getTicketsByCategory, logout,
  getAllModules, getAllSeverities, getAllTicketStatuses,
  getTicketsByClientDashboard, createEscalation, updateTicket,
  getUserById,
  getEscalationUnresolved,
} from "../../Supportive Files/api";

// ── Color tokens matching admin_ticketing_portal.html ──────────────────────
const C = {
  bg: "#fff",
  bgSecondary: "#f5f5f5",
  bgTertiary: "#f0f0f0",
  border: "#e8e8e8",
  borderSecondary: "#d0d0d0",
  text: "#111",
  textSecondary: "#555",
  textTertiary: "#888",
  blue: "#185FA5",
  blueBg: "#E6F1FB",
  blueDark: "#0C447C",
  danger: "#A32D2D",
  dangerBg: "#FCEBEB",
  warn: "#854F0B",
  warnBg: "#FAEEDA",
  success: "#3B6D11",
  successBg: "#EAF3DE",
  red: "#E24B4A",
  orange: "#EF9F27",
  green: "#639922",
};

// ── Badge helper ───────────────────────────────────────────────────────────
const Badge = ({ children, style }) => (
  <span
    style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 500,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

const SevBadge = ({ sev }) => {
  const map = {
    S1: { bg: C.dangerBg, color: C.danger },
    S2: { bg: C.warnBg, color: C.warn },
    S3: { bg: C.successBg, color: C.success },
  };
  const s = map[sev] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{sev}</Badge>;
};

const StatBadge = ({ status }) => {
  const map = {
    Open: { bg: C.blueBg, color: C.blue },
    "In Progress": { bg: C.warnBg, color: C.warn },
    Escalated: { bg: C.dangerBg, color: C.danger },
    Closed: { bg: C.successBg, color: C.success },
  };
  const s = map[status] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{status}</Badge>;
};

const ClientBadge = ({ client }) => {
  const map = {
    "Client 1": { bg: "#FBEAF0", color: "#72243E" },
    "Client 2": { bg: C.blueBg, color: C.blueDark },
    "Client 3": { bg: C.successBg, color: "#27500A" },
  };
  const s = map[client] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{client}</Badge>;
};

const ModBadge = ({ mod }) => {
  const map = {
    DPAI: { bg: C.blueBg, color: C.blueDark },
    TMS: { bg: "#E1F5EE", color: "#085041" },
    DS: { bg: "#EEEDFE", color: "#3C3489" },
  };
  const s = map[mod] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{mod}</Badge>;
};

// ── Btn helper ─────────────────────────────────────────────────────────────
const Btn = ({ children, variant = "ghost", sm, onClick, style }) => {
  const base = {
    padding: sm ? "5px 10px" : "7px 14px",
    borderRadius: 6,
    fontSize: sm ? 11 : 12,
    cursor: "pointer",
    fontWeight: 500,
    fontFamily: "inherit",
    border: "none",
  };
  const variants = {
    primary: { background: C.blue, color: "#fff", border: "none" },
    ghost: {
      background: "transparent",
      border: `0.5px solid ${C.borderSecondary}`,
      color: C.text,
    },
    danger: { background: C.dangerBg, color: C.danger, border: "none" },
    warn: { background: C.warnBg, color: C.warn, border: "none" },
    success: { background: C.successBg, color: C.success, border: "none" },
  };
  return (
    <button
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

// ── Card ───────────────────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div
    style={{
      background: C.bg,
      border: `0.5px solid ${C.border}`,
      borderRadius: 10,
      padding: 15,
      marginBottom: 14,
      ...style,
    }}
  >
    {children}
  </div>
);
const CardTitle = ({ children }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 500,
      color: C.textSecondary,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

// ── Toggle ─────────────────────────────────────────────────────────────────
const Toggle = ({ defaultOn = true }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      onClick={() => setOn(!on)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        cursor: "pointer",
        position: "relative",
        background: on ? "#378ADD" : C.borderSecondary,
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: on ? 19 : 3,
          transition: "left .2s",
        }}
      />
    </div>
  );
};

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ pct, color }) => (
  <div
    style={{
      height: 5,
      background: C.bgSecondary,
      borderRadius: 4,
      overflow: "hidden",
      marginTop: 5,
    }}
  >
    <div
      style={{
        height: "100%",
        borderRadius: 4,
        background: color || C.blue,
        width: `${pct}%`,
      }}
    />
  </div>
);

// ── SLA track ──────────────────────────────────────────────────────────────
const SlaTrack = ({ pct, severity }) => {
  const color =
    severity === "S1" ? C.red : severity === "S2" ? C.orange : C.green;
  return (
    <div
      style={{
        height: 6,
        background: C.bgSecondary,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{ height: "100%", borderRadius: 4, background: color, width: `${pct}%` }}
      />
    </div>
  );
};

// ── API utilities ──────────────────────────────────────────────────────────
const useFetch = (apiFn, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFn()
      .then(res  => { if (active) { setData(res);  setLoading(false); } })
      .catch(()  => { if (active) { setLoading(false); } });
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading };
};

const Spinner = () => (
  <div style={{ textAlign: "center", padding: "30px 0", color: C.textTertiary, fontSize: 13 }}>Loading…</div>
);

const toArray = (res) => (Array.isArray(res) ? res : res?.data ?? res?.content ?? []);

// ── Toast ──────────────────────────────────────────────────────────────────
const useApiErrors = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message: e.detail }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };
    window.addEventListener("api-error", handler);
    return () => window.removeEventListener("api-error", handler);
  }, []);
  return [toasts, setToasts];
};

const ToastContainer = () => {
  const [toasts, setToasts] = useApiErrors();
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: "#1F2937", color: "#fff",
          padding: "11px 14px", borderRadius: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          fontSize: 13, minWidth: 260, maxWidth: 380,
          borderLeft: "3px solid #E24B4A",
          pointerEvents: "all",
        }}>
          <span style={{ flex: 1, lineHeight: 1.5 }}>{t.message}</span>
          <span
            onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            style={{ cursor: "pointer", opacity: 0.5, fontSize: 15, lineHeight: 1, flexShrink: 0, marginTop: 1 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
          >✕</span>
        </div>
      ))}
    </div>
  );
};

const normalizeAdminTicket = (t) => {
  const sev = String(t.severity?.name ?? t.severity ?? "");
  const sevLabel = (sev.includes("1") || sev.toLowerCase() === "s1" || sev.toLowerCase().includes("high")) ? "S1"
    : (sev.includes("2") || sev.toLowerCase() === "s2" || sev.toLowerCase().includes("moderate")) ? "S2" : "S3";
  return {
    id:          String(t.ticketId),
    title:       t.title || "—",
    client:      t.client?.name  || t.client  || "—",
    mod:         t.module?.name  || t.module  || "—",
    sev:         sevLabel,
    status:      t.status?.name  || t.status  || "Open",
    spoc:        t.deliverySpoc?.name || t.spoc?.name || t.spoc || "—",
    date:        (t.createdAt || t.dateOfCreation || "").split("T")[0] || "—",
    category:    t.category?.name || t.category || "—",
    environment: t.environment?.name || t.environment || "—",
    description: t.description || "",
  };
};

// ── Admin ticket data ──────────────────────────────────────────────────────
const ADMIN_TICKETS = [
  { 
    id: "TKT-01",
    description: "While configuring a calendar the system does not allow saving and returns status code: 400",
    title: "Calendar Save Fails with 400 Error",
    client: "Client 2",
    mod: "DPAI",
    sev: "S1",
    status: "Escalated",
    spoc: "Nikita K.",
    date: "2025-09-19",
    category: "Environment issue",
    environment: "UAT"
  },
  { 
    id: "TKT-02",
    description: "Getting error while performing complete loading in TMS",
    title: "Multi-issue rollup",
    client: "Client 1",
    mod: "TMS",
    sev: "S3",
    status: "Closed",
    spoc: "Ravi M.",
    date: "2025-12-23",
    category: "Bug (Code defect)",
    environment: "Prod"
  },
  { 
    id: "TKT-03",
    description: "The forecast with trigger date as 09-10-2025 isn’t generated yet and the status remains 'Forecast in Progress'.",
    title: "Incorrect Data after Migration",
    client: "Client 2",
    mod: "DPAI",
    sev: "S1",
    status: "In Progress",
    spoc: "Nikita K.",
    date: "2025-10-10",
    category: "Environment issue",
    environment: "Prod"
  },
  { 
    id: "TKT-04",
    description: "Route Re Sync button has bug, routes are reflecting even when not maintained in Route Master",
    title: "Workflow approval not triggering",
    client: "Client 3",
    mod: "TMS",
    sev: "S2",
    status: "Open",
    spoc: "Priya S.",
    date: "2025-11-05",
    category: "Bug (Code defect)",
    environment: "Prod"
  },
  { 
    id: "TKT-05",
    description: "When attempting to download the forecast from the grid, the system displays 'Download Failed, Please Try Again'.",
    title: "Report export fails silently",
    client: "Client 1",
    mod: "DS",
    sev: "S3",
    status: "Closed",
    spoc: "Ravi M.",
    date: "2025-10-22",
    category: "Configuration gap",
    environment: "UAT"
  },
  { 
    id: "TKT-06",
    description: "On Prod platform, the forecast has generated successfully but on UI it is not visible",
    title: "Login redirect loop on SSO",
    client: "Client 2",
    mod: "DPAI",
    sev: "S1",
    status: "Escalated",
    spoc: "Nikita K.",
    date: "2025-11-18",
    category: "Other",
    environment: "Prod"
  },
  { 
    id: "TKT-07",
    description: "Abnormal spike in forecast values for the last two horizons.",
    title: "Data sync timeout after 30s",
    client: "Client 3",
    mod: "DS",
    sev: "S2",
    status: "In Progress",
    spoc: "Priya S.",
    date: "2025-12-01",
    category: "Bug (Code defect)",
    environment: "Prod"
  },
  { 
    id: "TKT-08",
    description: "The forecast status is showing as 'In Progress' even though the SNOP was successfully created.",
    title: "Config missing after UAT reset",
    client: "Client 2",
    mod: "DPAI",
    sev: "S2",
    status: "Closed",
    spoc: "Nikita K.",
    date: "2025-12-15",
    category: "Other",
    environment: "UAT"
  },
  { 
    id: "TKT-09",
    description: "Route Re Sync button has bug, routes are reflecting even when not maintained in Route Master",
    title: "Notification email not sent",
    client: "Client 1",
    mod: "TMS",
    sev: "S2",
    status: "Open",
    spoc: "Ravi M.",
    date: "2026-01-08",
    category: "Bug (Code defect)",
    environment: "Prod"
  },
  { 
    id: "TKT-10",
    description: "While downloading the Mapping Master, the Quantity UOM column shows 'N/A'.",
    title: "UI alignment broken on mobile",
    client: "Client 3",
    mod: "DPAI",
    sev: "S3",
    status: "Open",
    spoc: "Priya S.",
    date: "2026-01-14",
    category: "Bug (Code defect)",
    environment: "Prod"
  },
  { 
    id: "TKT-11",
    description: "While uploading the Personnel Master file in EDM, a 'Network Error' is displayed and upload fails",
    title: "API timeout on bulk operations",
    client: "Client 1",
    mod: "DS",
    sev: "S1",
    status: "Escalated",
    spoc: "Ravi M.",
    date: "2026-02-01",
    category: "Other",
    environment: "Prod"
  },
  { 
    id: "TKT-12",
    description: "File downloaded from EDM is having duplicate records though no duplicates were uploaded",
    title: "Duplicate records after import",
    client: "Client 2",
    mod: "DS",
    sev: "S2",
    status: "Open",
    spoc: "Nikita K.",
    date: "2026-02-10",
    category: "Bug (Code defect)",
    environment: "PROD"
  },
  { 
    id: "TKT-13",
    description: "The user uploaded the budget template, status shows error but no error file is available",
    title: "PDF generation hangs",
    client: "Client 3",
    mod: "TMS",
    sev: "S3",
    status: "In Progress",
    spoc: "Priya S.",
    date: "2026-03-05",
    category: "Bug (Code defect)",
    environment: "UAT"
  },
  { 
    id: "TKT-14",
    description: "[UAT] Transaction Logs not showing data for PIM entity filter",
    title: "Role permissions not saving",
    client: "Client 1",
    mod: "DPAI",
    sev: "S2",
    status: "Open",
    spoc: "Ravi M.",
    date: "2026-03-12",
    category: "Bug (Code defect)",
    environment: "UAT"
  },
  { 
    id: "TKT-15",
    description: "SNOP status stuck at 'Forecast in Progress' and DFUs not loading",
    title: "Timezone mismatch in schedules",
    client: "Client 2",
    mod: "TMS",
    sev: "S3",
    status: "Closed",
    spoc: "Nikita K.",
    date: "2026-03-20",
    category: "Performance issue",
    environment: "Prod"
  },
];
// ── SVG icons ──────────────────────────────────────────────────────────────
const Icon = ({ d, size = 15 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ flexShrink: 0 }}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    {d}
  </svg>
);

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Tickets",
    items: [
      {
        key: "tickets",
        label: "All tickets",
        count: 18,
        countStyle: {},
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
        ),
      },
      {
        key: "escalated",
        label: "Escalations",
        count: 4,
        countStyle: { background: C.dangerBg, color: C.danger },
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        key: "clients",
        label: "Clients",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        key: "team",
        label: "Team",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Insights",
    items: [
      {
        key: "analytics",
        label: "Analytics",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
      },
      {
        key: "projects",
        label: "Projects",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Config",
    items: [
      {
        key: "sla",
        label: "SLA rules",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
      // {
      //   key: "kb",
      //   label: "Knowledge base",
      //   icon: (
      //     <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
      //       <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      //     </svg>
      //   ),
      // },
      {
        key: "settings",
        label: "Settings",
        icon: (
          <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

// ── Ticket Detail Dialog ───────────────────────────────────────────────────
const TicketDetailDialog = ({ ticket, users = [], onClose }) => {
  const [action,             setAction]             = useState(null);
  const [reason,             setReason]             = useState("");
  const [assignedToId,       setAssignedToId]       = useState("");
  const [estimatedTimeHours, setEstimatedTimeHours] = useState("");
  const [saving,             setSaving]             = useState(false);
  const [saved,              setSaved]              = useState(false);

  useEffect(() => {
    setAction(null); setReason(""); setAssignedToId("");
    setEstimatedTimeHours(""); setSaved(false);
  }, [ticket?.id]);

  if (!ticket) return null;

  const fieldSx = { width: "100%", padding: "7px 10px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, fontSize: 12, fontFamily: "inherit", color: C.text, outline: "none", background: C.bg, boxSizing: "border-box" };
  const labelSx = { fontSize: 12, fontWeight: 500, color: C.textSecondary, display: "block", marginBottom: 4 };

  const handleSave = async () => {
    if (saving) return;
    if (action === "escalate" && !reason.trim()) return;
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    setSaving(true);
    try {
      if (action === "escalate") {
        await createEscalation({
          ticketId:           Number(ticket.id),
          escalatedById:      currentUser.userId,
          assignedToId:       assignedToId ? Number(assignedToId) : undefined,
          reason:             reason.trim(),
          estimatedTimeHours: Number(estimatedTimeHours) || 0,
          resolvedAt:         null,
        });
      } else {
        await updateTicket(ticket.id, { statusId: 5 });
      }
      setSaved(true);
      setTimeout(() => onClose(), 1800);
    } catch (_) {}
    setSaving(false);
  };

  const DetailRow = ({ label, children }) => (
    <div style={{ display: "flex", gap: 16, padding: "10px 0", alignItems: "flex-start", borderBottom: `0.5px solid ${C.bgTertiary}` }}>
      <div style={{ minWidth: 140, fontSize: 13, color: C.textTertiary, fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "80vw", maxWidth: "80vw", height: "80vh", maxHeight: "80vh", background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 28px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: "0.06em", marginBottom: 4 }}>
              TICKET {ticket.id}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{ticket.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textSecondary, fontSize: 20, lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>

          {/* Left — ticket details */}
          <div style={{ paddingRight: 28, borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Ticket Details</div>
            <DetailRow label="Status"><StatBadge status={ticket.status} /></DetailRow>
            <DetailRow label="Severity"><SevBadge sev={ticket.sev} /></DetailRow>
            <DetailRow label="Client"><ClientBadge client={ticket.client} /></DetailRow>
            <DetailRow label="Module"><ModBadge mod={ticket.mod} /></DetailRow>
            <DetailRow label="Date"><span style={{ fontSize: 13, color: C.text }}>{ticket.date}</span></DetailRow>
            <DetailRow label="SPOC"><span style={{ fontSize: 13, color: C.text }}>{ticket.spoc}</span></DetailRow>
            <DetailRow label="Description">
              <Typography sx={{ fontSize: 13, color: "#374151", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {ticket.description || "No description provided."}
              </Typography>
            </DetailRow>
          </div>

          {/* Right — actions */}
          <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions</div>

            {/* Toggle buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                variant={action === "escalate" ? "warn" : "ghost"}
                onClick={() => setAction(a => a === "escalate" ? null : "escalate")}
                style={{ outline: action === "escalate" ? `2px solid ${C.warn}` : "none", outlineOffset: 1 }}
              >
                Escalate
              </Btn>
              <Btn
                variant={action === "close" ? "success" : "ghost"}
                onClick={() => setAction(a => a === "close" ? null : "close")}
                style={{ outline: action === "close" ? `2px solid ${C.success}` : "none", outlineOffset: 1 }}
              >
                Close ticket
              </Btn>
            </div>

            {/* Escalate fields */}
            {action === "escalate" && (
              <>
                <div>
                  <label style={labelSx}>Reason <span style={{ color: C.danger }}>*</span></label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Reason for escalation…"
                    style={{ ...fieldSx, minHeight: 70, resize: "vertical" }} />
                </div>
                <div>
                  <label style={labelSx}>Estimated hours</label>
                  <input type="number" min="0" value={estimatedTimeHours}
                    onChange={e => setEstimatedTimeHours(e.target.value)}
                    placeholder="e.g. 4"
                    style={fieldSx} />
                </div>
                <div>
                  <label style={labelSx}>Assign to</label>
                  <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} style={{ ...fieldSx, cursor: "pointer" }}>
                    <option value="">Select agent…</option>
                    {users.filter((u) => u?.role?.roleName === "Lead").map(u => (
                      <option key={u.id} value={u.userId}>
                        {u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || `User ${u.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Close ticket fields */}
            {action === "close" && (
              <div>
                <label style={labelSx}>Reason (optional)</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Reason for closing…"
                  style={{ ...fieldSx, minHeight: 70, resize: "vertical" }} />
              </div>
            )}

            {/* Save button */}
            {action && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Btn
                  variant="primary"
                  onClick={handleSave}
                  style={{ opacity: saving || (action === "escalate" && !reason.trim()) ? 0.55 : 1, cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Saving…" : "Save"}
                </Btn>
                {saved && <span style={{ fontSize: 12, color: C.success, fontWeight: 500 }}>✓ Saved successfully</span>}
              </div>
            )}

            {/* Internal notes */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Internal Notes</div>
              <textarea
                placeholder="Add an internal note…"
                style={{ ...fieldSx, minHeight: 90, fontSize: 13, resize: "vertical" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Section header ─────────────────────────────────────────────────────────
const SHeader = ({ title, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
    <div style={{ display: "flex", gap: 8 }}>{children}</div>
  </div>
);

// ── Alert banner ───────────────────────────────────────────────────────────
const AlertBanner = ({ type, children }) => {
  const styles = {
    danger: { background: C.dangerBg, color: C.danger, border: `0.5px solid #F7C1C1` },
    warn: { background: C.warnBg, color: C.warn, border: `0.5px solid #FAC775` },
  };
  return (
    <div style={{ padding: "9px 14px", borderRadius: 6, fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 8, ...styles[type] }}>
      {children}
    </div>
  );
};

// ── DASHBOARD SECTION ──────────────────────────────────────────────────────
const DashboardSection = () => {
  const openNewTicket = useContext(NewTicketCtx);
  const { data: statsRaw,      loading: statsLoading }      = useFetch(() => getDashboardStats());
  const { data: activitiesRaw, loading: activitiesLoading } = useFetch(() => getRecentActivities());
  const { data: clientChartRaw }                            = useFetch(() => getTicketsByClientDashboard());

  const stats          = statsRaw || {};
  const activities     = toArray(activitiesRaw);
  const clientChartApi = toArray(clientChartRaw);

  const metricCards = [
    { label: "Total tickets", val: stats.totalTickets   ?? stats.totalOpen          ?? "0", valStyle: { color: C.blue },    sub: "Across 3 clients"     },
    { label: "SLA breaches today", val: stats.slaBreachesToday ?? stats.slaBreaches     ?? "0", valStyle: { color: C.danger },  sub: "↑ 2 vs yesterday"    },
    { label: "Avg resolution time",val: stats.avgResolution ?? stats.avgResolutionTime  ?? "0", valStyle: {},                   sub: "Target: 2.5d"        },
    { label: "Closed this month",  val: stats.closedThisMonth                           ?? "0", valStyle: { color: C.success }, sub: "+18% vs last month"  },
    { label: "Escalations open",   val: stats.escalationsOpen ?? stats.openEscalations  ?? "1", valStyle: { color: C.warn },   sub: "Unassigned: 1"       },
    { label: "Team utilisation",   val: stats.teamUtilisation                           ?? "0", valStyle: {},                   sub: "4 agents active"     },
  ];

  const FALLBACK_ACTIVITY = [
    { color: C.red,      text: "TKT-004 escalated to S1 by Nikita K.", time: "12 min ago · Client 2" },
    { color: "#378ADD",  text: "TKT-018 assigned to Ravi M.",           time: "34 min ago · Client 1" },
    { color: C.green,    text: "TKT-009 closed — root cause: config error.", time: "1h ago · Client 3" },
    { color: C.orange,   text: "TKT-013 SLA warning triggered.",        time: "2h ago · Client 2" },
    { color: "#378ADD",  text: "New ticket TKT-034 raised by Client 1.",time: "3h ago · Client 1" },
  ];

  const clientColors = { "Client 1": "#D4537E", "Client 2": "#378ADD", "Client 3": "#1D9E75" };

  return (
    <div>
      <SHeader title="Admin dashboard">
        <Btn sm ghost>Export report</Btn>
        <Btn sm variant="primary" onClick={openNewTicket}>+ New ticket</Btn>
      </SHeader>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 18 }}>
        {metricCards.map((mc) => (
          <div key={mc.label} style={{ background: C.bgSecondary, borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 5 }}>{mc.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, ...mc.valStyle }}>{statsLoading ? "—" : mc.val}</div>
            <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 3 }}>{mc.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        {/* Tickets by client bar chart */}
        <Card>
          <CardTitle>Tickets by client</CardTitle>
          {(() => {
            const data = clientChartApi.length > 0
              ? clientChartApi.map(d => ({ client: d.name || d.client || d.clientName || d.label || "—", count: d.count ?? d.value ?? 0 }))
              : [];
            const max = Math.max(...data.map(d => d.count), 1);
            return (
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 130 }}>
                  {data.map(d => (
                    <div key={d.client} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4, height: "100%" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.count}</div>
                      <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", height: `${(d.count / max) * 100}%`, borderRadius: "4px 4px 0 0", background: clientColors[d.client] || C.blue, minHeight: 8, transition: "height 0.3s" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1.5px solid ${C.border}`, marginBottom: 6 }} />
                <div style={{ display: "flex", gap: 16 }}>
                  {data.map(d => (
                    <div key={d.client} style={{ flex: 1, textAlign: "center", fontSize: 11, color: C.textTertiary, fontWeight: 500 }}>{d.client}</div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                  {data.map(d => (
                    <div key={d.client} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textSecondary }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: clientColors[d.client] || C.blue, flexShrink: 0 }} />
                      {d.client} — {d.count} tickets
                    </div>
                  ))}
                </div>
                {data.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: C.textTertiary }}>No data</div>}
              </div>
            );
          })()}
        </Card>

        {/* Recent activity */}
        <Card>
          <CardTitle>Recent activity</CardTitle>
          {activitiesLoading ? <Spinner /> : (
            activities.length > 0
              ? activities.slice(0, 5).map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < Math.min(activities.length, 5) - 1 ? `0.5px solid ${C.border}` : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#378ADD", flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.description || a.text || a.message || "—"}</div>
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{a.time || a.timeAgo || ""}</div>
                    </div>
                  </div>
                ))
              : FALLBACK_ACTIVITY.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < FALLBACK_ACTIVITY.length - 1 ? `0.5px solid ${C.border}` : "none" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.text}</div>
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{a.time}</div>
                    </div>
                  </div>
                ))
          )}
        </Card>
      </div>
    </div>
  );
};

// ── ALL TICKETS SECTION ────────────────────────────────────────────────────
const AllTicketsSection = () => {
  const openNewTicket = useContext(NewTicketCtx);
  const [search,         setSearch]         = useState("");
  const [filterClient,   setFilterClient]   = useState("");
  const [filterMod,      setFilterMod]      = useState("");
  const [filterSev,      setFilterSev]      = useState("");
  const [filterStat,     setFilterStat]     = useState("");
  const [selected,       setSelected]       = useState(new Set());
  const [bulkVisible,    setBulkVisible]    = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // ── Ticket grid data (same useFetch pattern as every other section) ────────
  const { data: ticketsRaw, loading } = useFetch(
    () => getAllTickets({ module: filterMod || undefined, severity: filterSev || undefined, status: filterStat || undefined }),
    [filterMod, filterSev, filterStat]
  );
  const tickets = toArray(ticketsRaw).map(normalizeAdminTicket);

  // ── Dropdown data from API ─────────────────────────────────────────────────
  const [clients,    setClients]    = useState([]);
  const [modules,    setModules]    = useState([]);
  const [severities, setSeverities] = useState([]);
  const [statuses,   setStatuses]   = useState([]);
  const [users,      setUsers]      = useState([]);

  useEffect(() => {
    getAllClients().then(res => setClients(toArray(res))).catch(() => {});
    getAllModules().then(res => setModules(toArray(res))).catch(() => {});
    getAllSeverities().then(res => setSeverities(toArray(res))).catch(() => {});
    getAllTicketStatuses().then(res => setStatuses(toArray(res))).catch(() => {});
    getAllUsers().then(res => setUsers(toArray(res))).catch(() => {});
  }, []);

  const sevNameToLabel = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("1") || n.includes("high"))     return "S1";
    if (n.includes("2") || n.includes("moderate")) return "S2";
    return "S3";
  };

  const filtered = tickets.filter((t) => {
    const s = search.toLowerCase();
    return (
      (!s || t.title.toLowerCase().includes(s) || t.id.toLowerCase().includes(s)) &&
      (!filterClient || t?.projects?.client?.name === filterClient) &&
      (!filterMod    || t.mod    === filterMod) &&
      (!filterSev    || t.sev    === sevNameToLabel(filterSev)) &&
      (!filterStat   || t.status === filterStat)
    );
  });

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (checked) => {
    setSelected(checked ? new Set(filtered.map((t) => t.id)) : new Set());
  };

  const selectSx = {
    fontSize: 13,
    padding: "6px 10px",
    borderRadius: 6,
    border: `0.5px solid ${C.borderSecondary}`,
    background: C.bg,
    color: C.text,
  };

  return (
    <div>
      <TicketDetailDialog ticket={selectedTicket} users={users} onClose={() => setSelectedTicket(null)} />
      <SHeader title="All tickets">
        <Btn sm ghost onClick={() => setBulkVisible(!bulkVisible)}>Bulk actions</Btn>
        <Btn sm variant="primary" onClick={openNewTicket}>+ New ticket</Btn>
      </SHeader>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tickets…"
          style={{ ...selectSx, flex: 1, minWidth: 140 }}
        />
        <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} style={selectSx}>
          <option value="">All clients</option>
          {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={filterMod} onChange={(e) => setFilterMod(e.target.value)} style={selectSx}>
          <option value="">All modules</option>
          {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
        <select value={filterSev} onChange={(e) => setFilterSev(e.target.value)} style={selectSx}>
          <option value="">All severities</option>
          {severities.map(s => <option key={s.id} value={s.severityId}>{s.label}</option>)}
        </select>
        <select value={filterStat} onChange={(e) => setFilterStat(e.target.value)} style={selectSx}>
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {/* Bulk action bar */}
      {bulkVisible && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.blueBg, borderRadius: 6, marginBottom: 10, fontSize: 13, color: C.blue }}>
          <span>{selected.size} selected</span>
          <select style={{ ...selectSx, fontSize: 12, padding: "4px 8px" }}>
            <option value="">Assign to…</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <Btn sm variant="success">Close selected</Btn>
          <Btn sm variant="warn">Escalate</Btn>
          <Btn sm variant="danger">Delete</Btn>
        </div>
      )}

      {/* Table */}
       
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Ticket", "Client", "Module", "Severity", "Status", "SPOC", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "center", padding: "8px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 11, fontWeight: 500, color: C.textSecondary }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} style={{ cursor: "default" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.bgSecondary}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>Id-{t.id} · <Date></Date>{t.date}</div>
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><ClientBadge client={t.client} /></td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><ModBadge mod={t.mod} /></td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><SevBadge sev={t.sev} /></td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><StatBadge status={t.status} /></td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12 }}>{t.spoc}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Btn sm ghost onClick={() => setSelectedTicket(t)}>View</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px 0", color: C.textTertiary, fontSize: 13 }}>No tickets match your filters</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
    </div>
  );
};

// ── ESCALATIONS SECTION ────────────────────────────────────────────────────
const EscalationsSection = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getEscalationUnresolved().then((res) => {
      console.log("Escalations fetched:", res);
      if (active) {
        setEscalations(toArray(res));
        setLoading(false);
      }
    }).catch(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const unassigned = escalations.filter(e => !e.spoc || e.spoc === "—").length;
  const selectSx   = { fontSize: 12, padding: "4px 8px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text };

  return (
    <div>
      <SHeader title="Escalations">
        <Btn sm variant="primary">Assign all</Btn>
      </SHeader>
      {unassigned > 0 && (
        <AlertBanner type="warn">
          {unassigned} escalated ticket{unassigned > 1 ? "s are" : " is"} unassigned. Assign immediately to meet SLA.
        </AlertBanner>
      )}
      {loading ? <Spinner /> : (
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {["Ticket", "Client", "Severity", "SPOC", "Category", "Date", "Actions"].map((h) => (
                <th key={h} style={{ textAlign: "center", padding: "8px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 11, fontWeight: 500, color: C.textSecondary }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {escalations.map((e) => (
              <tr key={e.id}
                onMouseEnter={(ev) => ev.currentTarget.style.background = C.bgSecondary}
                onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}
              >
                {console.log(e)}
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{e?.ticket?.title || e?.ticket}</div>
                  <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>{e.id} · {e.mod}</div>
                </td>
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><ClientBadge client={e.client} /></td>
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><SevBadge sev={e.sev} /></td>
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12, ...((!e.spoc || e.spoc === "—") ? { color: C.danger } : {}) }}>
                  {e.spoc && e.spoc !== "—" ? e.spoc : "Unassigned"}
                </td>
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12 }}>{e.category}</td>
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12, color: C.danger }}>{e.date}</td>
                <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    <select style={selectSx}>
                      <option value="">Assign…</option>
                      <option>Nikita K.</option><option>Ravi M.</option><option>Priya S.</option>
                    </select>
                    <Btn sm variant="success">Resolve</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {escalations.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px 0", color: C.textTertiary, fontSize: 13 }}>No escalated tickets</td></tr>
            )}
          </tbody>
        </table>
      </Card>
      )}
    </div>
  );
};

// ── Client Tickets Popup ───────────────────────────────────────────────────
const ClientTicketsPopup = ({ client, tickets = [], loading = false, onClose }) => {
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => { setActiveTicket(null); }, [client?.id]);

  if (!client) return null;

  const clientTickets = tickets;

  const DetailRow = ({ label, children }) => (
    <div style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: `0.5px solid ${C.bgTertiary}`, alignItems: "flex-start" }}>
      <div style={{ minWidth: 100, fontSize: 12, color: C.textTertiary, fontWeight: 500, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "82vw", maxWidth: "82vw", height: "82vh", maxHeight: "82vh", background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* Popup header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, ...client.avSx }}>{client.code}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{client.name} — Tickets</div>
              <div style={{ fontSize: 11, color: C.textSecondary }}>{clientTickets.length} tickets · SPOC: {client.spoc}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textSecondary, fontSize: 20, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Two-panel body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Left 50%: Ticket grid ── */}
          <div style={{ width: "50%", borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: "14px 0" }}>
            {loading ? <Spinner /> : clientTickets.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.textTertiary, fontSize: 13 }}>
                No tickets found for this client.
              </div>
            ) : (
              clientTickets.map((t) => {
                const isActive = activeTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTicket(isActive ? null : t)}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "6px 12px",
                      padding: "11px 18px",
                      cursor: "pointer",
                      borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent",
                      background: isActive ? C.blueBg : "transparent",
                      borderBottom: `0.5px solid ${C.border}`,
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.bgSecondary; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Title + sub */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{t.id} · {t.date}</div>
                    </div>
                    {/* Status badge top-right */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <StatBadge status={t.status} />
                    </div>
                    {/* Module + severity on second row */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center", gridColumn: "1 / -1", marginTop: 4 }}>
                      <ModBadge mod={t.mod} />
                      <SevBadge sev={t.sev} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Right 50%: Ticket detail or placeholder ── */}
          <div style={{ width: "50%", overflowY: "auto", padding: "18px 22px" }}>
            {activeTicket ? (
              <div>
                {/* Detail header */}
                <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: "0.06em", marginBottom: 4 }}>
                    {activeTicket.id}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 10 }}>
                    {activeTicket.title}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StatBadge status={activeTicket.status} />
                    <SevBadge sev={activeTicket.sev} />
                    <ModBadge mod={activeTicket.mod} />
                    <ClientBadge client={activeTicket.client} />
                  </div>
                </div>

                {/* Detail rows */}
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Ticket Details
                </div>
                <DetailRow label="Status"><StatBadge status={activeTicket.status} /></DetailRow>
                <DetailRow label="Severity"><SevBadge sev={activeTicket.sev} /></DetailRow>
                <DetailRow label="Module"><ModBadge mod={activeTicket.mod} /></DetailRow>
                <DetailRow label="Date"><span style={{ fontSize: 13, color: C.text }}>{activeTicket.date}</span></DetailRow>
                <DetailRow label="SPOC"><span style={{ fontSize: 13, color: C.text }}>{activeTicket.spoc}</span></DetailRow>

                {/* Actions */}
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                    Actions
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Btn variant="warn" sm>Escalate</Btn>
                    <Btn variant="success" sm>Close ticket</Btn>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: C.textSecondary }}>Assign:</span>
                      <select style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text }}>
                        <option value="">Select…</option>
                        <option>Nikita K.</option><option>Ravi M.</option><option>Priya S.</option><option>Arjun T.</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Placeholder when no ticket selected */
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: C.textTertiary }}>
                <svg viewBox="0 0 24 24" width={44} height={44} fill="none" stroke={C.borderSecondary} strokeWidth={1.5}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.textSecondary }}>No ticket selected</div>
                <div style={{ fontSize: 12, color: C.textTertiary, textAlign: "center", maxWidth: 200 }}>
                  Click any ticket on the left to view its full details here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── CLIENTS SECTION ────────────────────────────────────────────────────────
const ClientsSection = () => {
  const [viewClient,  setViewClient]  = useState(null);
  const [viewTickets, setViewTickets] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const handleViewTickets = async (cl) => {
    setViewClient(cl);
    setViewTickets([]);
    setViewLoading(true);
    try {
      const res = await getTicketsByClient(cl.id);
      setViewTickets(toArray(res).map(normalizeAdminTicket));
    } catch (_) {}
    setViewLoading(false);
  };

  const closePopup = () => { setViewClient(null); setViewTickets([]); setViewLoading(false); };
  const { data: clientsRaw, loading } = useFetch(() => getAllClients());

  const STATIC_CLIENTS = [
    { code: "C1", name: "Client 1", since: "Since Jan 2024", avSx: { background: "#FBEAF0", color: "#72243E" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, spoc: "Ravi M.", mods: "DPAI, DS", stats: [{ val: 11, label: "Open", color: C.blue }, { val: 2, label: "At risk", color: C.danger }, { val: 9, label: "Closed", color: C.success }], border: "none" },
    { code: "C2", name: "Client 2", since: "Since Mar 2024", avSx: { background: C.blueBg, color: C.blueDark }, health: { label: "At risk", bg: C.dangerBg, color: C.danger }, spoc: "Nikita K.", mods: "DPAI, TMS", stats: [{ val: 14, label: "Open", color: C.blue }, { val: 4, label: "At risk", color: C.danger }, { val: 12, label: "Closed", color: C.success }], border: `2px solid #378ADD` },
    { code: "C3", name: "Client 3", since: "Since Jul 2024", avSx: { background: C.successBg, color: "#27500A" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, spoc: "Priya S.", mods: "TMS, DS", stats: [{ val: 9, label: "Open", color: C.blue }, { val: 1, label: "At risk", color: C.warn }, { val: 6, label: "Closed", color: C.success }], border: "none" },
  ];

  const CLIENT_META = [
    { avSx: { background: "#FBEAF0", color: "#72243E" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, border: "none" },
    { avSx: { background: C.blueBg, color: C.blueDark }, health: { label: "At risk", bg: C.dangerBg, color: C.danger }, border: `2px solid #378ADD` },
    { avSx: { background: C.successBg, color: "#27500A" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, border: "none" },
  ];

  const rawClients = toArray(clientsRaw);
  const clients = rawClients.length > 0
    ? rawClients.map((c, i) => {
        const meta = CLIENT_META[i % CLIENT_META.length];
        const name = c.name || c.clientName || `Client ${i + 1}`;
        return {
          code:   name.slice(0, 2).toUpperCase(),
          name,
          id:     c.id ?? c.clientId,
          since:  c.createdAt ? `Since ${c.createdAt.split("T")[0]}` : c.since || "—",
          avSx:   meta.avSx,
          health: meta.health,
          spoc:   c.spoc?.name || c.deliverySpoc?.name || c.spoc || "—",
          mods:   Array.isArray(c.modules) ? c.modules.join(", ") : c.modules || "—",
          stats:  [
            { val: c.openTickets   ?? "—", label: "Open",    color: C.blue    },
            { val: c.atRisk        ?? "—", label: "At risk", color: C.danger  },
            { val: c.closedTickets ?? "—", label: "Closed",  color: C.success },
          ],
          border: meta.border,
        };
      })
    : STATIC_CLIENTS;

  return (
    <div>
      <ClientTicketsPopup client={viewClient} tickets={viewTickets} loading={viewLoading} onClose={closePopup} />
      <SHeader title="Client management">
        <Btn sm variant="primary">+ Add client</Btn>
      </SHeader>
      {loading && <Spinner />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {clients.map((cl) => (
          console.log(cl),
          <div key={cl.code} style={{ background: C.bg, border: cl.border || `0.5px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, ...cl.avSx }}>{cl.code}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{cl.name}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>{cl.since}</div>
                </div>
              </div>
              <Badge style={{ background: cl.health.bg, color: cl.health.color }}>{cl.health.label}</Badge>
            </div>{console.log({cl,"spoc": cl.spoc, "mods": cl.mods})}
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>Client SPOC: {cl.spoc} · Modules: {cl.mods}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
              {cl.stats.map((s) => (
                <div key={s.label} style={{ background: C.bgSecondary, borderRadius: 6, padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.textTertiary }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <Btn sm ghost onClick={() => handleViewTickets(cl)}>View tickets</Btn>
              {/* <Btn sm ghost>Edit</Btn> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── TEAM SECTION ───────────────────────────────────────────────────────────
const TeamSection = () => {
  const { data: usersRaw, loading } = useFetch(() => getUserById(5));

  const STATIC_MEMBERS = [
    { initials: "NK", name: "Nikita K.", role: "LEAD", roleSx: { background: "#EEEDFE", color: "#3C3489" }, technicalRole: "Engineering", technicalRoleSx: { background: "#EEEDFE", color: "#b77e3c" }, stats: "12 active · Client 2 · Avg 3.1d", avSx: { background: C.blueBg, color: C.blueDark }, workload: 85, wColor: C.red, tickets: 12 },
    { initials: "RM", name: "Ravi M.", role: "LEAD", roleSx: { background: "#EEEDFE", color: "#3C3489" }, technicalRole: "DS", technicalRoleSx: { background: "#EEEDFE", color: "#b77e3c" }, stats: "8 active · Client 1 · Avg 2.8d", avSx: { background: "#FBEAF0", color: "#72243E" }, workload: 58, wColor: C.orange, tickets: 8 },
    { initials: "PS", name: "Priya S.", role: "LEAD", roleSx: { background: "#EEEDFE", color: "#3C3489" }, technicalRole: "Product", technicalRoleSx: { background: "#EEEDFE", color: "#b77e3c" }, stats: "6 active · Client 3 · Avg 3.5d", avSx: { background: C.successBg, color: "#27500A" }, workload: 43, wColor: "#378ADD", tickets: 6 },
    { initials: "AT", name: "Arjun T.", role: "SPOC", roleSx: { background: "#E1F5EE", color: "#085041" }, technicalRole: "Delivery", technicalRoleSx: { background: "#E1F5EE", color: "#b77e3c" }, stats: "4 active · All clients · Avg 4.1d", avSx: { background: "#E1F5EE", color: "#085041" }, workload: 72, wColor: C.orange, tickets: 4 },
  ];

  const MEMBER_META = [
    { avSx: { background: C.blueBg, color: C.blueDark }, wColor: C.red },
    { avSx: { background: "#FBEAF0", color: "#72243E" }, wColor: C.orange },
    { avSx: { background: C.successBg, color: "#27500A" }, wColor: "#378ADD" },
    { avSx: { background: "#E1F5EE", color: "#085041" }, wColor: C.orange },
  ];

  const mkInitials = (name = "") => name.split(/\s+/).map(w => w[0] || "").join("").slice(0, 2).toUpperCase();

  const rawUsers = toArray(usersRaw);
  const members = rawUsers.length > 0
    ? rawUsers.map((u, i) => {
        const meta = MEMBER_META[i % MEMBER_META.length];
        const name = u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || `User ${i + 1}`;
        const role = u.role?.roleName || u.role?.name || (typeof u.role === "string" ? u.role : "SPOC");
        const tickets = u.activeTickets ?? u.openTickets ?? 0;
        return {
          initials:      mkInitials(name),
          name,
          role,
          roleSx:        { background: "#EEEDFE", color: "#3C3489" },
          technicalRole: (typeof u.department === "string" ? u.department : null) || (typeof u.team === "string" ? u.team : null) || "—",
          technicalRoleSx: { background: "#EEEDFE", color: "#b77e3c" },
          stats:         `${tickets} active · ${u.client?.name || (typeof u.client === "string" ? u.client : "—")} · Avg ${u.avgResolution || "—"}`,
          avSx:          meta.avSx,
          workload:      u.workload ?? Math.min(tickets * 7, 100),
          wColor:        meta.wColor,
          tickets,
        };
      })
    : STATIC_MEMBERS;

  return (
    <div>
      <SHeader title="Team management">
        <Btn sm variant="primary">+ Add member</Btn>
      </SHeader>
      {loading && <Spinner />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <div>
          {members.map((m) => (
            <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: `0.5px solid ${C.border}`, borderRadius: 10, background: C.bg, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0, ...m.avSx }}>{m.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: 11,gap:2, display:"flex" ,justifyContent:"center"}}><Badge style={m.roleSx}>{m.role}</Badge><Badge style={m.technicalRoleSx}>{m.technicalRole}</Badge></div>
                <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{m.stats}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {/* <Btn sm ghost>Edit</Btn> */}
                <Btn sm ghost>Tickets</Btn>
              </div>
            </div>
          ))}
        </div>

        <Card>
          <CardTitle>Team workload</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {members.map((m) => (
              <div key={m.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span>{m.name}</span><span>{m.tickets} tickets</span>
                </div>
                <ProgressBar pct={m.workload} color={m.wColor} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: `0.5px solid ${C.border}` }}>
            <CardTitle>Role permissions</CardTitle>
            <div style={{ fontSize: 12 }}>
              {[
                { badge: "Admin", bg: C.dangerBg, color: C.danger, desc: "Full access — all clients, config, team" },
                { badge: "SPOC", bg: "#EEEDFE", color: "#3C3489", desc: "Assigned client — tickets, projects, KB" },
                { badge: "Agent", bg: "#E1F5EE", color: "#085041", desc: "View & update assigned tickets only" },
              ].map((r, i) => (
                <div key={r.badge} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none", alignItems: "center" }}>
                  <Badge style={{ background: r.bg, color: r.color }}>{r.badge}</Badge>
                  <span style={{ color: C.textSecondary, fontSize: 12 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── ANALYTICS SECTION ──────────────────────────────────────────────────────
const AnalyticsSection = () => {
  const { data: clientChartRaw }   = useFetch(() => getTicketsByClientDashboard());
  const { data: categoryChartRaw } = useFetch(() => getTicketsByCategory());
  const { data: moduleChartRaw }   = useFetch(() => getTicketsByModule());

  const SimpleBarChart = ({ data, colorFn }) => {
    const max = Math.max(...data.map((d) => d.val), 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110, marginBottom: 6 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 3, height: "100%" }}>
            <div style={{ fontSize: 10, fontWeight: 500 }}>{d.val}</div>
            <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: colorFn ? colorFn(d) : "#378ADD", height: `${(d.val / max) * 100}%` }} />
            </div>
            <div style={{ fontSize: 10, color: C.textTertiary }}>{d.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const CLIENT_COLORS = ["#D4537E", "#378ADD", "#1D9E75", "#EF9F27", "#9C6FDE"];
  const SEV_COLORS    = { S1: C.red, S2: C.orange, S3: C.green };

  const rawClient   = toArray(clientChartRaw);
  const rawCategory = toArray(categoryChartRaw);
  const rawModule   = toArray(moduleChartRaw);

  const clientData = rawClient.length > 0
    ? rawClient.map((d, i) => ({ label: d.name || d.client || d.clientName || `C${i+1}`, val: d.count ?? d.value ?? 0, color: CLIENT_COLORS[i % CLIENT_COLORS.length] }))
    : [{ label: "C1", val: 18, color: "#D4537E" }, { label: "C2", val: 22, color: "#378ADD" }, { label: "C3", val: 12, color: "#1D9E75" }];

  const monthData = [
    { label: "Oct", val: 6 }, { label: "Nov", val: 9 }, { label: "Dec", val: 14 },
    { label: "Jan", val: 11 }, { label: "Feb", val: 8 },
  ];

  const sevData = rawModule.length > 0
    ? rawModule.map(d => { const l = d.name || d.module || "—"; return { label: l, val: d.count ?? d.value ?? 0, color: SEV_COLORS[l] || "#378ADD" }; })
    : [{ label: "S1", val: 12, color: C.red }, { label: "S2", val: 16, color: C.orange }, { label: "S3", val: 10, color: C.green }];

  const totalCat  = rawCategory.reduce((s, d) => s + (d.count ?? d.value ?? 0), 0) || 1;
  const categoryItems = rawCategory.length > 0
    ? rawCategory.map((d, i) => ({ color: CLIENT_COLORS[i % CLIENT_COLORS.length], label: `${d.name || d.category || "—"} ${Math.round(((d.count ?? d.value ?? 0) / totalCat) * 100)}%` }))
    : [{ color: "#378ADD", label: "Env issue 42%" }, { color: C.orange, label: "Bug 25%" }, { color: C.green, label: "Change req 20%" }, { color: "#D4537E", label: "Other 13%" }];

  return (
    <div>
      <SHeader title="Analytics">
        <Btn sm ghost>Export CSV</Btn>
      </SHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Tickets by client</CardTitle>
          <SimpleBarChart data={clientData} colorFn={(d) => d.color} />
        </Card>

        <Card>
          <CardTitle>Category mix</CardTitle>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="28" fill="none" stroke="#E6F1FB" strokeWidth="14" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="#378ADD" strokeWidth="14" strokeDasharray="53 126" strokeDashoffset="0" transform="rotate(-90 40 40)" />
              <circle cx="40" cy="40" r="28" fill="none" stroke={C.orange} strokeWidth="14" strokeDasharray="32 126" strokeDashoffset="-53" transform="rotate(-90 40 40)" />
              <circle cx="40" cy="40" r="28" fill="none" stroke={C.green} strokeWidth="14" strokeDasharray="25 126" strokeDashoffset="-85" transform="rotate(-90 40 40)" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="#D4537E" strokeWidth="14" strokeDasharray="16 126" strokeDashoffset="-110" transform="rotate(-90 40 40)" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
              {categoryItems.map((ci) => (
                <div key={ci.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ci.color, flexShrink: 0 }} />
                  <span>{ci.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Monthly volume</CardTitle>
          <SimpleBarChart data={monthData} colorFn={() => "#378ADD"} />
        </Card>

        <Card>
          <CardTitle>Module breakdown</CardTitle>
          <SimpleBarChart data={sevData} colorFn={(d) => d.color} />
        </Card>
      </div>
    </div>
  );
};

// ── PROJECTS SECTION ───────────────────────────────────────────────────────
const ProjectsSection = () => {
  const { data: projectsRaw, loading } = useFetch(() => getAllProjects());

  const STATIC_PROJECTS = [
    { title: "DPAI — Phase 2 Rollout", client: "Client 2", spoc: "Nikita K.", due: "28 Feb 2026", statusLabel: "In progress · 68%", statusSx: { background: C.warnBg, color: C.warn }, pct: 68, pColor: "#378ADD", note: "AI summary: Integration testing blocked by 3 open env tickets. ETA slipping by ~4 days." },
    { title: "TMS — Configuration Upgrade", client: "Client 2", spoc: "Nikita K.", due: "15 May 2026", statusLabel: "Planned · 22%", statusSx: { background: C.blueBg, color: C.blue }, pct: 22, pColor: "#378ADD", note: null },
    { title: "DS — Data Migration v2", client: "Client 1", spoc: "Ravi M.", due: "30 Jun 2026", statusLabel: "Planned · 10%", statusSx: { background: C.blueBg, color: C.blue }, pct: 10, pColor: "#378ADD", note: null },
    { title: "TMS — Onboarding", client: "Client 3", spoc: "Priya S.", due: "30 Sep 2026", statusLabel: "Complete · 100%", statusSx: { background: C.successBg, color: C.success }, pct: 100, pColor: C.green, note: null },
  ];

  const statusSxMap = (s = "") => {
    const sl = s.toLowerCase();
    if (sl.includes("progress") || sl.includes("active")) return { bg: C.warnBg, color: C.warn };
    if (sl.includes("complete") || sl.includes("done"))   return { bg: C.successBg, color: C.success };
    return { bg: C.blueBg, color: C.blue };
  };

  const rawProjects = toArray(projectsRaw);
  const projects = rawProjects.length > 0
    ? rawProjects.map(p => {
        const status = p.status?.name || p.status || "Planned";
        const pct    = p.progress ?? p.completionPct ?? p.percentage ?? 0;
        const ssx    = statusSxMap(status);
        return {
          title:       p.name || p.title || "—",
          client:      p.client?.name || p.client || "—",
          spoc:        p.spoc?.name || p.deliverySpoc?.name || p.spoc || "—",
          due:         (p.dueDate || p.due || "").split("T")[0] || "—",
          statusLabel: `${status} · ${pct}%`,
          statusSx:    { background: ssx.bg, color: ssx.color },
          pct,
          pColor:      "#378ADD",
          note:        p.aiSummary || p.summary || null,
        };
      })
    : STATIC_PROJECTS;

  return (
    <div>
      <SHeader title="All projects">
        <Btn sm variant="primary">+ New project</Btn>
      </SHeader>
      {loading && <Spinner />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p) => (
          <Card key={p.title} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                  <ClientBadge client={p.client} /> · SPOC: {p.spoc} · Due {p.due}
                </div>
              </div>
              <Badge style={p.statusSx}>{p.statusLabel}</Badge>
            </div>
            <ProgressBar pct={p.pct} color={p.pColor} />
            {p.note && <div style={{ marginTop: 8, fontSize: 12, color: C.textSecondary }}>✦ {p.note}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── SLA RULES SECTION ──────────────────────────────────────────────────────
const SlaSection = () => {
  const SlaRule = ({ label, sub, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.bg, marginBottom: 6 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{sub}</div>
      </div>
      {children}
    </div>
  );

  const SlaInput = ({ defaultValue }) => (
    <input
      defaultValue={defaultValue}
      style={{ width: 70, padding: "5px 8px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, fontSize: 13, textAlign: "center", background: C.bg, color: C.text }}
    />
  );

  return (
    <div>
      <SHeader title="SLA configuration">
        <Btn sm variant="primary">Save changes</Btn>
      </SHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Response time (hours)</CardTitle>
          <SlaRule label={<><Badge style={{ background: C.dangerBg, color: C.danger }}>S1 — Critical</Badge></>} sub="First response target"><SlaInput defaultValue="2" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.warnBg, color: C.warn }}>S2 — Moderate</Badge></>} sub="First response target"><SlaInput defaultValue="8" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.successBg, color: C.success }}>S3 — Low</Badge></>} sub="First response target"><SlaInput defaultValue="24" /></SlaRule>
        </Card>
        <Card>
          <CardTitle>Resolution time (hours)</CardTitle>
          <SlaRule label={<><Badge style={{ background: C.dangerBg, color: C.danger }}>S1 — Critical</Badge></>} sub="Full resolution target"><SlaInput defaultValue="8" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.warnBg, color: C.warn }}>S2 — Moderate</Badge></>} sub="Full resolution target"><SlaInput defaultValue="48" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.successBg, color: C.success }}>S3 — Low</Badge></>} sub="Full resolution target"><SlaInput defaultValue="120" /></SlaRule>
        </Card>
        <Card>
          <CardTitle>Escalation rules</CardTitle>
          <SlaRule label="Auto-escalate at breach %" sub="Triggers auto-assign to senior SPOC"><SlaInput defaultValue="80" /></SlaRule>
          <SlaRule label="Notify admin at %" sub="Sends admin alert notification"><SlaInput defaultValue="60" /></SlaRule>
          <SlaRule label="S1 re-alert interval (min)" sub="Repeat alerts until resolved"><SlaInput defaultValue="30" /></SlaRule>
        </Card>
        <Card>
          <CardTitle>Business hours</CardTitle>
          <SlaRule label="Start time" sub="SLA clock start (IST)"><SlaInput defaultValue="09:00" /></SlaRule>
          <SlaRule label="End time" sub="SLA clock end (IST)"><SlaInput defaultValue="18:00" /></SlaRule>
          <SlaRule label="Weekend SLA pause" sub="Exclude Sat & Sun from clock"><Toggle defaultOn={true} /></SlaRule>
        </Card>
      </div>
    </div>
  );
};

// ── KNOWLEDGE BASE SECTION ─────────────────────────────────────────────────
const KbSection = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const articles = [
    { cat: "Environment", catSx: { background: C.blueBg, color: C.blueDark }, title: "Fixing 400 errors on calendar save in DPAI", meta: "142 views · Updated 8 Apr 2026 · By Nikita K." },
    { cat: "Configuration", catSx: { background: "#EEEDFE", color: "#3C3489" }, title: "UAT environment reset checklist", meta: "98 views · Updated 2 Apr 2026 · By Ravi M." },
    { cat: "Bug", catSx: { background: C.dangerBg, color: C.danger }, title: "Troubleshooting SSO login redirect loops", meta: "76 views · Updated 29 Mar 2026 · By Priya S." },
    { cat: "Change Request", catSx: { background: C.successBg, color: C.success }, title: "How to submit a change request", meta: "211 views · Updated 1 Apr 2026 · By Nikita K." },
    { cat: "Environment", catSx: { background: C.blueBg, color: C.blueDark }, title: "Data sync timeouts — causes and resolutions", meta: "55 views · Updated 5 Apr 2026 · By Arjun T." },
    { cat: "Configuration", catSx: { background: "#EEEDFE", color: "#3C3489" }, title: "TMS workflow approval not triggering", meta: "89 views · Updated 10 Apr 2026 · By Ravi M." },
  ];

  const filtered = articles.filter(
    (a) =>
      (!search || a.title.toLowerCase().includes(search.toLowerCase())) &&
      (!catFilter || a.cat === catFilter)
  );

  const selectSx = { fontSize: 13, padding: "6px 10px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text };

  return (
    <div>
      <SHeader title="Knowledge base">
        <Btn sm variant="primary">+ New article</Btn>
      </SHeader>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles…"
          style={{ ...selectSx, flex: 1, minWidth: 140 }}
        />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={selectSx}>
          <option value="">All categories</option>
          <option>Environment</option><option>Bug</option><option>Configuration</option><option>Change Request</option>
        </select>
      </div>
      {filtered.map((a) => (
        <div key={a.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.bg, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap", ...a.catSx }}>{a.cat}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: C.textTertiary }}>{a.meta}</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Btn sm ghost>Edit</Btn>
            <Btn sm variant="danger">Delete</Btn>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── SETTINGS SECTION ───────────────────────────────────────────────────────
const SettingsSection = () => {
  const SettingsRow = ({ label, sub, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `0.5px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{sub}</div>
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <SHeader title="System settings">
        <Btn sm variant="primary">Save</Btn>
      </SHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Notifications</CardTitle>
          <SettingsRow label="Email alerts on SLA breach" sub="Admin receives email when breach triggered"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Slack integration" sub="Post escalation alerts to #support-alerts"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Daily digest email" sub="Summary sent to admin at 9:00 AM IST"><Toggle defaultOn={false} /></SettingsRow>
          <SettingsRow label="Client notifications" sub="Auto-notify clients on ticket status change"><Toggle defaultOn /></SettingsRow>
        </Card>
        <Card>
          <CardTitle>AI features</CardTitle>
          <SettingsRow label="Triage agent" sub="Auto-categorise and pre-fill raised tickets"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Similar ticket suggestions" sub="Show related tickets on raise screen"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="KB deflection" sub="Show KB matches before ticket submission"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Auto-generate KB articles" sub="Create draft articles from closed tickets"><Toggle defaultOn={false} /></SettingsRow>
          <SettingsRow label="Weekly project summaries" sub="AI generates and sends project digests"><Toggle defaultOn /></SettingsRow>
        </Card>
        <Card>
          <CardTitle>Access & security</CardTitle>
          <SettingsRow label="SSO authentication" sub="Enforce Google / Azure AD login"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Two-factor auth" sub="Required for admin & SPOC accounts"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Audit logging" sub="Log all admin actions with timestamps"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="IP allow-list" sub="Restrict admin access by IP range"><Toggle defaultOn={false} /></SettingsRow>
        </Card>
        <Card>
          <CardTitle>Danger zone</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button style={{ textAlign: "left", width: "100%", display: "flex", justifyContent: "space-between", padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", background: "transparent", border: `0.5px solid ${C.borderSecondary}`, color: C.text }}>
              Export all data <span style={{ color: C.textTertiary }}>CSV / JSON</span>
            </button>
            <button style={{ textAlign: "left", width: "100%", display: "flex", justifyContent: "space-between", padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", background: "transparent", border: `0.5px solid ${C.borderSecondary}`, color: C.text }}>
              Reset demo data <span style={{ color: C.textTertiary }}>Restore defaults</span>
            </button>
            <button style={{ textAlign: "left", width: "100%", padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", background: C.dangerBg, color: C.danger, border: "none" }}>
              Purge closed tickets older than 90d
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── NEW TICKET MODAL ───────────────────────────────────────────────────────
const NewTicketModal = ({ onClose }) => (
  <div
    onClick={onClose}
    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ width: "82vw", maxWidth: "82vw", height: "82vh", maxHeight: "82vh", background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Raise a Ticket</div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 2 }}>Use AI-assisted or fill the form manually</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.textSecondary, lineHeight: 1, padding: 4 }}>✕</button>
      </div>
      {/* Body — RaiseIssuePanel needs its own padding/scroll context */}
      <div style={{ flex: 1, overflow: "hidden", padding: "18px 22px" }}>
        <RaiseIssuePanel />
      </div>
    </div>
  </div>
);

// ── MAIN ADMIN LAYOUT ──────────────────────────────────────────────────────
const AdminLayout = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const openNewTicket = useCallback(() => setNewTicketOpen(true), []);

  const sections = {
    dashboard: <DashboardSection />,
    tickets: <AllTicketsSection />,
    escalated: <EscalationsSection />,
    clients: <ClientsSection />,
    team: <TeamSection />,
    analytics: <AnalyticsSection />,
    projects: <ProjectsSection />,
    sla: <SlaSection />,
    // kb: <KbSection />,
    settings: <SettingsSection />,
  };

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: C.text, display: "flex", flexDirection: "column", height: "100vh", fontSize: 14 }}>
      <ToastContainer />
      {newTicketOpen && <NewTicketModal onClose={() => setNewTicketOpen(false)} />}
      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: `0.5px solid ${C.border}`, background: C.bg, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#fff" strokeWidth={2.2}>
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 3H8v4h8V3z" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Relay</span>
          <span style={{ fontSize: 11, fontWeight: 500, background: C.dangerBg, color: C.danger, padding: "2px 8px", borderRadius: 4, marginLeft: 6 }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", cursor: "pointer", width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={C.textSecondary} strokeWidth={2}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, position: "absolute", top: 4, right: 4 }} />
          </div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#185FA5", color: "#fff", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>SA</div>
          <span style={{ fontSize: 13, color: C.textSecondary }}>Super Admin</span>
          <button
            onClick={handleLogout}
            style={{
              marginLeft: 4,
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 10px",
              borderRadius: 6,
              border: `0.5px solid ${C.borderSecondary}`,
              background: C.bg,
              color: C.textSecondary,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.color = "#A32D2D"; e.currentTarget.style.borderColor = "#FECACA"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.borderColor = C.borderSecondary; }}
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 180, borderRight: `0.5px solid ${C.border}`, background: C.bg, flexShrink: 0, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <div style={{ fontSize: 10, fontWeight: 500, color: C.textTertiary, padding: "12px 14px 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      padding: "8px 14px",
                      fontSize: 13,
                      cursor: "pointer",
                      color: isActive ? "#185FA5" : C.textSecondary,
                      background: isActive ? C.blueBg : "transparent",
                      borderLeft: isActive ? "2px solid #185FA5" : "2px solid transparent",
                      fontWeight: isActive ? 500 : 400,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = C.bgSecondary; e.currentTarget.style.color = C.text; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; } }}
                  >
                    {item.icon}
                    {item.label}
                    {item.count !== undefined && (
                      <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 6px", borderRadius: 10, ...(item.countStyle || { background: C.dangerBg, color: C.danger }) }}>
                        {item.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 18, background: C.bgTertiary, overflowY: "auto", minWidth: 0 }}>
          <NewTicketCtx.Provider value={openNewTicket}>
            {sections[activeSection]}
          </NewTicketCtx.Provider>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
