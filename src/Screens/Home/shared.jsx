import { useState, useEffect } from "react";
import { Box, Typography, Dialog, DialogContent, IconButton, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

// ── Color helpers ────────────────────────────────────────────────────────────
export const modStyle = (m = "") => {
  const u = m.toUpperCase();
  if (u === "DPAI") return { bg: "#E6F1FB", color: "#185FA5" };
  if (u === "TMS") return { bg: "#E1F5EE", color: "#0F6E56" };
  if (u === "DS") return { bg: "#EEEDFE", color: "#534AB7" };
  if (u === "EDM") return { bg: "#FEF3EA", color: "#854F0B" };
  return { bg: "#F3F4F6", color: "#6B7280" };
};

export const sevStyle = (raw = "") => {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("severity 1") || s === "s1" || s.includes("high"))
    return { bg: "#FCEBEB", color: "#A32D2D", label: "S1" };
  if (s.includes("severity 2") || s === "s2" || s.includes("moderate"))
    return { bg: "#FAEEDA", color: "#854F0B", label: "S2" };
  return { bg: "#EAF3DE", color: "#3B6D11", label: "S3" };
};

export const statStyle = (status = "") => {
  const s = status.toLowerCase();
  if (s === "open") return { bg: "#E6F1FB", color: "#185FA5" };
  if (s === "closed") return { bg: "#EAF3DE", color: "#3B6D11" };
  return { bg: "#FAEEDA", color: "#854F0B" };
};

// ── Badges ───────────────────────────────────────────────────────────────────
export const Tag = ({ label, bg, color }) => (
  <Box component="span" sx={{ fontSize: 11, fontWeight: 500, px: "8px", py: "2px", borderRadius: "4px", backgroundColor: bg, color, display: "inline-block", lineHeight: 1.6, whiteSpace: "nowrap" }}>
    {label}
  </Box>
);
export const ModTag = ({ m }) => { const s = modStyle(m); return <Tag label={m} bg={s.bg} color={s.color} />; };
export const SevTag = ({ sev }) => { const s = sevStyle(sev); return <Tag label={s.label} bg={s.bg} color={s.color} />; };
export const StatTag = ({ status }) => { const s = statStyle(status); return <Tag label={status} bg={s.bg} color={s.color} />; };

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Box sx={{ backgroundColor: theme.palette.background.paper, border: `0.5px solid ${theme.palette.divider}`, borderRadius: "10px", p: 2, ...sx }}>
      {children}
    </Box>
  );
};

export const CardTitle = ({ children }) => {
  const theme = useTheme();
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>
      {children}
    </Typography>
  );
};

// ── Table helpers ────────────────────────────────────────────────────────────
export const TH = ({ children }) => {
  const theme = useTheme();
  return (
    <Box component="th" sx={{ textAlign: "center", py: "8px", px: "10px", borderBottom: `0.5px solid ${theme.palette.divider}`, color: theme.palette.text.secondary, fontWeight: 500, fontSize: 12, whiteSpace: "nowrap" }}>
      {children}
    </Box>
  );
};

export const TD = ({ children, sx = {} }) => {
  const theme = useTheme();
  return (
    <Box component="td" sx={{ py: "9px", px: "10px", borderBottom: `0.5px solid ${theme.palette.divider}`, verticalAlign: "top", fontSize: 13, ...sx }}>
      {children}
    </Box>
  );
};

// ── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = () => {
  const theme = useTheme();
  return <Box sx={{ textAlign: "center", py: 5, color: theme.palette.text.disabled, fontSize: 13 }}>Loading…</Box>;
};

// ── Hooks & utils ────────────────────────────────────────────────────────────
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

export const toArray = (res) => (Array.isArray(res) ? res : res?.data ?? res?.content ?? []);

export const normalizeTicket = (t) => {
  const sev = t.severity?.name || t.severity || t.sev || "";
  return {
    id: String(t.ticketId || t.id),
    title: t.title || "—",
    module: t.moduleName || t.module || "—",
    env: t.environment?.name || t.environment || "—",
    sev: sevStyle(sev).label,
    cat: t.category?.name || t.category || "—",
    status: t.status?.name || t.status || "Open",
    date: (t.createdAt || t.date || "").split("T")[0] || "—",
    issues: t.description || t.issues || "",
    client: t.client?.name || t.client || "—",
    spoc: t.deliverySpoc?.name || t.spoc?.name || t.spoc || "—",
  };
};

// ── Toast ────────────────────────────────────────────────────────────────────
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
    <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
      {toasts.map(t => (
        <Box key={t.id} sx={{ display: "flex", alignItems: "flex-start", gap: "10px", backgroundColor: "#1F2937", color: "#fff", px: "14px", py: "11px", borderRadius: "8px", boxShadow: "0 4px 16px rgba(0,0,0,0.25)", fontSize: 13, minWidth: 260, maxWidth: 380, borderLeft: "3px solid #E24B4A", pointerEvents: "all" }}>
          <Box sx={{ flex: 1, lineHeight: 1.5 }}>{t.message}</Box>
          <Box component="span" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} sx={{ cursor: "pointer", opacity: 0.5, fontSize: 15, lineHeight: 1, "&:hover": { opacity: 1 }, flexShrink: 0, mt: "1px" }}>✕</Box>
        </Box>
      ))}
    </Box>
  );
};

// ── Ticket detail dialog ──────────────────────────────────────────────────────
export const DetailRow = ({ label, children }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", gap: 2, py: 1.4, alignItems: "flex-start" }}>
      <Typography sx={{ fontSize: 12, color: theme.palette.text.disabled, minWidth: 140, fontWeight: 500 }}>{label}</Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
};

export const TicketDetailDialog = ({ ticket, onClose }) => {
  const theme = useTheme();
  if (!ticket) return null;
  return (
    <Dialog open={!!ticket} onClose={onClose} PaperProps={{ sx: { width: "80vw", maxWidth: "80vw", height: "80vh", maxHeight: "80vh", borderRadius: "12px", boxShadow: "0 16px 48px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column" } }}>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", px: 4, pt: 3, pb: 2, borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: theme.palette.text.disabled, letterSpacing: 0.6 }}>{ticket.id}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, mt: 0.3, lineHeight: 1.4 }}>{ticket.title}</Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5, flexShrink: 0 }}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", px: 4, py: 3, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, alignContent: "start" }}>
          <Box sx={{ pr: 4, borderRight: `1px solid ${theme.palette.divider}` }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: theme.palette.text.disabled, textTransform: "uppercase", letterSpacing: 0.6, mb: 1, display: "block" }}>Ticket Details</Typography>
            <DetailRow label="Status"><StatTag status={ticket.status} /></DetailRow>
            <Divider />
            <DetailRow label="Severity"><SevTag sev={ticket.sev} /></DetailRow>
            <Divider />
            <DetailRow label="Module"><ModTag m={ticket.module} /></DetailRow>
            <Divider />
            <DetailRow label="Environment"><Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{ticket.env || "—"}</Typography></DetailRow>
            <Divider />
            <DetailRow label="Date"><Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{ticket.date || "—"}</Typography></DetailRow>
            <Divider />
            <DetailRow label="Client"><Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{ticket.client || "—"}</Typography></DetailRow>
            <Divider />
            <DetailRow label="Ticket Category"><Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{ticket.cat || "—"}</Typography></DetailRow>
            <Divider />
            <DetailRow label="Delivery SPOC"><Typography sx={{ fontSize: 13, color: theme.palette.text.primary }}>{ticket.spoc || "—"}</Typography></DetailRow>
            <Divider />
          </Box>
          <Box sx={{ pl: 4 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: theme.palette.text.disabled, textTransform: "uppercase", letterSpacing: 0.6, mb: 1, display: "block" }}>Issue Description</Typography>
            <Typography sx={{ fontSize: 13, color: theme.palette.text.primary, lineHeight: 1.9, whiteSpace: "pre-wrap", mt: 1 }}>{ticket.issues || "No description provided."}</Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
