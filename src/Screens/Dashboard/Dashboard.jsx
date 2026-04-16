import { useState } from "react";
import { DatePicker, Select } from "@3sc/common-component";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { clientOptions, statusOptions } from "./constant";

// ── Chart data ──────────────────────────────────────────────────────────────
const ticketsByClient = [
  { name: "Jockey", count: 24 },
  { name: "TKF", count: 18 },
  { name: "RedBull", count: 15 },
  { name: "BSV", count: 12 },
  { name: "Orient", count: 10 },
  { name: "JFL", count: 8 },
  { name: "Modenik", count: 6 },
];

const ticketsByModule = [
  { name: "Frontend", value: 35 },
  { name: "Backend", value: 28 },
  { name: "DevOps", value: 15 },
  { name: "QA Team", value: 22 },
  { name: "Database", value: 10 },
];

const ticketsOverTime = [
  { date: "Apr 9", count: 12 },
  { date: "Apr 10", count: 18 },
  { date: "Apr 11", count: 14 },
  { date: "Apr 12", count: 26 },
  { date: "Apr 13", count: 19 },
  { date: "Apr 14", count: 31 },
  { date: "Apr 15", count: 24 },
];

const ticketsByCategory = [
  { name: "Technical", count: 45 },
  { name: "Billing", count: 23 },
  { name: "Feature", count: 31 },
  { name: "General", count: 17 },
  { name: "Bug", count: 12 },
];

const PIE_COLORS = ["#4a6741", "#c87941", "#6b9e61", "#e8a060", "#8fbb85"];

const statCards = [
  {
    label: "Total Tickets",
    value: 128,
    sub: "All time",
    icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 28 }} />,
    bg: "#eef3ec",
    iconColor: "#4a6741",
    valueColor: "#1a1a1a",
  },
  {
    label: "Open",
    value: 45,
    sub: "Awaiting action",
    icon: <ErrorOutlineIcon sx={{ fontSize: 28 }} />,
    bg: "#fef3ea",
    iconColor: "#c87941",
    valueColor: "#1a1a1a",
  },
  {
    label: "In Progress",
    value: 32,
    sub: "Being worked on",
    icon: <HourglassEmptyIcon sx={{ fontSize: 28 }} />,
    bg: "#f0edf8",
    iconColor: "#7c5cbf",
    valueColor: "#1a1a1a",
  },
  {
    label: "Resolved",
    value: 51,
    sub: "Closed successfully",
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />,
    bg: "#eef3ec",
    iconColor: "#4a6741",
    valueColor: "#1a1a1a",
  },
];

// ── Shared card style ────────────────────────────────────────────────────────
const chartCardSx = {
  borderRadius: 3,
  backgroundColor: "rgba(255,255,255,0.92)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  backdropFilter: "blur(6px)",
};

const Dashboard = () => {
  const [status, setStatus] = useState("");
  const [client, setClient] = useState("");

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/BaseTheme.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        pt: 3,
        pb: 2,
        px: 2,
      }}
    >
      {/* ── Page title ── */}
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ color: "#1a1a1a", mb: 3 }}
      >
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
            {/* Mandatory — left */}
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
                value={client}
                options={clientOptions}
                onChange={(value) => setClient(value)}
                showSearch
                label="Select Client"
                style={{ width: 200 }}
              />
            </Box>
            {/* Optional — right */}
            <Box sx={{ ml: "auto" }}>
              <Select
                value={status}
                options={statusOptions}
                onChange={(value) => setStatus(value)}
                showSearch
                label="Select Status"
                // style={{ width: 200 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Stat Cards ── */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          overflowX: "auto",
          py: 1,
          justifyContent: "center",
        }}
      >
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
                      sx={{ color: card.valueColor, lineHeight: 1 }}
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

      <Box
        sx={{
          flex: 1,
          display: "flex",
          gap: 2,
          overflow: "hidden",
        }}
      >
        {/* 1. Bar – Tickets by Client */}
        {/* <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Card
            sx={{
              ...chartCardSx,
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: "20px 16px 8px !important",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "#1a1a1a", mb: 0.2 }}
              >
                Tickets by Client
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Per client
              </Typography>

              <Box sx={{ mt: 2, flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ticketsByClient}
                    barSize={16}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="#4a6741" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box> */}

        {/* 2. Pie – Tickets by Module */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Card
            sx={{
              ...chartCardSx,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: "20px 16px 8px !important",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "#1a1a1a", mb: 0.2 }}
              >
                By Module / Team
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Team assignment
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  flex: 1,
                  minHeight: 250,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketsByModule}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {ticketsByModule.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
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

        {/* 3. Area – Ticket Activity */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Card
            sx={{
              ...chartCardSx,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: "20px 16px 8px !important",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "#1a1a1a", mb: 0.2 }}
              >
                Ticket Activity
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Over time
              </Typography>

              <Box sx={{ mt: 2, flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={ticketsOverTime}
                    margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="ticketGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4a6741"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4a6741"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
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

        {/* 4. Bar – Tickets by Category */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Card
            sx={{
              ...chartCardSx,
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: "20px 16px 8px !important",
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "#1a1a1a", mb: 0.2 }}
              >
                By Category
              </Typography>
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Ticket categories
              </Typography>

              <Box sx={{ mt: 2, flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ticketsByCategory}
                    layout="vertical"
                    barSize={14}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
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
    </Box>
  );
};

export default Dashboard;
