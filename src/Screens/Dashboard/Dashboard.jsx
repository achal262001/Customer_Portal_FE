import { useState, useEffect } from "react";
import { DatePicker, Select } from "@3sc/common-component";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { clientOptions, statusOptions } from "./constant";
import {
  getDashboardSummary,
  getTicketsByClient,
  getTicketsByModule,
  getTicketActivity,
  getTicketsByCategory,
} from "../../Supportive Files/api";

const PIE_COLORS = ["#4a6741", "#c87941", "#6b9e61", "#e8a060", "#8fbb85"];

const STAT_CONFIG = [
  {
    key: "totalTickets",
    label: "Total Tickets",
    sub: "All time",
    icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 28 }} />,
    bg: "#eef3ec",
    iconColor: "#4a6741",
  },
  {
    key: "openTickets",
    label: "Open",
    sub: "Awaiting action",
    icon: <ErrorOutlineIcon sx={{ fontSize: 28 }} />,
    bg: "#fef3ea",
    iconColor: "#c87941",
  },
  {
    key: "inProgressTickets",
    label: "In Progress",
    sub: "Being worked on",
    icon: <HourglassEmptyIcon sx={{ fontSize: 28 }} />,
    bg: "#f0edf8",
    iconColor: "#7c5cbf",
  },
  {
    key: "resolvedTickets",
    label: "Resolved",
    sub: "Closed successfully",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />,
    bg: "#eef3ec",
    iconColor: "#4a6741",
  },
];

const chartCardSx = {
  borderRadius: 3,
  backgroundColor: "rgba(255,255,255,0.92)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  backdropFilter: "blur(6px)",
};

const toChartData = (data, valueKey = "count") =>
  (data ?? []).map((d) => ({ name: d.label, [valueKey]: d.value }));

const Dashboard = () => {
  const [filters, setFilters] = useState({ clientId: null, status: null });
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState({
    byModule: [],
    activity: [],
    byCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = {
      clientId: filters.clientId || undefined,
      status: filters.status || undefined,
    };

    Promise.all([
      getDashboardSummary(params),
      getTicketsByModule(params),
      getTicketActivity(params),
      getTicketsByCategory(params),
    ])
      .then(([sum, byModule, activity, byCategory]) => {
        setSummary(sum);
        setCharts({
          byModule: toChartData(byModule, "value"),
          activity: toChartData(activity, "count"),
          byCategory: toChartData(byCategory, "count"),
        });
      })
      .catch((err) => setError(err?.message ?? "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, [filters]);

  const statCards = STAT_CONFIG.map((cfg) => ({
    ...cfg,
    value: summary?.[cfg.key] ?? "—",
  }));

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        pt: 3,
        pb: 2,
        px: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700} sx={{ color: "#1a1a1a", mb: 3 }}>
        Customer Dashboard
      </Typography>

      {/* ── Filter Bar ── */}
      <Card sx={{ ...chartCardSx, mb: 3 }}>
        <CardContent sx={{ py: "14px !important" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 2,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <DatePicker
                mode="range"
                formatString="yyyy-MM-dd"
                value={new Date()}
                onChange={() => {}}
                label="Select Date Range"
                style={{ width: 220 }}
              />
              <Select
                value={filters.clientId}
                options={clientOptions}
                onChange={(item) =>
                  setFilters((f) => ({ ...f, clientId: item?.value ?? null }))
                }
                showSearch
                label="Select Client"
                style={{ width: 200 }}
              />
            </Box>
            <Box sx={{ ml: "auto" }}>
              <Select
                value={filters.status}
                options={statusOptions}
                onChange={(item) =>
                  setFilters((f) => ({ ...f, status: item?.value ?? null }))
                }
                showSearch
                label="Select Status"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress sx={{ color: "#4a6741" }} />
        </Box>
      ) : error ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <Typography variant="body2" sx={{ color: "#ef4444" }}>
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <Box sx={{ display: "flex", gap: 2, mb: 3, overflowX: "auto", py: 1, justifyContent: "center" }}>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              {statCards.map((card) => (
                <Grid item xs={12} sm={6} md={3} key={card.label}>
                  <Card sx={{ ...chartCardSx, height: 110 }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: "20px 20px !important",
                      }}
                    >
                      <Box
                        sx={{
                          backgroundColor: card.bg,
                          borderRadius: 2.5,
                          p: 1.2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: card.iconColor,
                          flexShrink: 0,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          sx={{ color: "#1a1a1a", lineHeight: 1 }}
                        >
                          {card.value}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: "#3d3d3d", mt: 0.3 }}
                        >
                          {card.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                          {card.sub}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* ── Charts ── */}
          <Box sx={{ flex: 1, display: "flex", gap: 2, overflow: "hidden" }}>
            {/* Pie – By Module */}
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <Card sx={{ ...chartCardSx, flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: "20px 16px 8px !important", flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1a1a1a", mb: 0.2 }}>
                    By Module / Team
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                    Team assignment
                  </Typography>
                  <Box sx={{ mt: 2, flex: 1, minHeight: 250, display: "flex", alignItems: "center" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={charts.byModule}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {charts.byModule.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Area – Ticket Activity */}
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <Card sx={{ ...chartCardSx, flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: "20px 16px 8px !important", flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1a1a1a", mb: 0.2 }}>
                    Ticket Activity
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                    Over time
                  </Typography>
                  <Box sx={{ mt: 2, flex: 1, minHeight: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={charts.activity}
                        margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4a6741" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#4a6741" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#4a6741"
                          strokeWidth={2}
                          fill="url(#ticketGradient)"
                          dot={{ r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Bar – By Category */}
            <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <Card sx={{ ...chartCardSx, flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ p: "20px 16px 8px !important", flex: 1, display: "flex", flexDirection: "column" }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1a1a1a", mb: 0.2 }}>
                    By Category
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                    Ticket categories
                  </Typography>
                  <Box sx={{ mt: 2, flex: 1, minHeight: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={charts.byCategory} layout="vertical" barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip />
                        <Bar dataKey="count" fill="#c87941" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
