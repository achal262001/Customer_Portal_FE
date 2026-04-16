import { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { conversations, statusColors } from "./constant";

const CommunicationHub = () => {
  const [selectedId, setSelectedId] = useState(conversations[0].ticketId);
  const [allConversations, setAllConversations] = useState(conversations);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  const selected = allConversations.find((c) => c.ticketId === selectedId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  const handleSend = () => {
    if (!replyText.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMessage = {
      id: Date.now(),
      sender: "portal",
      name: "Support Team",
      text: replyText.trim(),
      time,
      date: now.toISOString().split("T")[0],
    };
    setAllConversations((prev) =>
      prev.map((c) =>
        c.ticketId === selectedId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    setReplyText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getLastMessage = (conv) => {
    const last = conv.messages[conv.messages.length - 1];
    return last ? last.text : "";
  };

  const getLastTime = (conv) => {
    const last = conv.messages[conv.messages.length - 1];
    return last ? last.time : "";
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        backgroundImage: "url('/BaseTheme.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
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
        {/* Panel Header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography variant="h6" fontWeight={700}>
            Communication Hub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {allConversations.length} tickets
          </Typography>
        </Box>
        

        {/* Ticket List */}
        <Box sx={{ overflowY: "auto", flex: 1 }}>
          {allConversations.map((conv) => {
            const isActive = conv.ticketId === selectedId;
            const statusStyle = statusColors[conv.status] || statusColors.closed;
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
                  {conv.ticketId.replace("TKT-", "#")}
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
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      noWrap
                      sx={{ maxWidth: 160 }}
                    >
                      {conv.title}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                      {getLastTime(conv)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      sx={{ maxWidth: 170 }}
                    >
                      {getLastMessage(conv)}
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
            {selected?.ticketId.replace("TKT-", "#")}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {selected?.title}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.3 }}>
              <Chip
                label={selected?.category}
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
            backgroundImage:
              "radial-gradient(circle, #d1d7db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            backgroundColor: "#efeae2",
          }}
        >
          {selected?.messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            const prevMsg = selected.messages[index - 1];
            const showDate = !prevMsg || prevMsg.date !== msg.date;

            return (
              <Box key={msg.id}>
                {/* Date Divider */}
                {showDate && (
                  <Box sx={{ display: "flex", justifyContent: "center", my: 1.5 }}>
                    <Chip
                      label={msg.date}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.75)",
                        fontSize: "0.7rem",
                        color: "#555",
                      }}
                    />
                  </Box>
                )}

                {/* Message Bubble */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    alignItems: "flex-end",
                    gap: 1,
                  }}
                >
                  {/* Portal avatar on left */}
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
                    {/* Sender name */}
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

                    {/* Bubble */}
                    <Box
                      sx={{
                        backgroundColor: isUser ? "#d9fdd3" : "#fff",
                        color: "#111",
                        borderRadius: isUser
                          ? "16px 4px 16px 16px"
                          : "4px 16px 16px 16px",
                        px: 2,
                        py: 1,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                        position: "relative",
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

                  {/* User avatar on right */}
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
          })}
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
