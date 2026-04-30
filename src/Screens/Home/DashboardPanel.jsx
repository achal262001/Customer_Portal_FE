import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboardStats, getTicketActivity, getTicketsByModule, getAllTickets } from "../../Supportive Files/api";
import { useFetch, toArray, normalizeTicket, Card, CardTitle, TH, TD, ModTag, SevTag, StatTag } from "./shared";

const DashboardPanel = () => {
  const theme = useTheme();
  const { data: statsRaw } = useFetch(() => getDashboardStats());
  const { data: activityRaw } = useFetch(() => getTicketActivity());
  const { data: modulesRaw } = useFetch(() => getTicketsByModule());
  const { data: ticketsRaw } = useFetch(() => getAllTickets());

  const stats = statsRaw || {};
  const ticketsByDate = toArray(activityRaw).map(d => ({
    date: d.date ? d.date.split("T")[0].slice(5).replace("-", " ") : d.label || d.name || "—",
    count: d.count ?? d.value ?? 0,
  }));
  const moduleBreakdown = toArray(modulesRaw).map(m => ({ mod: m.label || m.module, n: m.count ?? m.value ?? 0 }));
  const recentTickets = toArray(ticketsRaw).slice(0, 3).map(normalizeTicket);

  const metrics = [
    { label: "Open issues", value: stats.openTickets ?? stats.totalOpen ?? "—", sub: "Awaiting action", valueColor: "#185FA5" },
    { label: "Avg resolution", value: stats.avgResolution ?? stats.avgResolutionTime ?? "—", sub: "Last 30 days", valueColor: theme.palette.text.primary },
    { label: "Closed this month", value: stats.closedThisMonth ?? "—", sub: "vs prior month", valueColor: "#639922" },
  ];

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 1.2, mb: 2.5 }}>
        {metrics.map(m => (
          <Box key={m.label} sx={{ backgroundColor: theme.palette.action.hover, borderRadius: "8px", p: "14px", border: `0.5px solid ${theme.palette.divider}` }}>
            <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, mb: 0.8 }}>{m.label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 500, color: m.valueColor }}>{m.value}</Typography>
            <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, mt: 0.4 }}>{m.sub}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 1.5, mb: 2.5 }}>
        <Card>
          <CardTitle>Ticket Volume Over Time</CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ticketsByDate} margin={{ top: 4, right: 8, left: -20, bottom: 60 }}>
              <defs>
                <linearGradient id="ticketGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#378ADD" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: theme.palette.text.disabled }} axisLine={false} tickLine={false} angle={-45} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: theme.palette.text.disabled }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 12, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} formatter={(v) => [v, "Tickets"]} />
              <Area type="monotone" dataKey="count" stroke="#378ADD" strokeWidth={2} fill="url(#ticketGrad)" dot={{ r: 4, fill: "#378ADD", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Card>
            <CardTitle>Module breakdown</CardTitle>
            {moduleBreakdown.map(({ mod, n }) => (
              <Box key={mod} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: "7px", borderBottom: `0.5px solid ${theme.palette.divider}`, "&:last-child": { borderBottom: "none" } }}>
                <ModTag m={mod} />
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: theme.palette.text.primary }}>{n} open</Typography>
              </Box>
            ))}
          </Card>
          <Card>
            <CardTitle>Delivery SPOC</CardTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#E6F1FB", color: "#185FA5", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>NK</Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: theme.palette.text.primary }}>Nikita K.</Typography>
                <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary }}>Lead Delivery SPOC</Typography>
                <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled, mt: 0.3 }}>12 active tickets · Avg 3.1d resolve</Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

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
              <Box component="tr" key={t.id} sx={{ "&:hover td": { backgroundColor: theme.palette.action.hover }, "&:last-child td": { borderBottom: "none" } }}>
                <TD>
                  <Typography sx={{ fontWeight: 500, fontSize: 13, color: theme.palette.text.primary }}>{t.title}</Typography>
                  <Typography sx={{ fontSize: 11, color: theme.palette.text.disabled }}>{t.id} · {t.date}</Typography>
                </TD>
                <TD><ModTag m={t.module} /></TD>
                <TD sx={{ color: theme.palette.text.secondary }}>{t.cat}</TD>
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

export default DashboardPanel;
