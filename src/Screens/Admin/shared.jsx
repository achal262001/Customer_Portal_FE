import { useState, useEffect, createContext } from "react";
import { Typography } from "@mui/material";
import {
  createEscalation, updateTicket, AssignTeamToTicket,
} from "../../Supportive Files/api";
import { RaiseIssuePanel } from "../Home/RaiseIssuePanel";

// ── Color tokens ────────────────────────────────────────────────────────────
export const C = {
  bg: "var(--c-bg)",
  bgSecondary: "var(--c-bg-s)",
  bgTertiary: "var(--c-bg-t)",
  border: "var(--c-border)",
  borderSecondary: "var(--c-border-s)",
  text: "var(--c-text)",
  textSecondary: "var(--c-text-s)",
  textTertiary: "var(--c-text-t)",
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

// ── Badges ──────────────────────────────────────────────────────────────────
export const Badge = ({ children, style }) => (
  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", ...style }}>
    {children}
  </span>
);

export const SevBadge = ({ sev }) => {
  const map = { S1: { bg: C.dangerBg, color: C.danger }, S2: { bg: C.warnBg, color: C.warn }, S3: { bg: C.successBg, color: C.success } };
  const s = map[sev] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{sev}</Badge>;
};

export const StatBadge = ({ status }) => {
  const map = { Open: { bg: C.blueBg, color: C.blue }, "In Progress": { bg: C.warnBg, color: C.warn }, Escalated: { bg: C.dangerBg, color: C.danger }, Closed: { bg: C.successBg, color: C.success } };
  const s = map[status] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{status}</Badge>;
};

export const ClientBadge = ({ client }) => {
  const map = { "Client 1": { bg: "#FBEAF0", color: "#72243E" }, "Client 2": { bg: C.blueBg, color: C.blueDark }, "Client 3": { bg: C.successBg, color: "#27500A" } };
  const s = map[client] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{client}</Badge>;
};

export const ModBadge = ({ mod }) => {
  const map = { DPAI: { bg: C.blueBg, color: C.blueDark }, TMS: { bg: "#E1F5EE", color: "#085041" }, DS: { bg: "#EEEDFE", color: "#3C3489" } };
  const s = map[mod] || { bg: C.bgSecondary, color: C.textSecondary };
  return <Badge style={{ background: s.bg, color: s.color }}>{mod}</Badge>;
};

// ── Button ──────────────────────────────────────────────────────────────────
export const Btn = ({ children, variant = "ghost", sm, onClick, style }) => {
  const base = { padding: sm ? "5px 10px" : "7px 14px", borderRadius: 6, fontSize: sm ? 11 : 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", border: "none" };
  const variants = {
    primary: { background: C.blue, color: "#fff", border: "none" },
    ghost: { background: "transparent", border: `0.5px solid ${C.borderSecondary}`, color: C.text },
    danger: { background: C.dangerBg, color: C.danger, border: "none" },
    warn: { background: C.warnBg, color: C.warn, border: "none" },
    success: { background: C.successBg, color: C.success, border: "none" },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>{children}</button>;
};

// ── Card ────────────────────────────────────────────────────────────────────
export const Card = ({ children, style }) => (
  <div style={{ background: C.bg, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: 15, marginBottom: 14, ...style }}>
    {children}
  </div>
);

export const CardTitle = ({ children }) => (
  <div style={{ fontSize: 12, fontWeight: 500, color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
    {children}
  </div>
);

// ── UI primitives ───────────────────────────────────────────────────────────
export const Toggle = ({ defaultOn = true }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(!on)} style={{ width: 36, height: 20, borderRadius: 10, cursor: "pointer", position: "relative", background: on ? "#378ADD" : C.borderSecondary, transition: "background .2s", flexShrink: 0 }}>
      <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 19 : 3, transition: "left .2s" }} />
    </div>
  );
};

export const ProgressBar = ({ pct, color }) => (
  <div style={{ height: 5, background: C.bgSecondary, borderRadius: 4, overflow: "hidden", marginTop: 5 }}>
    <div style={{ height: "100%", borderRadius: 4, background: color || C.blue, width: `${pct}%` }} />
  </div>
);

export const SlaTrack = ({ pct, severity }) => {
  const color = severity === "S1" ? C.red : severity === "S2" ? C.orange : C.green;
  return (
    <div style={{ height: 6, background: C.bgSecondary, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", borderRadius: 4, background: color, width: `${pct}%` }} />
    </div>
  );
};

export const Spinner = () => (
  <div style={{ textAlign: "center", padding: "30px 0", color: C.textTertiary, fontSize: 13 }}>Loading…</div>
);

export const Icon = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth={2}>
    {d}
  </svg>
);

// ── Hooks & utils ───────────────────────────────────────────────────────────
export const useFetch = (apiFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFn()
      .then(res => { if (active) { setData(res); setLoading(false); } })
      .catch(() => { if (active) { setLoading(false); } });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading };
};

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

export const ToastContainer = () => {
  const [toasts, setToasts] = useApiErrors();
  if (toasts.length === 0) return null;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "#1F2937", color: "#fff", padding: "11px 14px", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", fontSize: 13, minWidth: 260, maxWidth: 380, borderLeft: "3px solid #E24B4A", pointerEvents: "all" }}>
          <span style={{ flex: 1, lineHeight: 1.5 }}>{t.message}</span>
          <span onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} style={{ cursor: "pointer", opacity: 0.5, fontSize: 15, lineHeight: 1, flexShrink: 0, marginTop: 1 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>✕</span>
        </div>
      ))}
    </div>
  );
};

export const toArray = (res) => (Array.isArray(res) ? res : res?.data ?? res?.content ?? []);

export const normalizeAdminTicket = (t) => {
  const sev = String(t.severity?.name ?? t.severity ?? "");
  const sevLabel = (sev.includes("1") || sev.toLowerCase() === "s1" || sev.toLowerCase().includes("high")) ? "S1"
    : (sev.includes("2") || sev.toLowerCase() === "s2" || sev.toLowerCase().includes("moderate")) ? "S2" : "S3";
  return {
    id: String(t.ticketId),
    title: t.title || "—",
    client: t.client?.name || t.client || "—",
    mod: t.moduleName || t.module || "—",
    sev: sevLabel,
    status: t.status?.name || t.status || "Open",
    spoc: t.deliverySpoc?.name || t.spoc?.name || t.spoc || "—",
    date: (t.createdAt || t.dateOfCreation || "").split("T")[0] || "—",
    category: t.category?.name || t.category || "—",
    environment: t.environment?.name || t.environment || "—",
    description: t.description || "",
  };
};

export const normalizeTeamTicket = (t) => {
  const sevLabel = String(t.severityLabel || "");
  const sev = (sevLabel.includes("S1") || sevLabel.toLowerCase().includes("high")) ? "S1"
    : (sevLabel.includes("S2") || sevLabel.toLowerCase().includes("moderate")) ? "S2" : "S3";
  return {
    id: String(t.ticketId || t.id || ""),
    title: t.title || "—",
    client: t.clientName || "—",
    mod: t.moduleName || "—",
    sev,
    status: t.statusName || "Open",
    spoc: "—",
    date: (t.dateOfCreation || "").split("T")[0] || "—",
    category: t.categoryName || "—",
    environment: t.environmentName || "—",
    description: t.description || "",
  };
};

// ── Layout helpers ──────────────────────────────────────────────────────────
export const SHeader = ({ title, children }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <span style={{ fontSize: 16, fontWeight: 500 }}>{title}</span>
    <div style={{ display: "flex", gap: 8 }}>{children}</div>
  </div>
);

export const AlertBanner = ({ type, children }) => {
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

// ── Context ─────────────────────────────────────────────────────────────────
export const NewTicketCtx = createContext(() => {});

// ── Navigation ──────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  {
    section: "Overview",
    items: [{ key: "dashboard", label: "Dashboard", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> }],
  },
  {
    section: "Tickets",
    items: [
      { key: "tickets", label: "All tickets", count: "", countStyle: {}, icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg> },
      { key: "escalated", label: "Escalations", count: "", countStyle: { background: C.dangerBg, color: C.danger }, icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
    ],
  },
  {
    section: "Management",
    items: [
      { key: "clients", label: "Clients", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg> },
      { key: "team", label: "Team", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 10-16 0" /></svg> },
    ],
  },
  {
    section: "Insights",
    items: [
      { key: "analytics", label: "Analytics", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
      { key: "projects", label: "Projects", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    ],
  },
  {
    section: "Config",
    items: [
      { key: "sla", label: "SLA rules", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
      { key: "settings", label: "Settings", icon: <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg> },
    ],
  },
];

// ── Ticket detail dialog ─────────────────────────────────────────────────────
export const TicketDetailDialog = ({ ticket, users = [], teams = [], onClose }) => {
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [estimatedTimeHours, setEstimatedTimeHours] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setAction(null); setReason(""); setAssignedToId("");
    setEstimatedTimeHours(""); setSaved(false); setSelectedTeamId("");
  }, [ticket?.id]);

  if (!ticket) return null;

  const fieldSx = { width: "100%", padding: "7px 10px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, fontSize: 12, fontFamily: "inherit", color: C.text, outline: "none", background: C.bg, boxSizing: "border-box" };
  const labelSx = { fontSize: 12, fontWeight: 500, color: C.textSecondary, display: "block", marginBottom: 4 };

  const DetailRow = ({ label, children }) => (
    <div style={{ display: "flex", gap: 16, padding: "10px 0", alignItems: "flex-start", borderBottom: `0.5px solid ${C.bgTertiary}` }}>
      <div style={{ minWidth: 140, fontSize: 13, color: C.textTertiary, fontWeight: 500 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  const handleSave = async () => {
    if (saving) return;
    if (action === "escalate" && !reason.trim()) return;
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    setSaving(true);
    try {
      if (action === "escalate") {
        await createEscalation({ ticketId: Number(ticket.id), escalatedById: currentUser.userId, assignedToId: assignedToId ? Number(assignedToId) : undefined, reason: reason.trim(), estimatedTimeHours: Number(estimatedTimeHours) || 0, resolvedAt: null });
      } else {
        await updateTicket(ticket.id, { statusId: 5 });
      }
      setSaved(true);
      setTimeout(() => onClose(), 1800);
    } catch (_) {}
    setSaving(false);
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "80vw", maxWidth: "80vw", height: "80vh", maxHeight: "80vh", background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 28px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: "0.06em", marginBottom: 4 }}>TICKET {ticket.id}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{ticket.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textSecondary, fontSize: 20, lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
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
          <div style={{ paddingLeft: 28, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant={action === "escalate" ? "warn" : "ghost"} onClick={() => setAction(a => a === "escalate" ? null : "escalate")} style={{ outline: action === "escalate" ? `2px solid ${C.warn}` : "none", outlineOffset: 1 }}>Escalate</Btn>
              <Btn variant={action === "close" ? "success" : "ghost"} onClick={() => setAction(a => a === "close" ? null : "close")} style={{ outline: action === "close" ? `2px solid ${C.success}` : "none", outlineOffset: 1 }}>Close ticket</Btn>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.textSecondary }}>Assign:</span>
                <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text }}>
                  <option value="">Select Team Leads</option>
                  {teams.map(u => <option key={u.id} value={u.teamId}>{u?.leadUser?.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || `User ${u.id}`}</option>)}
                </select>
                {selectedTeamId && (
                  <button disabled={assigning} onClick={async () => { setAssigning(true); try { await AssignTeamToTicket(selectedTeamId, ticket?.id); setSelectedTeamId(""); } finally { setAssigning(false); } }}
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, border: "none", background: C.blue, color: "#fff", cursor: assigning ? "not-allowed" : "pointer", opacity: assigning ? 0.7 : 1 }}>
                    {assigning ? "Assigning…" : "Assign"}
                  </button>
                )}
              </div>
            </div>
            {action === "escalate" && (
              <>
                <div>
                  <label style={labelSx}>Reason <span style={{ color: C.danger }}>*</span></label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for escalation…" style={{ ...fieldSx, minHeight: 70, resize: "vertical" }} />
                </div>
                <div>
                  <label style={labelSx}>Estimated hours</label>
                  <input type="number" min="0" value={estimatedTimeHours} onChange={e => setEstimatedTimeHours(e.target.value)} placeholder="e.g. 4" style={fieldSx} />
                </div>
                <div>
                  <label style={labelSx}>Assign to</label>
                  <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} style={{ ...fieldSx, cursor: "pointer" }}>
                    <option value="">Select agent…</option>
                    {users.filter(u => u?.role?.roleName === "Lead").map(u => <option key={u.id} value={u.userId}>{u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || `User ${u.id}`}</option>)}
                  </select>
                </div>
              </>
            )}
            {action === "close" && (
              <div>
                <label style={labelSx}>Reason (optional)</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for closing…" style={{ ...fieldSx, minHeight: 70, resize: "vertical" }} />
              </div>
            )}
            {action && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Btn variant="primary" onClick={handleSave} style={{ opacity: saving || (action === "escalate" && !reason.trim()) ? 0.55 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : "Save"}
                </Btn>
                {saved && <span style={{ fontSize: 12, color: C.success, fontWeight: 500 }}>✓ Saved successfully</span>}
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Internal Notes</div>
              <textarea placeholder="Add an internal note…" style={{ ...fieldSx, minHeight: 90, fontSize: 13, resize: "vertical" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Client tickets popup ─────────────────────────────────────────────────────
export const ClientTicketsPopup = ({ client, tickets = [], loading = false, onClose }) => {
  const [activeTicket, setActiveTicket] = useState(null);
  useEffect(() => { setActiveTicket(null); }, [client?.id]);
  if (!client) return null;

  const DetailRow = ({ label, children }) => (
    <div style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: `0.5px solid ${C.bgTertiary}`, alignItems: "flex-start" }}>
      <div style={{ minWidth: 100, fontSize: 12, color: C.textTertiary, fontWeight: 500, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "82vw", maxWidth: "82vw", height: "82vh", maxHeight: "82vh", background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, ...client.avSx }}>{client.code}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{client.name} — Tickets</div>
              <div style={{ fontSize: 11, color: C.textSecondary }}>{tickets.length} tickets · SPOC: {client.spoc}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.textSecondary, fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ width: "50%", borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: "14px 0" }}>
            {loading ? <Spinner /> : tickets.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: C.textTertiary, fontSize: 13 }}>No tickets found for this client.</div>
            ) : tickets.map((t) => {
              const isActive = activeTicket?.id === t.id;
              return (
                <div key={t.id} onClick={() => setActiveTicket(isActive ? null : t)}
                  style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "6px 12px", padding: "11px 18px", cursor: "pointer", borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent", background: isActive ? C.blueBg : "transparent", borderBottom: `0.5px solid ${C.border}`, transition: "background 0.12s" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = C.bgSecondary; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{t.id} · {t.date}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}><StatBadge status={t.status} /></div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", gridColumn: "1 / -1", marginTop: 4 }}>
                    <ModBadge mod={t.mod} /><SevBadge sev={t.sev} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ width: "50%", overflowY: "auto", padding: "18px 22px" }}>
            {activeTicket ? (
              <div>
                <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: "0.06em", marginBottom: 4 }}>{activeTicket.id}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 10 }}>{activeTicket.title}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <StatBadge status={activeTicket.status} /><SevBadge sev={activeTicket.sev} /><ModBadge mod={activeTicket.mod} /><ClientBadge client={activeTicket.client} />
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Ticket Details</div>
                <DetailRow label="Status"><StatBadge status={activeTicket.status} /></DetailRow>
                <DetailRow label="Severity"><SevBadge sev={activeTicket.sev} /></DetailRow>
                <DetailRow label="Module"><ModBadge mod={activeTicket.mod} /></DetailRow>
                <DetailRow label="Date"><span style={{ fontSize: 13, color: C.text }}>{activeTicket.date}</span></DetailRow>
                <DetailRow label="SPOC"><span style={{ fontSize: 13, color: C.text }}>{activeTicket.spoc}</span></DetailRow>
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Actions</div>
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
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: C.textTertiary }}>
                <svg viewBox="0 0 24 24" width={44} height={44} fill="none" stroke={C.borderSecondary} strokeWidth={1.5}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.textSecondary }}>No ticket selected</div>
                <div style={{ fontSize: 12, color: C.textTertiary, textAlign: "center", maxWidth: 200 }}>Click any ticket on the left to view its full details here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── New ticket modal ─────────────────────────────────────────────────────────
export const NewTicketModal = ({ onClose }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div onClick={e => e.stopPropagation()} style={{ width: "82vw", maxWidth: "82vw", height: "82vh", maxHeight: "82vh", background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.22)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Raise a Ticket</div>
          <div style={{ fontSize: 12, color: C.textTertiary, marginTop: 2 }}>Use AI-assisted or fill the form manually</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: C.textSecondary, lineHeight: 1, padding: 4 }}>✕</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden", padding: "18px 22px" }}>
        <RaiseIssuePanel />
      </div>
    </div>
  </div>
);
