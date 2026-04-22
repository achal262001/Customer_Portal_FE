import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Drawer,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CreateTicket from "./CreateTicket";
import { getAllTickets, createTicket } from "../../Supportive Files/api";
import { useNavigate } from "react-router-dom";

const getSeverityColors = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("severity 1") || s.includes("high"))
    return { bg: "#fdecea", text: "#b71c1c" };
  if (s.includes("severity 2") || s.includes("moderate"))
    return { bg: "#fef3ea", text: "#c87941" };
  if (s.includes("severity 3") || s.includes("minor"))
    return { bg: "#fef9e7", text: "#e67e22" };
  return { bg: "#f5f5f5", text: "#757575" };
};

const getDotColor = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("severity 1") || s.includes("high")) return "#b71c1c";
  if (s.includes("severity 2") || s.includes("moderate")) return "#c87941";
  if (s.includes("severity 3") || s.includes("minor")) return "#e67e22";
  return "#9e9e9e";
};

const DetailRow = ({ label, children }) => (
  <Box sx={{ display: "flex", gap: 2, py: 1.5, alignItems: "flex-start" }}>
    <Typography
      variant="body2"
      sx={{ color: "#9ca3af", minWidth: 150, fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

const GRID_COLS = "48px 60px 110px 1fr 100px 80px 110px 180px 40px";

const Ticket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    getAllTickets()
      .then(setTickets)
      .catch((err) => setError(err?.message ?? "Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  const handleNewTicket = async (ticketData) => {
    try {
      const created = await createTicket(ticketData);
      setTickets((prev) => [created, ...prev]);
    } catch {
      // silently ignore; drawer already closed
    }
  };

  const filtered = tickets.filter(
    (t) =>
      (t.Title || "").toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).includes(search),
  );

  return (
    <Box
      sx={{
        minHeight: "100%",
        overflowY: "auto",
        p: 4,
      }}
    >
      {/* ── Page Header ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ color: "#1a1a1a" }}>
            Tickets
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.3 }}>
            {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} total
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            borderRadius: 2.5,
            px: 3,
            py: 1,
            backgroundColor: "#4a6741",
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#3a5232", boxShadow: "none" },
          }}
        >
          New Ticket
        </Button>
      </Box>

      {/* ── Table Card ── */}
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,0.93)",
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          backdropFilter: "blur(6px)",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 2,
              px: 1.5,
              py: 0.7,
              width: 260,
            }}
          >
            <SearchIcon sx={{ fontSize: 17, color: "#9ca3af" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 13,
                color: "#374151",
                width: "100%",
              }}
            />
          </Box>

          <IconButton size="small" sx={{ color: "#9ca3af" }}>
            <FileDownloadOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Table Head */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: GRID_COLS,
            px: 3,
            py: 1.2,
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {[
            "",
            "ID",
            "Date",
            "Title",
            "Client",
            "Module",
            "Environment",
            "Status",
            "",
          ].map((h, i) => (
            <Typography
              key={i}
              variant="caption"
              fontWeight={700}
              sx={{
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: "0.7rem",
              }}
            >
              {h}
            </Typography>
          ))}
        </Box>

        {/* Table Rows */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={36} sx={{ color: "#4a6741" }} />
          </Box>
        ) : error ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <Typography variant="body2" sx={{ color: "#ef4444" }}>
              {error}
            </Typography>
          </Box>
        ) : filtered.length > 0 ? (
          filtered.map((ticket, idx) => {
            const sevColor = getSeverityColors(ticket.Status);
            const dot = getDotColor(ticket.Status);

            return (
              <Box
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                sx={{
                  display: "grid",
                  gridTemplateColumns: GRID_COLS,
                  px: 3,
                  py: 1.6,
                  alignItems: "center",
                  borderBottom:
                    idx < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  "&:hover": { backgroundColor: "#fafafa" },
                }}
              >
                {/* Dot indicator */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: dot,
                    }}
                  />
                </Box>

                {/* ID */}
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#374151", fontSize: 13 }}
                >
                  #{ticket.id}
                </Typography>

                {/* Date */}
                <Typography variant="body2" sx={{ color: "#9ca3af", fontSize: 12 }}>
                  {ticket.Date}
                </Typography>

                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#111827",
                    fontWeight: 500,
                    fontSize: 13,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    pr: 2,
                  }}
                >
                  {ticket.Title}
                </Typography>

                {/* Client */}
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", fontSize: 13 }}
                >
                  {ticket["Client "]?.trim() || "—"}
                </Typography>

                {/* Module */}
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", fontSize: 13 }}
                >
                  {ticket.Module || "—"}
                </Typography>

                {/* Environment */}
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", fontSize: 13 }}
                >
                  {ticket.Environment || "—"}
                </Typography>

                {/* Status / Severity */}
                <Box>
                  <Chip
                    label={ticket.Status?.trim() || "—"}
                    size="small"
                    sx={{
                      backgroundColor: sevColor.bg,
                      color: sevColor.text,
                      fontWeight: 600,
                      fontSize: "0.68rem",
                      height: 22,
                      borderRadius: 1.5,
                      maxWidth: 170,
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      },
                    }}
                  />
                </Box>

                {/* Arrow */}
                <ChevronRightIcon sx={{ fontSize: 18, color: "#d1d5db" }} />
              </Box>
            );
          })
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: 10,
            }}
          >
            <ConfirmationNumberOutlinedIcon
              sx={{ fontSize: 56, color: "#d1d5db", mb: 1.5 }}
            />
            <Typography variant="body1" sx={{ color: "#9ca3af" }}>
              {search ? "No tickets match your search" : "No tickets yet"}
            </Typography>
            {!search && (
              <Typography variant="body2" sx={{ color: "#d1d5db", mt: 0.5 }}>
                Click "New Ticket" to get started
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* ── Ticket Detail Dialog (80% width × height) ── */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        PaperProps={{
          sx: {
            width: "80vw",
            maxWidth: "80vw",
            height: "80vh",
            maxHeight: "80vh",
            borderRadius: 3,
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {selectedTicket && (
          <DialogContent
            sx={{
              p: 0,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            {/* Dialog Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                px: 4,
                pt: 3,
                pb: 2,
                borderBottom: "1px solid #f0f0f0",
                flexShrink: 0,
              }}
            >
              <Box sx={{ flex: 1, pr: 2 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ color: "#9ca3af", letterSpacing: 0.6 }}
                >
                  TICKET #{selectedTicket.id}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "#111827", mt: 0.3, lineHeight: 1.4 }}
                >
                  {selectedTicket.Title}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setSelectedTicket(null)}
                sx={{ mt: -0.5, flexShrink: 0 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Dialog Body — scrollable */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 4,
                py: 3,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 0,
                alignContent: "start",
              }}
            >
              {/* Left column */}
              <Box sx={{ pr: 4, borderRight: "1px solid #f0f0f0" }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Issue Details
                </Typography>

                <DetailRow label="Status">
                  <Chip
                    label={selectedTicket.Status?.trim() || "—"}
                    size="small"
                    sx={{
                      backgroundColor: getSeverityColors(selectedTicket.Status).bg,
                      color: getSeverityColors(selectedTicket.Status).text,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      borderRadius: 1.5,
                    }}
                  />
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Ticket Category">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket["Ticket Category"] || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Module">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket.Module || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Environment">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket.Environment || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Date">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket.Date || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Client">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket["Client "]?.trim() || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Delivery SPOC">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket["Delivery SPOC"] || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Conversation">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate(`/conversation/${selectedTicket.id}`)
                    }
                    sx={{
                      textTransform: "none",
                      borderColor: "#4a6741",
                      color: "#4a6741",
                      "&:hover": {
                        borderColor: "#3a5232",
                        backgroundColor: "#f0f4ef",
                      },
                    }}
                  >
                    View Conversation
                  </Button>
                </DetailRow>
              </Box>

              {/* Right column — Issues / Description */}
              <Box sx={{ pl: 4 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    display: "block",
                    mb: 1,
                  }}
                >
                  Issue Description
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#374151",
                    lineHeight: 1.9,
                    whiteSpace: "pre-wrap",
                    mt: 1,
                  }}
                >
                  {selectedTicket.Issues || "No description provided."}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Create Ticket Drawer ── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: "12px 0 0 12px" } }}
      >
        <CreateTicket
          onSubmit={handleNewTicket}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>
    </Box>
  );
};

export default Ticket;
