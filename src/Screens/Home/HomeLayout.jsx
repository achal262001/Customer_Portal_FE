import { useState, useRef } from "react";
import { Box, Typography, Dialog, DialogContent, IconButton, Divider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { TicketsData } from "../Ticket/constant";

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
  const s = raw.toLowerCase();
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

// ─── Normalize TicketsData ────────────────────────────────────────────────────
const STATUS_CYCLE = ["Open","In Progress","Open","Closed","Open","Open","In Progress","Closed","Open","In Progress","Open","Closed","In Progress","Open","Closed","Open","Open"];

const tickets = TicketsData.map((t, i) => ({
  id:     `TKT-${String(t.id).padStart(3, "0")}`,
  date:   t.Date,
  title:  t.Title,
  module: t.Module,
  env:    t.Environment,
  sev:    sevStyle(t.Status).label,
  cat:    t["Ticket Category"] || "—",
  status: STATUS_CYCLE[i % STATUS_CYCLE.length],
  issues: t.Issues,
  client: (t["Client "] || "").trim(),
  spoc:   t["Delivery SPOC"],
}));

// ─── Tickets by Date (from TicketsData) ──────────────────────────────────────
const shortDate = (d) => {
  const [, m, day] = d.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}`;
};

const ticketsByDate = (() => {
  const counts = {};
  TicketsData.forEach(t => { counts[t.Date] = (counts[t.Date] || 0) + 1; });
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: shortDate(date), count }));
})();

// ─── Analytics static data ────────────────────────────────────────────────────
const monthlyData = [
  { month: "Sep", count: 3 }, { month: "Oct", count: 5 },
  { month: "Nov", count: 4 }, { month: "Dec", count: 6 },
  { month: "Jan", count: 3 }, { month: "Feb", count: 2 },
  { month: "Mar", count: 1 }, { month: "Apr", count: 2 },
];
const categoryData = [
  { name: "Environment issue", value: 33 },
  { name: "Bug / Code defect", value: 25 },
  { name: "Config gap",        value: 20 },
  { name: "Other",             value: 22 },
];
const CAT_COLORS = ["#378ADD", "#EF9F27", "#639922", "#D4537E"];
const resolutionData = [
  { month: "Oct", days: 1.8 }, { month: "Nov", days: 2.4 },
  { month: "Dec", days: 3.4 }, { month: "Jan", days: 2.9 },
];
const sevDist = [
  { name: "S1", count: 8, fill: "#E24B4A" },
  { name: "S2", count: 6, fill: "#EF9F27" },
  { name: "S3", count: 3, fill: "#639922" },
];

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
  const metrics = [
    { label: "Open issues",      value: 12,     sub: "↑ 3 this week",          valueColor: "#185FA5" },
    { label: "SLA at risk",      value: 4,      sub: "Next breach in 2h",       valueColor: "#E24B4A" },
    { label: "Avg resolution",   value: "3.4d", sub: "Last 30 days",            valueColor: "#111827" },
    { label: "Closed this month",value: 9,      sub: "+18% vs prior month",     valueColor: "#639922" },
  ];
  const slaItems = [
    { title: "TKT-004 · Calendar Save Fails",  sev: "S1", pct: 87, risk: "87% breach risk – due in 2h",  barColor: "#E24B4A" },
    { title: "TKT-011 · Data sync timeout",    sev: "S2", pct: 61, risk: "61% breach risk – due in 6h",  barColor: "#EF9F27" },
    { title: "TKT-007 · Login redirect loop",  sev: "S2", pct: 44, risk: "44% breach risk – due in 14h", barColor: "#EF9F27" },
    { title: "TKT-015 · Report export fails",  sev: "S3", pct: 18, risk: "18% breach risk – due in 2d",  barColor: "#639922" },
  ];
  const recentTickets = tickets.slice(0, 3);

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
          <CardTitle>Number of Tickets vs Date</CardTitle>
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
            {[{ mod: "DPAI", n: 7 }, { mod: "TMS", n: 3 }, { mod: "DS", n: 2 }].map(({ mod, n }) => (
              <Box key={mod} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "7px", borderBottom: "0.5px solid #F3F4F6", "&:last-child": { borderBottom: "none" } }}>
                <ModTag m={mod} />
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{n} open</Typography>
              </Box>
            ))}
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

  const filtered = tickets.filter(t =>
    (!search     || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())) &&
    (!filterMod  || t.module  === filterMod)  &&
    (!filterSev  || t.sev     === filterSev)  &&
    (!filterStat || t.status  === filterStat)
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

      <Card sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["#","Title","Date","Module","Env","Severity","Category","Status"].map(h => <TH key={h}>{h}</TH>)}
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
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 3 — MY TICKETS
// ═════════════════════════════════════════════════════════════════════════════
const MyTicketsPanel = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const myTickets = tickets.filter(t => t.status !== "Closed").slice(0, 5);
  const lastUpdates = ["2h ago", "Yesterday", "3d ago", "1d ago", "5h ago"];

  return (
    <Box>
      <TicketDetailDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      <Card sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["#","Title","Module","Severity","Status","Last update"].map(h => <TH key={h}>{h}</TH>)}
            </Box>
          </Box>
          <Box component="tbody">
            {myTickets.map((t, i) => (
              <Box component="tr" key={t.id} onClick={() => setSelectedTicket(t)} sx={{ cursor: "pointer", "&:hover td": { backgroundColor: "#F9FAFB" }, "&:last-child td": { borderBottom: "none" } }}>
                <TD sx={{ color: "#9CA3AF", fontSize: 12 }}>{t.id}</TD>
                <TD>
                  <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{t.title}</Typography>
                </TD>
                <TD><ModTag m={t.module} /></TD>
                <TD><SevTag sev={t.sev} /></TD>
                <TD><StatTag status={t.status} /></TD>
                <TD sx={{ color: "#9CA3AF", fontSize: 12 }}>{lastUpdates[i] || "—"}</TD>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 4 — RAISE AN ISSUE
// ═════════════════════════════════════════════════════════════════════════════
const RaiseIssuePanel = () => {
  const [issueText,  setIssueText]  = useState("");
  const [showAI,     setShowAI]     = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setIssueText(val);
    clearTimeout(timerRef.current);
    if (val.trim().length > 20) {
      timerRef.current = setTimeout(() => setShowAI(true), 600);
    } else {
      setShowAI(false);
    }
  };

  const handleSubmit = () => {
    setIssueText("");
    setShowAI(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleClear = () => {
    clearTimeout(timerRef.current);
    setIssueText("");
    setShowAI(false);
  };

  const aiFields = [
    { name: "Module",      val: "DPAI" },
    { name: "Environment", val: "UAT" },
    { name: "Category",    val: "Environment issue" },
    { name: "Severity",    val: "Severity 2 (Moderate)" },
  ];
  const similar = [
    { title: "Calendar Save Fails with 400 Error",        meta: "TKT-001 · DPAI · Closed · Resolved in 2d" },
    { title: "Environment config missing after UAT reset", meta: "TKT-008 · DPAI · Closed · Resolved in 1d" },
  ];
  const btnBase = { px: "16px", py: "8px", borderRadius: "6px", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" };

  return (
    <Box sx={{ maxWidth: 640 }}>
      {submitted && (
        <Box sx={{ backgroundColor: "#EAF3DE", border: "0.5px solid #3B6D11", borderRadius: "6px", p: "10px 14px", fontSize: 13, color: "#3B6D11", mb: 2 }}>
          Ticket submitted successfully!
        </Box>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#6B7280", display: "block", mb: 0.8 }}>Describe your issue</Typography>
        <Typography sx={{ fontSize: 12, color: "#9CA3AF", mb: 1 }}>Type freely — AI will analyse and prefill the fields below.</Typography>
        <Box
          component="textarea"
          value={issueText}
          onChange={handleChange}
          placeholder="e.g. When I try to save a calendar entry in DPAI it returns a 400 error…"
          sx={{
            width: "100%", p: "10px", border: "0.5px solid #D1D5DB", borderRadius: "6px",
            fontSize: 14, fontFamily: "inherit", resize: "vertical", backgroundColor: "#fff",
            color: "#111827", minHeight: 90, outline: "none", display: "block",
            "&:focus": { borderColor: "#185FA5" },
          }}
        />
      </Box>

      {showAI && (
        <Box>
          {/* AI suggestion */}
          <Box sx={{ backgroundColor: "#EBF4FF", border: "0.5px solid #BFDBFE", borderRadius: "6px", p: "12px 14px", mb: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: "#185FA5", mb: 0.8 }}>✦ AI pre-fill suggestion</Typography>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Based on your description, we identified the following. Please confirm or edit before submitting.</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2, mt: 1.2 }}>
              {aiFields.map(f => (
                <Box key={f.name} sx={{ backgroundColor: "#fff", borderRadius: "6px", p: "8px 10px", border: "0.5px solid #E5E7EB" }}>
                  <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 0.3 }}>{f.name}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{f.val}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Similar tickets */}
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 12, color: "#6B7280", mb: 1 }}>Similar tickets — may already be resolved</Typography>
            {similar.map(s => (
              <Box key={s.title} sx={{ p: "8px 10px", border: "0.5px solid #E5E7EB", borderRadius: "6px", mb: 0.8, cursor: "pointer", "&:hover": { backgroundColor: "#F9FAFB" } }}>
                <Typography sx={{ fontWeight: 500, fontSize: 13 }}>{s.title}</Typography>
                <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 0.3 }}>{s.meta}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Box component="button" onClick={handleSubmit} sx={{ ...btnBase, backgroundColor: "#185FA5", color: "#fff", border: "none", "&:hover": { opacity: 0.9 } }}>
              Confirm &amp; submit ticket
            </Box>
            <Box component="button" onClick={handleClear} sx={{ ...btnBase, backgroundColor: "#fff", color: "#111827", border: "0.5px solid #D1D5DB", "&:hover": { backgroundColor: "#F9FAFB" } }}>
              Clear
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// PANEL 5 — ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════
const AnalyticsPanel = () => (
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
              <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: CAT_COLORS[i], flexShrink: 0 }} />
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
        {sevDist.map(s => {
          const maxVal = Math.max(...sevDist.map(x => x.count));
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
        <BarChart data={resolutionData} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
  { key: "alltickets", label: "All tickets"     },
  { key: "mytickets",  label: "My tickets"      },
  { key: "raise",      label: "Raise an issue"  },
  { key: "analytics",  label: "Analytics"       },
  { key: "projects",   label: "Projects"        },
];

const PANELS = {
  dashboard:  <DashboardPanel />,
  alltickets: <AllTicketsPanel />,
  mytickets:  <MyTicketsPanel />,
  raise:      <RaiseIssuePanel />,
  analytics:  <AnalyticsPanel />,
  projects:   <ProjectsPanel />,
};

const HomeLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F3F4F6", fontFamily: "inherit" }}>

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
          <Typography sx={{ fontSize: 13, color: "#6B7280" }}>Client 2</Typography>
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
