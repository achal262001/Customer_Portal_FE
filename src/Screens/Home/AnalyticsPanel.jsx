import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getTicketActivity, getTicketsByCategory } from "../../Supportive Files/api";
import { useFetch, toArray, Card, CardTitle } from "./shared";

const STATIC_MONTHLY = [
  { month: "Sep", count: 3 }, { month: "Oct", count: 5 }, { month: "Nov", count: 4 },
  { month: "Dec", count: 6 }, { month: "Jan", count: 3 }, { month: "Feb", count: 2 },
  { month: "Mar", count: 1 }, { month: "Apr", count: 2 },
];
const STATIC_CATEGORIES = [
  { name: "Environment issue", value: 33 }, { name: "Bug / Code defect", value: 25 },
  { name: "Config gap", value: 20 }, { name: "Other", value: 22 },
];
const CAT_COLORS = ["#378ADD", "#EF9F27", "#639922", "#D4537E"];
const STATIC_SEV_DIST = [
  { name: "S1", count: 8, fill: "#E24B4A" },
  { name: "S2", count: 6, fill: "#EF9F27" },
  { name: "S3", count: 3, fill: "#639922" },
];

const AnalyticsPanel = () => {
  const theme = useTheme();
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

  const totalCatVal = rawCategory.reduce((s, d) => s + (d.count ?? d.value ?? 0), 0) || 1;
  const categoryData = rawCategory.length > 0
    ? rawCategory.map(d => ({ name: d.name || d.category || "—", value: Math.round(((d.count ?? d.value ?? 0) / totalCatVal) * 100) }))
    : STATIC_CATEGORIES;

  const tooltipStyle = { borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,.1)", fontSize: 12, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
      <Card>
        <CardTitle>Tickets by month</CardTitle>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={monthlyData} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme.palette.text.disabled }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: theme.palette.text.disabled }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="count" fill="#378ADD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

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
                <Typography sx={{ fontSize: 12, color: theme.palette.text.primary }}>{c.name} ({c.value}%)</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Card>
        <CardTitle>Severity distribution</CardTitle>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, height: 120, mb: 1 }}>
          {STATIC_SEV_DIST.map(s => {
            const maxVal = Math.max(...STATIC_SEV_DIST.map(x => x.count));
            return (
              <Box key={s.name} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, height: "100%" }}>
                <Typography sx={{ fontSize: 11, fontWeight: 500, color: theme.palette.text.primary }}>{s.count}</Typography>
                <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <Box sx={{ height: `${(s.count / maxVal) * 100}%`, backgroundColor: s.fill, borderRadius: "4px 4px 0 0" }} />
                </Box>
                <Typography sx={{ fontSize: 11, color: theme.palette.text.secondary }}>{s.name}</Typography>
              </Box>
            );
          })}
        </Box>
      </Card>

      <Card>
        <CardTitle>Avg resolution time (days)</CardTitle>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={[{ month: "Oct", days: 1.8 }, { month: "Nov", days: 2.4 }, { month: "Dec", days: 3.4 }, { month: "Jan", days: 2.9 }]} barSize={22} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: theme.palette.text.disabled }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: theme.palette.text.disabled }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="days" fill="#378ADD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};

export default AnalyticsPanel;
