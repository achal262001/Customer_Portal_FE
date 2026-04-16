import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CreateTicket from "./CreateTicket";
import { categoryOptions, mockTickets } from "./constant";
import { useNavigate } from "react-router-dom";

const priorityColors = {
  low: { bg: "#eef3ec", text: "#4a6741" },
  medium: { bg: "#fef3ea", text: "#c87941" },
  high: { bg: "#fdecea", text: "#b71c1c" },
  critical: { bg: "#f3e8f8", text: "#6a1b9a" },
};

const statusColors = {
  open: { bg: "#eef3ec", text: "#4a6741" },
  in_progress: { bg: "#fef3ea", text: "#c87941" },
  resolved: { bg: "#e8f5e9", text: "#2e7d32" },
  closed: { bg: "#f5f5f5", text: "#757575" },
};

const dotColors = {
  open: "#4a6741",
  in_progress: "#c87941",
  resolved: "#2e7d32",
  closed: "#9e9e9e",
};

const DetailRow = ({ label, children }) => (
  <Box sx={{ display: "flex", gap: 2, py: 1.5, alignItems: "flex-start" }}>
    <Typography
      variant="body2"
      sx={{ color: "#9ca3af", minWidth: 110, fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);

const Ticket = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const handleNewTicket = (ticket) => {
    console.log("New ticket created:", ticket);
    setTickets((prev) => {
      const nextNum = prev.length + 1;
      const newId = `TKT-${String(nextNum).padStart(3, "0")}`;
      console.log("Assigned ID:", {
        newId,
        ticket,
        nextNum,
        newTicket: { ...ticket, id: newId, attachments: [] },
      });

      return [...prev, { ...ticket, id: newId, attachments: [] }];
    });
  };

  const filtered = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url('/BaseTheme.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
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
          {/* Search */}
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
            gridTemplateColumns: "56px 100px 1fr 130px 110px 110px 120px 40px",
            px: 3,
            py: 1.2,
            backgroundColor: "#f9fafb",
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          {[
            "",
            "ID",
            "Title",
            "Category",
            "Priority",
            "Status",
            "Created",
            "",
          ].map((h) => (
            <Typography
              key={h}
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
        {filtered.length > 0 ? (
          filtered.map((ticket, idx) => {
            const pri = priorityColors[ticket.priority] || priorityColors.low;
            const sta = statusColors[ticket.status] || statusColors.closed;
            const dot = dotColors[ticket.status] || "#9e9e9e";

            return (
              <Box
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "56px 100px 1fr 130px 110px 110px 120px 40px",
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
                  {ticket.id}
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
                  {ticket.title}
                </Typography>

                {/* Category */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6b7280",
                    textTransform: "capitalize",
                    fontSize: 13,
                  }}
                >
                  {categoryOptions.find((opt) => opt.value === ticket.category)
                    ?.label || "—"}
                </Typography>

                {/* Priority */}
                <Box>
                  <Chip
                    label={ticket.priority || "—"}
                    size="small"
                    sx={{
                      backgroundColor: pri.bg,
                      color: pri.text,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      fontSize: "0.7rem",
                      height: 22,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>

                {/* Status */}
                <Box>
                  <Chip
                    label={(ticket.status || "—").replace("_", " ")}
                    size="small"
                    sx={{
                      backgroundColor: sta.bg,
                      color: sta.text,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      fontSize: "0.7rem",
                      height: 22,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>

                {/* Created */}
                <Typography
                  variant="body2"
                  sx={{ color: "#9ca3af", fontSize: 12 }}
                >
                  {ticket.createdAt}
                </Typography>

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

      {/* ── Ticket Detail Dialog ── */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
          },
        }}
      >
        {selectedTicket && (
          <DialogContent sx={{ p: 0 }}>
            {/* Dialog Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                px: 3,
                pt: 3,
                pb: 2,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{ color: "#9ca3af", letterSpacing: 0.6 }}
                >
                  {selectedTicket.id}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: "#111827", mt: 0.3, lineHeight: 1.3 }}
                >
                  {selectedTicket.title}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setSelectedTicket(null)}
                sx={{ mt: -0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Dialog Body */}
            <Box sx={{ px: 3, pt: 1, pb: 3 }}>
              {/* Description */}
              <Box sx={{ py: 2 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  sx={{
                    color: "#9ca3af",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                  }}
                >
                  Description
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#374151", mt: 1, lineHeight: 1.8 }}
                >
                  {selectedTicket.description || "No description provided."}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: "#f0f0f0" }} />

              {/* Meta details */}
              <Box sx={{ mt: 1 }}>
                <DetailRow label="Status">
                  <Chip
                    label={selectedTicket.status?.replace("_", " ")}
                    size="small"
                    sx={{
                      backgroundColor:
                        statusColors[selectedTicket.status]?.bg || "#f5f5f5",
                      color:
                        statusColors[selectedTicket.status]?.text || "#555",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      fontSize: "0.75rem",
                      borderRadius: 1.5,
                    }}
                  />
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Category">
                  <Typography
                    variant="body2"
                    sx={{ color: "#374151", textTransform: "capitalize" }}
                  >
                    {selectedTicket.category?.replace("_", " ") || "—"}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Priority">
                  <Chip
                    label={selectedTicket.priority}
                    size="small"
                    sx={{
                      backgroundColor:
                        priorityColors[selectedTicket.priority]?.bg ||
                        "#f5f5f5",
                      color:
                        priorityColors[selectedTicket.priority]?.text || "#555",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      fontSize: "0.75rem",
                      borderRadius: 1.5,
                    }}
                  />
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Created">
                  <Typography variant="body2" sx={{ color: "#374151" }}>
                    {selectedTicket.createdAt}
                  </Typography>
                </DetailRow>
                <Divider sx={{ borderColor: "#f9f9f9" }} />

                <DetailRow label="Conversation">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>   navigate(`/conversation/${selectedTicket.id}`)}
                  >
                    View Conversation
                  </Button>
                </DetailRow>
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
