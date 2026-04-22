import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { statusColors } from "./constant";
import {
  getCommunicationTickets,
  getTicketMessages,
  sendTicketMessage,
} from "../../Supportive Files/api";

const normalizeMessage = (msg) => ({
  id: msg.messageId,
  sender: msg.sender === "client" ? "user" : "portal",
  name: msg.senderName,
  text: msg.text,
  time: new Date(msg.sentAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  date: msg.sentAt.split("T")[0],
});

const normalizeTicket = (t) => ({
  ticketId: t.ticketId,
  title: t.title,
  status: t.status.toLowerCase().replace(/\s+/g, "_"),
  clientName: t.clientName,
  category: "Support",
  lastMessage: t.lastMessage,
  lastMessageAt: t.lastMessageAt,
  unreadCount: t.unreadCount,
  messages: [],
});

const CommunicationHub = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch ticket list on mount
  useEffect(() => {
    getCommunicationTickets()
      .then((data) => {
        const normalized = data.map(normalizeTicket);
        setConversations(normalized);
        if (normalized.length > 0) setSelectedId(normalized[0].ticketId);
      })
      .catch(console.error)
      .finally(() => setLoadingTickets(false));
  }, []);

  // Fetch messages when selected ticket changes
  useEffect(() => {
    if (selectedId == null) return;

    const conv = conversations.find((c) => c.ticketId === selectedId);
    if (conv?.messages.length > 0) return; // already loaded

    setLoadingMessages(true);
    getTicketMessages(selectedId)
      .then((data) => {
        const msgs = data.map(normalizeMessage);
        setConversations((prev) =>
          prev.map((c) =>
            c.ticketId === selectedId ? { ...c, messages: msgs } : c
          )
        );
      })
      .catch(console.error)
      .finally(() => setLoadingMessages(false));
  }, [selectedId]);

  // Auto-scroll to latest message
  const selected = conversations.find((c) => c.ticketId === selectedId);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages?.length]);

  const handleSend = async () => {
    if (!replyText.trim()) return;

    const payload = { sender: "agent", name: "Support Team", text: replyText.trim() };

    // Optimistic update
    const optimistic = {
      id: Date.now(),
      sender: "portal",
      name: "Support Team",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.ticketId === selectedId
          ? { ...c, messages: [...c.messages, optimistic] }
          : c
      )
    );
    setReplyText("");

    try {
      const saved = await sendTicketMessage(selectedId, payload);
      const normalized = normalizeMessage(saved);
      // Replace optimistic with server response
      setConversations((prev) =>
        prev.map((c) =>
          c.ticketId === selectedId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === optimistic.id ? normalized : m
                ),
              }
            : c
        )
      );
    } catch {
      // Keep optimistic message on failure
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  if (loadingTickets) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress sx={{ color: "#1976d2" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", overflow: "hidden" }}>
      {/* ── Left Panel: Ticket List ── */}
      <Box
        sx={{
          width: 340,
          flexShrink: 0,
          backgroundColor: "#fff",
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" fontWeight={700}>
            Communication Hub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {conversations.length} tickets
          </Typography>
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {conversations.map((conv) => {
            const isActive = conv.ticketId === selectedId;
            const statusStyle = statusColors[conv.status] || statusColors.closed;
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <Box
                key={conv.ticketId}
                onClick={() => setSelectedId(conv.ticketId)}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                  px: 2,
                  py: 1.8,
                  cursor: "pointer",
                  backgroundColor: isActive ? "#f0f7ff" : "transparent",
                  borderLeft: isActive ? "3px solid #1976d2" : "3px solid transparent",
                  "&:hover": { backgroundColor: isActive ? "#f0f7ff" : "#f9f9f9" },
                  transition: "background 0.15s",
                }}
              >
                <Avatar
                  sx={{
                    width: 46,
                    height: 46,
                    backgroundColor: isActive ? "#1976d2" : "#90a4ae",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  #{conv.ticketId}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.3,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
                      {conv.title}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {lastMsg?.time ?? ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 170 }}
                    >
                      {lastMsg?.text ?? conv.lastMessage}
                    </Typography>
                    <Chip
                      label={conv.status.replace("_", " ")}
                      size="small"
                      sx={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        fontSize: "0.6rem",
                        height: 18,
                        fontWeight: 600,
                        textTransform: "capitalize",
                        flexShrink: 0,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Right Panel: Chat Window ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Chat Header */}
        <Box
          sx={{
            px: 3,
            py: 1.8,
            backgroundColor: "#fff",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar sx={{ backgroundColor: "#1976d2", fontWeight: 700, fontSize: 13 }}>
            #{selected?.ticketId}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {selected?.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.3 }}>
              <Chip
                label={selected?.clientName ?? selected?.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.65rem", height: 18 }}
              />
              <Chip
                label={selected?.status?.replace("_", " ")}
                size="small"
                sx={{
                  backgroundColor: statusColors[selected?.status]?.bg,
                  color: statusColors[selected?.status]?.text,
                  fontSize: "0.65rem",
                  height: 18,
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            backgroundImage: "radial-gradient(circle, #d1d7db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#efeae2",
          }}
        >
          {loadingMessages ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} sx={{ color: "#1976d2" }} />
            </Box>
          ) : (
            selected?.messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              const prevMsg = selected.messages[index - 1];
              const showDate = !prevMsg || prevMsg.date !== msg.date;

              return (
                <Box key={msg.id}>
                  {showDate && (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
                      <Chip
                        label={msg.date}
                        size="small"
                        sx={{ backgroundColor: "rgba(255,255,255,0.75)", fontSize: "0.7rem", color: "#555" }}
                      />
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    {!isUser && (
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          backgroundColor: "#1976d2",
                          flexShrink: 0,
                          mb: 0.5,
                        }}
                      >
                        {getInitials(msg.name)}
                      </Avatar>
                    )}

                    <Box
                      sx={{
                        maxWidth: "62%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isUser ? "flex-end" : "flex-start",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: isUser ? "#1976d2" : "#5c3d11",
                          fontWeight: 600,
                          mb: 0.3,
                          px: 0.5,
                        }}
                      >
                        {msg.name}
                      </Typography>

                      <Box
                        sx={{
                          backgroundColor: isUser ? "#d9fdd3" : "#fff",
                          color: "#111",
                          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                          px: 2,
                          py: 1,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                          {msg.text}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign: "right",
                            color: "#8a9ba8",
                            fontSize: "0.65rem",
                            mt: 0.5,
                          }}
                        >
                          {msg.time}
                        </Typography>
                      </Box>
                    </Box>

                    {isUser && (
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: 11,
                          backgroundColor: "#43a047",
                          flexShrink: 0,
                          mb: 0.5,
                        }}
                      >
                        {getInitials(msg.name)}
                      </Avatar>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Reply Input */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            backgroundColor: "#f0f2f5",
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton size="small" sx={{ color: "#8a9ba8" }}>
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Type a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!replyText.trim()}
            sx={{
              backgroundColor: replyText.trim() ? "#1976d2" : "#ccc",
              color: "#fff",
              width: 40,
              height: 40,
              flexShrink: 0,
              "&:hover": { backgroundColor: "#1565c0" },
              "&.Mui-disabled": { backgroundColor: "#ccc", color: "#fff" },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default CommunicationHub;
