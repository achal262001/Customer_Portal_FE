import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Dialog, DialogContent, IconButton, Divider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  getAllTickets, getDashboardStats, getTicketActivity,
  getTicketsByModule, getTicketsByCategory, createTicket,
  getAllProjects, getRecentActivities, logout,
  generateDraft, finalizeTicket,
  getAllModules, getAllEnvironments, getAllCategories,
  getAllSeverities, getMilestones,
  getAllClients,
  getTicketsByClient,
} from "../../Supportive Files/api";
import { TriageFlow } from "./TriageFlow";

// ─── Color helpers ────────────────────────────────────────────────────────────
const modStyle = (m = "") => {
  const u = m.toUpperCase();
  if (u === "DPAI") return { bg: "#E6F1FB", color: "#185FA5" };
  if (u === "TMS")  return { bg: "#E1F5EE", color: "#0F6E56" };
  if (u === "DS")   return { bg: "#EEEDFE", color: "#534AB7" };
  if (u === "EDM")  return { bg: "#FEF3EA", color: "#854F0B" };
  return                  { bg: "#F3F4F6", color: "#6B7280" };
};

const sevStyle = (raw = "") => {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("severity 1") || s === "s1" || s.includes("high"))
    return { bg: "#FCEBEB", color: "#A32D2D", label: "S1" };
  if (s.includes("severity 2") || s === "s2" || s.includes("moderate"))
    return { bg: "#FAEEDA", color: "#854F0B", label: "S2" };
  return { bg: "#EAF3DE", color: "#3B6D11", label: "S3" };
};

const statStyle = (status = "") => {
  const s = status.toLowerCase();
  if (s === "open")        return { bg: "#E6F1FB", color: "#185FA5" };
  if (s === "closed")      return { bg: "#EAF3DE", color: "#3B6D11" };
  return                          { bg: "#FAEEDA", color: "#854F0B" };
};

// ─── Shared badge/tag ─────────────────────────────────────────────────────────
const Tag = ({ label, bg, color }) => (
  <Box component="span" sx={{
    fontSize: 11, fontWeight: 500, px: "8px", py: "2px",
    borderRadius: "4px", backgroundColor: bg, color,
    display: "inline-block", lineHeight: 1.6, whiteSpace: "nowrap",
  }}>
    {label}
  </Box>
);
const ModTag  = ({ m })      => { const s = modStyle(m);   return <Tag label={m}       bg={s.bg} color={s.color} />; };
const SevTag  = ({ sev })    => { const s = sevStyle(sev); return <Tag label={s.label} bg={s.bg} color={s.color} />; };
const StatTag = ({ status }) => { const s = statStyle(status); return <Tag label={status} bg={s.bg} color={s.color} />; };

// ─── Shared card ─────────────────────────────────────────────────────────────
const Card = ({ children, sx = {} }) => (
  <Box sx={{ backgroundColor: "#fff", border: "0.5px solid #E5E7EB", borderRadius: "10px", p: 2, ...sx }}>
    {children}
  </Box>
);
const CardTitle = ({ children }) => (
  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", mb: 1.5 }}>
    {children}
  </Typography>
);

// ─── Table helpers ────────────────────────────────────────────────────────────
const TH = ({ children }) => (
  <Box component="th" sx={{ textAlign: "center", py: "8px", px: "10px", borderBottom: "0.5px solid #E5E7EB", color: "#6B7280", fontWeight: 500, fontSize: 12, whiteSpace: "nowrap" }}>
    {children}
  </Box>
);
const TD = ({ children, sx = {} }) => (
  <Box component="td" sx={{ py: "9px", px: "10px", borderBottom: "0.5px solid #E5E7EB", verticalAlign: "top", fontSize: 13, ...sx }}>
    {children}
  </Box>
);

// ─── API utilities ────────────────────────────────────────────────────────────
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
  <Box sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: 13 }}>Loading…</Box>
);

const normalizeTicket = (t) => {
  const sev = t.severity?.name || t.severity || t.sev || "";
  return {
    id:     String(t.ticketId || t.id),
    title:  t.title || "—",
    module: t.module?.name  || t.module  || "—",
    env:    t.environment?.name || t.environment || "—",
    sev:    sevStyle(sev).label,
    cat:    t.category?.name || t.category || "—",
    status: t.status?.name  || t.status  || "Open",
    date:   (t.createdAt || t.date || "").split("T")[0] || "—",
    issues: t.description || t.issues || "",
    client: t.client?.name  || t.client  || "—",
    spoc:   t.deliverySpoc?.name || t.spoc?.name || t.spoc || "—",
  };
};

const toArray = (res) => (Array.isArray(res) ? res : res?.data ?? res?.content ?? []);

// ─── Toast ────────────────────────────────────────────────────────────────────
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
    <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "none" }}>
      {toasts.map(t => (
        <Box key={t.id} sx={{
          display: "flex", alignItems: "flex-start", gap: "10px",
          backgroundColor: "#1F2937", color: "#fff",
          px: "14px", py: "11px", borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          fontSize: 13, minWidth: 260, maxWidth: 380,
          borderLeft: "3px solid #E24B4A",
          pointerEvents: "all",
          animation: "fadeInUp .2s ease",
        }}>
          <Box sx={{ flex: 1, lineHeight: 1.5 }}>{t.message}</Box>
          <Box component="span" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            sx={{ cursor: "pointer", opacity: 0.5, fontSize: 15, lineHeight: 1, "&:hover": { opacity: 1 }, flexShrink: 0, mt: "1px" }}>
            ✕
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// ─── KB articles ─────────────────────────────────────────────────────────────
const KB_ARTICLES = [
  { cat: "Environment",   catBg: "#E6F1FB", catColor: "#185FA5", title: "Fixing 400 errors on calendar save in DPAI",  desc: "Step-by-step resolution for the most common 400 errors encountered in UAT environments.", views: 142, updated: "8 Apr 2026"  },
  { cat: "Configuration", catBg: "#EEEDFE", catColor: "#534AB7", title: "UAT environment reset checklist",              desc: "Ensure all config values are preserved after a UAT reset. Covers modules DPAI, TMS and DS.",  views: 98,  updated: "2 Apr 2026"  },
  { cat: "Bug",           catBg: "#FCEBEB", catColor: "#A32D2D", title: "Troubleshooting SSO login redirect loops",      desc: "Common causes and fixes for SSO redirect loops in production environments.",                views: 76,  updated: "29 Mar 2026" },
  { cat: "Change Request",catBg: "#EAF3DE", catColor: "#3B6D11", title: "How to submit a change request",               desc: "Process guide: raising, approving, and tracking change requests through the portal.",         views: 211, updated: "1 Apr 2026"  },
  { cat: "Environment",   catBg: "#E6F1FB", catColor: "#185FA5", title: "Data sync timeouts – causes and resolutions",  desc: "Diagnose why syncs time out after 30 seconds and how to adjust config thresholds.",            views: 55,  updated: "5 Apr 2026"  },
  { cat: "Configuration", catBg: "#EEEDFE", catColor: "#534AB7", title: "TMS workflow approval not triggering",          desc: "Covers missing trigger conditions, approval chain config, and common fallback errors.",        views: 89,  updated: "10 Apr 2026" },
];

// ─── Ticket detail dialog (shared by All Tickets + My Tickets) ───────────────
const DetailRow = ({ label, children }) => (
  <Box sx={{ display: "flex", gap: 2, py: 1.4, alignItems: "flex-start" }}>
    <Typography sx={{ fontSize: 12, color: "#9CA3AF", minWidth: 140, fontWeight: 500 }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

const TicketDetailDialog = ({ ticket, onClose }) => {
  if (!ticket) return null;
  return (
    <Dialog
      open={!!ticket}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "80vw", maxWidth: "80vw",
          height: "80vh", maxHeight: "80vh",
          borderRadius: "12px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", px: 4, pt: 3, pb: 2, borderBottom: "1px solid #F0F0F0", flexShrink: 0 }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 0.6 }}>
              {ticket.id}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mt: 0.3, lineHeight: 1.4 }}>
              {ticket.title}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5, flexShrink: 0 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Body — scrollable, 2-column */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 4, py: 3, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, alignContent: "start" }}>

          {/* Left — meta */}
          <Box sx={{ pr: 4, borderRight: "1px solid #F0F0F0" }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, mb: 1, display: "block" }}>
              Ticket Details
            </Typography>

            <DetailRow label="Status"><StatTag status={ticket.status} /></DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Severity"><SevTag sev={ticket.sev} /></DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Module"><ModTag m={ticket.module} /></DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Environment">
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.env || "—"}</Typography>
            </DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Date">
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.date || "—"}</Typography>
            </DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Client">
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.client || "—"}</Typography>
            </DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Ticket Category">
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.cat || "—"}</Typography>
            </DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

            <DetailRow label="Delivery SPOC">
              <Typography sx={{ fontSize: 13, color: "#374151" }}>{ticket.spoc || "—"}</Typography>
            </DetailRow>
            <Divider sx={{ borderColor: "#F9F9F9" }} />

          </Box>

          {/* Right — issue description */}
          <Box sx={{ pl: 4 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, mb: 1, display: "block" }}>
              Issue Description
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#374151", lineHeight: 1.9, whiteSpace: "pre-wrap", mt: 1 }}>
              {ticket.issues || "No description provided."}
            </Typography>
          </Box>
        </Box>

      </DialogContent>
    </Dialog>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 1 — DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const DashboardPanel = () => {
  const { data: statsRaw,    loading: statsLoading }    = useFetch(() => getDashboardStats());
  const { data: activityRaw, loading: activityLoading } = useFetch(() => getTicketActivity());
  const { data: modulesRaw }                            = useFetch(() => getTicketsByModule());
  const { data: ticketsRaw,  loading: ticketsLoading }  = useFetch(() => getAllTickets());

  const stats        = statsRaw || {};
  const ticketsByDate = toArray(activityRaw).map(d => ({
    date:  d.date ? d.date.split("T")[0].slice(5).replace("-", " ") : d.label || d.name || "—",
    count: d.count ?? d.value ?? 0,
  }));
  const moduleBreakdown = toArray(modulesRaw).map(m => ({ mod: m.label || m.module, n: m.count ?? m.value ?? 0 }));
  const recentTickets   = toArray(ticketsRaw).slice(0, 3).map(normalizeTicket);

  const metrics = [
    { label: "Open issues",       value: stats.openTickets   ?? stats.totalOpen   ?? "—", sub: "Awaiting action",   valueColor: "#185FA5" },
    { label: "Avg resolution",    value: stats.avgResolution ?? stats.avgResolutionTime ?? "—", sub: "Last 30 days", valueColor: "#111827" },
    { label: "Closed this month", value: stats.closedThisMonth ?? "—",                    sub: "vs prior month",    valueColor: "#639922" },
  ];

  return (
    <Box>
      {/* Metrics */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1.2, mb: 2.5 }}>
        {metrics.map(m => (
          <Box key={m.label} sx={{ backgroundColor: "#F9FAFB", borderRadius: "8px", p: "14px" }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 0.8 }}>{m.label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 500, color: m.valueColor }}>{m.value}</Typography>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.4 }}>{m.sub}</Typography>
          </Box>
        ))}
      </Box>

      {/* 2-col row */}
      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1.5, mb: 2.5 }}>

        {/* Number of Tickets vs Date */}
        <Card>
          <CardTitle>Ticket Volumn Over Time</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ticketsByDate} margin={{ top: 4, right: 8, left: -20, bottom: 60 }}>
              <defs>
                <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#378ADD" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 12 }}
                formatter={(v) => [v, "Tickets"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#378ADD"
                strokeWidth={2}
                fill="url(#ticketGrad)"
                dot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Module + SPOC */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Card>
            <CardTitle>Module breakdown</CardTitle>
            {moduleBreakdown.length > 0
              ? moduleBreakdown.map(({ mod, n }) => (
                  <Box key={mod} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "7px", borderBottom: "0.5px solid #F3F4F6", "&:last-child": { borderBottom: "none" } }}>
                    <ModTag m={mod} />
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{n} open</Typography>
                  </Box>
                ))
              : null
            }
          </Card>
          <Card>
            <CardTitle>Delivery SPOC</CardTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#E6F1FB", color: "#185FA5", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>NK</Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Nikita K.</Typography>
                <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Lead Delivery SPOC</Typography>
                <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>12 active tickets · Avg 3.1d resolve</Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Recent activity */}
      <Card sx={{ overflowX: "auto" }}>
        <CardTitle>Recent activity</CardTitle>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["Ticket", "Module", "Category", "Severity", "Status"].map(h => <TH key={h}>{h}</TH>)}
            </Box>
          </Box>
          <Box component="tbody">
            {recentTickets.map(t => (
              <Box component="tr" key={t.id} sx={{ "&:hover td": { backgroundColor: "#F9FAFB" }, "&:last-child td": { borderBottom: "none" } }}>
                <TD>
                  <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{t.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{t.id} · {t.date}</Typography>
                </TD>
                <TD><ModTag m={t.module} /></TD>
                <TD sx={{ color: "#6B7280" }}>{t.cat}</TD>
                <TD><SevTag sev={t.sev} /></TD>
                <TD><StatTag status={t.status} /></TD>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 2 — ALL TICKETS
// ═════════════════════════════════════════════════════════════════════════════
const AllTicketsPanel = () => {
  const [search,         setSearch]         = useState("");
  const [filterMod,      setFilterMod]      = useState("");
  const [filterSev,      setFilterSev]      = useState("");
  const [filterStat,     setFilterStat]     = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [allTickets,     setAllTickets]     = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllTickets({ module: filterMod || undefined, severity: filterSev || undefined, status: filterStat || undefined })
      .then(res => { if (active) { setAllTickets(toArray(res).map(normalizeTicket)); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filterMod, filterSev, filterStat]);

  const filtered = allTickets.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  );

  const selSx = { fontSize: 13, py: "6px", px: "10px", borderRadius: "6px", border: "0.5px solid #D1D5DB", backgroundColor: "#fff", color: "#111827", cursor: "pointer", outline: "none" };

  return (
    <Box>
      <TicketDetailDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: 1, minWidth: 160, backgroundColor: "#fff", border: "0.5px solid #D1D5DB", borderRadius: "6px", px: 1.2, py: "6px" }}>
          <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
          <Box component="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" sx={{ border: "none", outline: "none", fontSize: 13, color: "#111827", background: "transparent", width: "100%", fontFamily: "inherit" }} />
        </Box>
        <Box component="select" value={filterMod}  onChange={e => setFilterMod(e.target.value)}  sx={selSx}>
          <option value="">All modules</option>
          {["DPAI","TMS","DS","EDM"].map(m => <option key={m}>{m}</option>)}
        </Box>
        <Box component="select" value={filterSev}  onChange={e => setFilterSev(e.target.value)}  sx={selSx}>
          <option value="">All severities</option>
          {["S1","S2","S3"].map(s => <option key={s}>{s}</option>)}
        </Box>
        <Box component="select" value={filterStat} onChange={e => setFilterStat(e.target.value)} sx={selSx}>
          <option value="">All statuses</option>
          {["Open","In Progress","Closed"].map(s => <option key={s}>{s}</option>)}
        </Box>
      </Box>

      {loading ? <Spinner /> : (
      <Card sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["Id","Title","Date","Module","Env","Severity","Category","Status"].map(h => <TH key={h}>{h}</TH>)}
            </Box>
          </Box>
          <Box component="tbody">
            {filtered.map(t => (
              <Box component="tr" key={t.id} onClick={() => setSelectedTicket(t)} sx={{ cursor: "pointer", "&:hover td": { backgroundColor: "#F9FAFB" }, "&:last-child td": { borderBottom: "none" } }}>
                <TD sx={{ color: "#9CA3AF", fontSize: 12 }}>{t.id}</TD>
                <TD sx={{ minWidth: 200 }}>
                  <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{t.title}</Typography>
                </TD>
                <TD sx={{ color: "#9CA3AF", fontSize: 12, whiteSpace: "nowrap" }}>{t.date}</TD>
                <TD><ModTag m={t.module} /></TD>
                <TD sx={{ color: "#6B7280" }}>{t.env}</TD>
                <TD><SevTag sev={t.sev} /></TD>
                <TD sx={{ color: "#6B7280", fontSize: 12 }}>{t.cat}</TD>
                <TD><StatTag status={t.status} /></TD>
              </Box>
            ))}
          </Box>
        </Box>
        {filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: "#9CA3AF", fontSize: 14 }}>No tickets match your filters</Box>
        )}
      </Card>
      )}
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 3 — MY TICKETS
// ═════════════════════════════════════════════════════════════════════════════
const MyTicketsPanel = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterMod,  setFilterMod]  = useState("");
  const [filterSev,  setFilterSev]  = useState("");
  const [filterStat, setFilterStat] = useState("");
  const [allTickets, setAllTickets] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const lastUpdates = ["2h ago", "Yesterday", "3d ago", "1d ago", "5h ago", "4h ago", "6d ago", "3h ago", "2d ago", "1h ago"];

  const selSx = {
    fontSize: 13, border: "0.5px solid #D1D5DB", borderRadius: "6px",
    px: 1.2, py: "6px", backgroundColor: "#fff", color: "#374151",
    outline: "none", cursor: "pointer", fontFamily: "inherit",
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTicketsByClient(2)
      .then(res => toArray(res).map(normalizeTicket))
      .then({ module: filterMod || undefined, severity: filterSev || undefined, status: filterStat || undefined })
      .then(res => { if (active) { setAllTickets(toArray(res).map(normalizeTicket)); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filterMod, filterSev, filterStat]);

  const myTickets = allTickets
    .filter(t => t.status !== "Closed")
    .filter(t =>
      (!search    || t.title.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)) &&
      (!filterMod  || t.module === filterMod) &&
      (!filterSev  || t.sev    === filterSev) &&
      (!filterStat || t.status === filterStat)
    );

  return (
    <Box>
      <TicketDetailDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />

      {/* Filter bar */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: 1, minWidth: 160, backgroundColor: "#fff", border: "0.5px solid #D1D5DB", borderRadius: "6px", px: 1.2, py: "6px" }}>
          <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF", flexShrink: 0 }} />
          <Box component="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" sx={{ border: "none", outline: "none", fontSize: 13, color: "#111827", background: "transparent", width: "100%", fontFamily: "inherit" }} />
        </Box>
        <Box component="select" value={filterMod} onChange={e => setFilterMod(e.target.value)} sx={selSx}>
          <option value="">All modules</option>
          {["DPAI","DS","TMS"].map(m => <option key={m}>{m}</option>)}
        </Box>
        <Box component="select" value={filterSev} onChange={e => setFilterSev(e.target.value)} sx={selSx}>
          <option value="">All severities</option>
          {["S1","S2","S3"].map(s => <option key={s}>{s}</option>)}
        </Box>
        <Box component="select" value={filterStat} onChange={e => setFilterStat(e.target.value)} sx={selSx}>
          <option value="">All statuses</option>
          {["Open","In Progress"].map(s => <option key={s}>{s}</option>)}
        </Box>
      </Box>

      <Card sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["ID","Title","Module","Severity","Status","Last update"].map(h => <TH key={h}>{h}</TH>)}
            </Box>
          </Box>
          <Box component="tbody">
            {myTickets.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={6} sx={{ textAlign: "center", py: 5, color: "#9CA3AF", fontSize: 13 }}>
                  No tickets match your filters.
                </Box>
              </Box>
            ) : (
              myTickets.map((t, i) => (
                <Box component="tr" key={t.id} onClick={() => setSelectedTicket(t)} sx={{ cursor: "pointer", "&:hover td": { backgroundColor: "#F9FAFB" }, "&:last-child td": { borderBottom: "none" } }}>
                  <TD sx={{ color: "#9CA3AF", fontSize: 12 }}>{`${(t.id)}`}</TD>
                  <TD><Typography sx={{ fontWeight: 500, fontSize: 13 }}>{t.title}</Typography></TD>
                  <TD><ModTag m={t.module} /></TD>
                  <TD><SevTag sev={t.sev} /></TD>
                  <TD><StatTag status={t.status} /></TD>
                  <TD sx={{ color: "#9CA3AF", fontSize: 12 }}>{lastUpdates[i % lastUpdates.length]}</TD>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 4 — RAISE AN ISSUE
// ═════════════════════════════════════════════════════════════════════════════
export const RaiseIssuePanel = () => {
  const inputSx = (err) => ({
    width: "100%", p: "8px 10px", border: `0.5px solid ${err ? "#A32D2D" : "#D1D5DB"}`,
    borderRadius: "6px", fontSize: 13, fontFamily: "inherit", outline: "none",
    backgroundColor: "#fff", color: "#111827", boxSizing: "border-box",
    "&:focus": { borderColor: "#185FA5" },
  });
  const selectSx = (err) => ({ ...inputSx(err), appearance: "auto", cursor: "pointer", height: 36 });
  const labelSx  = { fontSize: 12, fontWeight: 500, color: "#374151", mb: 0.4, display: "block" };
  const errSx    = { fontSize: 11, color: "#A32D2D", mt: 0.3 };
  const btnBase  = { px: "16px", py: "8px", borderRadius: "6px", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" };

  // ── Dropdown data from API ─────────────────────────────────────────────────
  const [modules,      setModules]      = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [severities,   setSeverities]   = useState([]);
  const [projects,     setProjects]     = useState([]);
  const [milestones,   setMilestones]   = useState([]);
  const [clients,      setClients]      = useState([]);

  useEffect(() => {
    getAllModules().then(res => setModules(toArray(res))).catch(() => {});
    getAllEnvironments().then(res => setEnvironments(toArray(res))).catch(() => {});
    getAllCategories().then(res => setCategories(toArray(res))).catch(() => {});
    getAllSeverities().then(res => setSeverities(toArray(res))).catch(() => {});
    getAllProjects().then(res => setProjects(toArray(res))).catch(() => {});
    getMilestones().then(res => setMilestones(toArray(res))).catch(() => {});
    getAllClients().then(res => setClients(toArray(res))).catch(() => {});
  }, []);

  // ── Manual side state ──────────────────────────────────────────────────────
  const EMPTY_FORM = { title: "", description: "", module: "", environment: "", category: "", severity: "", project: "", milestone: "" };
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [manSubmitted, setManSubmitted] = useState(false);
  const [manSubmitting,setManSubmitting]= useState(false);
  const [errors,       setErrors]       = useState({});

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const handleManSubmit = async () => {
    const required = ["title", "description", "module", "environment", "category", "severity"];
    const newErr = {};
    required.forEach(k => { if (!form[k]) newErr[k] = "Required"; });
    if (Object.keys(newErr).length) { setErrors(newErr); return; }
    setManSubmitting(true);
    try {
      await createTicket({
        title: form.title,
        description: form.description,
        moduleId: form.module,
        environmentId: form.environment,
        categoryId: form.category,
        severityId: form.severity,
        projectId: form.project || null,
        milestoneId: form.milestone || null,
        clientId : form.client || null,
      });
      setForm(EMPTY_FORM); setErrors({});
      setManSubmitted(true);
      setTimeout(() => setManSubmitted(false), 3500);
    } catch (_) {
      // error already shown by toast via api interceptor
    } finally {
      setManSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: "100%", overflow: "hidden" }}>

      {/* ── LEFT: AI triage flow ── */}
      <Box sx={{ borderRight: "1px solid #E5E7EB", pr: 3, overflowY: "auto" }}>
        <TriageFlow />
      </Box>

      {/* ── RIGHT: Manual form ── */}
      <Box sx={{ pl: 3, overflowY: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827", mb: 0.3 }}>Manual ticket</Typography>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Fill in the details yourself and submit.</Typography>
        </Box>

        {manSubmitted && (
          <Box sx={{ backgroundColor: "#EAF3DE", border: "0.5px solid #3B6D11", borderRadius: "6px", p: "10px 14px", fontSize: 13, color: "#3B6D11", mb: 2 }}>
            Ticket submitted successfully!
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
          <Box>
            <Typography component="label" sx={labelSx}>Title <span style={{ color: "#A32D2D" }}>*</span></Typography>
            <Box component="input" value={form.title} onChange={e => setField("title", e.target.value)}
              placeholder="Short summary of the issue" sx={inputSx(errors.title)} />
            {errors.title && <Typography sx={errSx}>{errors.title}</Typography>}
          </Box>

          <Box>
            <Typography component="label" sx={labelSx}>Description <span style={{ color: "#A32D2D" }}>*</span></Typography>
            <Box component="textarea" value={form.description} onChange={e => setField("description", e.target.value)}
              placeholder="Describe the issue in detail…"
              sx={{ ...inputSx(errors.description), resize: "vertical", minHeight: 80, display: "block" }} />
            {errors.description && <Typography sx={errSx}>{errors.description}</Typography>}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={labelSx}>Module <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.module} onChange={e => setField("module", Number(e.target.value))} sx={selectSx(errors.module)}>
                <option value="">Select module</option>
                {modules.map(m => <option key={m.id} value={m.moduleId}>{m.name}</option>)}
              </Box>
              {errors.module && <Typography sx={errSx}>{errors.module}</Typography>}
            </Box>
            <Box>
              <Typography component="label" sx={labelSx}>Environment <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.environment} onChange={e => setField("environment", Number(e.target.value))} sx={selectSx(errors.environment)}>
                <option value="">Select environment</option>
                {environments.map(env => <option key={env.environmentId} value={env.environmentId}>{env.name}</option>)}
              </Box>
              {errors.environment && <Typography sx={errSx}>{errors.environment}</Typography>}
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={labelSx}>Category <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.category} onChange={e => setField("category", Number(e.target.value))} sx={selectSx(errors.category)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </Box>
              {errors.category && <Typography sx={errSx}>{errors.category}</Typography>}
            </Box>
            <Box>
              <Typography component="label" sx={labelSx}>Severity <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.severity} onChange={e => setField("severity", Number(e.target.value))} sx={selectSx(errors.severity)}>
                <option value="">Select severity</option>
                {severities.map(s => <option key={s.severityId} value={s.severityId}>{s.label}</option>)}
              </Box>
              {errors.severity && <Typography sx={errSx}>{errors.severity}</Typography>}
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={labelSx}>Project <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.project} onChange={e => { setField("project", Number(e.target.value)); console.log(Number(e.target.value)); }} sx={selectSx(errors.project)}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.title}</option>)}
              </Box>
              {errors.project && <Typography sx={errSx}>{errors.project}</Typography>}
            </Box>
            <Box>
              <Typography component="label" sx={labelSx}>Milestone</Typography>
              <Box component="select" value={form.milestone} onChange={e => setField("milestone", Number(e.target.value))} sx={selectSx(false)}>
                <option value="">Select milestone</option>
                {milestones.map(m => <option key={m.milestoneId} value={m.milestoneId}>{m.title}</option>)}
              </Box>
            </Box>
          </Box>
          <Box>
              <Typography component="label" sx={labelSx}>Client <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.client} onChange={e => setField("client", e.target.value)} sx={selectSx(errors.client)}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.clientId} value={c.clientId}>{c.name}</option>)}
              </Box>
              {errors.client && <Typography sx={errSx}>{errors.client}</Typography>}
            </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Box component="button" onClick={handleManSubmit} disabled={manSubmitting}
              sx={{ ...btnBase, backgroundColor: "#185FA5", color: "#fff", border: "none", opacity: manSubmitting ? 0.7 : 1, cursor: manSubmitting ? "not-allowed" : "pointer", "&:hover": { opacity: manSubmitting ? 0.7 : 0.9 } }}>
              {manSubmitting ? "Submitting…" : "Submit ticket"}
            </Box>
            <Box component="button" onClick={() => { setForm(EMPTY_FORM); setErrors({}); }} disabled={manSubmitting}
              sx={{ ...btnBase, backgroundColor: "#fff", color: "#111827", border: "0.5px solid #D1D5DB", "&:hover": { backgroundColor: "#F9FAFB" } }}>
              Reset
            </Box>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 5 — ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════
const STATIC_MONTHLY    = [{ month: "Sep", count: 3 }, { month: "Oct", count: 5 }, { month: "Nov", count: 4 }, { month: "Dec", count: 6 }, { month: "Jan", count: 3 }, { month: "Feb", count: 2 }, { month: "Mar", count: 1 }, { month: "Apr", count: 2 }];
const STATIC_CATEGORIES = [{ name: "Environment issue", value: 33 }, { name: "Bug / Code defect", value: 25 }, { name: "Config gap", value: 20 }, { name: "Other", value: 22 }];
const CAT_COLORS        = ["#378ADD", "#EF9F27", "#639922", "#D4537E"];
const STATIC_SEV_DIST   = [{ name: "S1", count: 8, fill: "#E24B4A" }, { name: "S2", count: 6, fill: "#EF9F27" }, { name: "S3", count: 3, fill: "#639922" }];

const AnalyticsPanel = () => {
  const { data: activityRaw } = useFetch(() => getTicketActivity());
  const { data: categoryRaw } = useFetch(() => getTicketsByCategory());

  const rawActivity = toArray(activityRaw);
  const rawCategory = toArray(categoryRaw);

  const monthlyData = rawActivity.length > 0
    ? rawActivity.map(d => ({
        month: d.date ? d.date.split("T")[0].slice(5).replace("-", " ") : d.label || d.name || "—",
        count: d.count ?? d.value ?? 0,
      }))
    : STATIC_MONTHLY;

  const totalCatVal  = rawCategory.reduce((s, d) => s + (d.count ?? d.value ?? 0), 0) || 1;
  const categoryData = rawCategory.length > 0
    ? rawCategory.map(d => ({ name: d.name || d.category || "—", value: Math.round(((d.count ?? d.value ?? 0) / totalCatVal) * 100) }))
    : STATIC_CATEGORIES;

  return (
  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
    {/* Tickets by month */}
    <Card>
      <CardTitle>Tickets by month</CardTitle>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={monthlyData} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 12 }} />
          <Bar dataKey="count" fill="#378ADD" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>

    {/* Category breakdown */}
    <Card>
      <CardTitle>Category breakdown</CardTitle>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ flexShrink: 0 }}>
          <PieChart width={90} height={90}>
            <Pie data={categoryData} cx={45} cy={45} innerRadius={26} outerRadius={42} paddingAngle={2} dataKey="value">
              {categoryData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
            </Pie>
          </PieChart>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
          {categoryData.map((c, i) => (
            <Box key={c.name} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
              <Typography sx={{ fontSize: 12 }}>{c.name} ({c.value}%)</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>

    {/* Severity distribution */}
    <Card>
      <CardTitle>Severity distribution</CardTitle>
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 120, mb: 1 }}>
        {STATIC_SEV_DIST.map(s => {
          const maxVal = Math.max(...STATIC_SEV_DIST.map(x => x.count));
          return (
            <Box key={s.name} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, height: "100%" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{s.count}</Typography>
              <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <Box sx={{ height: `${(s.count / maxVal) * 100}%`, backgroundColor: s.fill, borderRadius: "4px 4px 0 0" }} />
              </Box>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>{s.name}</Typography>
            </Box>
          );
        })}
      </Box>
    </Card>

    {/* Avg resolution time */}
    <Card>
      <CardTitle>Avg resolution time (days)</CardTitle>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={[{ month: "Oct", days: 1.8 }, { month: "Nov", days: 2.4 }, { month: "Dec", days: 3.4 }, { month: "Jan", days: 2.9 }]} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 12 }} />
          <Bar dataKey="days" fill="#378ADD" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 6 — PROJECTS
// ═════════════════════════════════════════════════════════════════════════════
const PROJECTS = [
  {
    name:       "DPAI – Phase 2 Rollout",
    meta:       "Client 2 · SPOC: Nikita K. · Due: 28 Feb 2026",
    statusLabel:"In progress",
    statusBg:   "#FAEEDA", statusColor: "#854F0B",
    pct:        68,
    info:       "68% complete · 3 milestones remaining",
    milestones: [
      { label: "Requirements sign-off",    state: "done",    note: "Completed"  },
      { label: "UAT environment setup",    state: "done",    note: "Completed"  },
      { label: "Integration testing",      state: "active",  note: "In progress"},
      { label: "User acceptance sign-off", state: "pending", note: "Pending"    },
      { label: "Prod go-live",             state: "pending", note: "Pending"    },
    ],
    summary: "✦ Auto-summary: Integration testing delayed due to 3 open environment tickets. Resolution target: 20 Apr 2026.",
  },
  {
    name:       "TMS – Configuration Upgrade",
    meta:       "Client 2 · SPOC: Nikita K. · Due: 15 May 2026",
    statusLabel:"Planned",
    statusBg:   "#E6F1FB", statusColor: "#185FA5",
    pct:        22,
    info:       "22% complete · Kickoff done",
    milestones: [
      { label: "Kickoff & scoping",     state: "done",    note: "Completed"  },
      { label: "Design & architecture", state: "active",  note: "In progress"},
      { label: "Build & configure",     state: "pending", note: "Pending"    },
    ],
    summary: null,
  },
];
const MS_DOT = { done: "#639922", active: "#EF9F27", pending: "#D1D5DB" };

const ProjectsPanel = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
    {PROJECTS.map(proj => (
      <Card key={proj.name}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.2 }}>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{proj.name}</Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.3 }}>{proj.meta}</Typography>
          </Box>
          <Tag label={proj.statusLabel} bg={proj.statusBg} color={proj.statusColor} />
        </Box>
        {/* Progress */}
        <Box sx={{ height: 5, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden", mb: 1 }}>
          <Box sx={{ height: "100%", width: `${proj.pct}%`, backgroundColor: "#378ADD", borderRadius: 4 }} />
        </Box>
        <Typography sx={{ fontSize: 11, color: "#9CA3AF", mb: 1.2 }}>{proj.info}</Typography>
        {/* Milestones */}
        {proj.milestones.map(ms => (
          <Box key={ms.label} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: MS_DOT[ms.state], flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, flex: 1 }}>{ms.label}</Typography>
            <Typography sx={{ fontSize: 11, color: ms.state === "active" ? "#854F0B" : "#9CA3AF" }}>{ms.note}</Typography>
          </Box>
        ))}
        {proj.summary && (
          <Box sx={{ mt: 1.2, p: "8px", backgroundColor: "#F9FAFB", borderRadius: "6px", fontSize: 12, color: "#6B7280" }}>
            {proj.summary}
          </Box>
        )}
      </Card>
    ))}
  </Box>
);


// ═════════════════════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═════════════════════════════════════════════════════════════════════════════
const TABS = [
  { key: "dashboard",  label: "Dashboard"      },
  // { key: "alltickets", label: "All tickets"     },
  { key: "mytickets",  label: "My tickets"      },
  { key: "raise",      label: "Raise a Ticket"  },
  { key: "analytics",  label: "Analytics"       },
  { key: "projects",   label: "Projects"        },
];

const PANELS = {
  dashboard:  <DashboardPanel />,
  // alltickets: <AllTicketsPanel />,
  mytickets:  <MyTicketsPanel />,
  raise:      <RaiseIssuePanel />,
  analytics:  <AnalyticsPanel />,
  projects:   <ProjectsPanel />,
};

const HomeLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F3F4F6", fontFamily: "inherit" }}>
      <ToastContainer />

      {/* ── Top bar ── */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: "20px", py: "14px", borderBottom: "0.5px solid #E5E7EB", backgroundColor: "#fff", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "6px", backgroundColor: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16, color: "#185FA5" }} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 500 }}>Relay</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#E6F1FB", color: "#185FA5", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", border: "0.5px solid #E5E7EB" }}>C2</Box>
          <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Client 1</Typography>
          <Box
            component="button"
            onClick={handleLogout}
            sx={{
              ml: "4px",
              display: "flex", alignItems: "center", gap: "5px",
              px: "10px", py: "5px",
              borderRadius: "6px",
              border: "0.5px solid #E5E7EB",
              backgroundColor: "#fff",
              color: "#6B7280",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              "&:hover": { backgroundColor: "#F9FAFB", color: "#A32D2D", borderColor: "#FECACA" },
              transition: "all .15s",
            }}
          >
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
      <Box sx={{ display: "flex", borderBottom: "0.5px solid #E5E7EB", backgroundColor: "#fff", px: "20px", overflowX: "auto", flexShrink: 0, "&::-webkit-scrollbar": { height: 2 } }}>
        {TABS.map(tab => (
          <Box
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            sx={{
              px: "14px", py: "10px", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
              color:       activeTab === tab.key ? "#185FA5" : "#6B7280",
              borderBottom: activeTab === tab.key ? "2px solid #185FA5" : "2px solid transparent",
              fontWeight:  activeTab === tab.key ? 500 : 400,
              transition:  "color .15s",
              "&:hover": { color: activeTab === tab.key ? "#185FA5" : "#111827" },
            }}
          >
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
