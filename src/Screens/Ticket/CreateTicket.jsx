import { useState } from "react";
import { TextField, Select } from "@3sc/common-component";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { categoryOptions, priorityOptions } from "./constant";
import { generateTicket } from "../../Supportive Files/api";

const CreateTicket = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    status: "open",
    attachments: [],
  });

  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [suggestedFields, setSuggestedFields] = useState(null);
  const [hintsOpen, setHintsOpen] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    const text = aiInput.trim() || form.description.trim();
    if (!text) {
      setAiError("Enter a description above before generating.");
      return;
    }
    console.log("Generating ticket with AI for input:", {text});
    setAiError(null);
    setAiLoading(true);
    try {
      const result = await generateTicket(text);
      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        description: result.description || prev.description,
        priority:
          priorityOptions.find((o) => o.value === result.priority)?.value ||
          prev.priority,
        category:
          categoryOptions.find((o) => o.value === result.category)?.value ||
          prev.category,
      }));
      if (result.suggested_fields) {
        setSuggestedFields(result.suggested_fields);
        setHintsOpen(true);
      }
    } catch {
      setAiError("AI generation failed. Fill the form manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({ ...form, createdAt: new Date().toLocaleDateString("en-CA") });
    onClose();
  };

  const missingFields = suggestedFields?.missing_fields ?? [];
  const suggestedQuestions = suggestedFields?.suggested_questions ?? [];
  const hasHints = missingFields.length > 0 || suggestedQuestions.length > 0;

  return (
    <Box sx={{ width: 480, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Create New Ticket
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Form */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* ── AI Generation panel ── */}
          <Box
            sx={{
              border: "1px dashed #4a6741",
              borderRadius: 2,
              p: 2,
              backgroundColor: "#f7faf6",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 1.2 }}>
              <AutoAwesomeIcon sx={{ fontSize: 16, color: "#4a6741" }} />
              <Typography variant="body2" fontWeight={600} sx={{ color: "#4a6741" }}>
                Generate with AI
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "#6b7280", display: "block", mb: 1.2 }}>
              Describe the issue in plain text. The AI will suggest a title,
              category, and priority for you to review and edit.
            </Typography>
            <TextField
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g. Forecast values aren't updating after the pipeline run in PROD…"
            />
            {aiError && (
              <Alert severity="error" sx={{ mt: 1, py: 0.3, fontSize: 12 }}>
                {aiError}
              </Alert>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={
                aiLoading ? (
                  <CircularProgress size={14} sx={{ color: "#fff" }} />
                ) : (
                  <AutoAwesomeIcon sx={{ fontSize: 15 }} />
                )
              }
              onClick={handleGenerate}
              disabled={aiLoading}
              sx={{
                mt: 1.5,
                borderRadius: 2,
                backgroundColor: "#4a6741",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#3a5232", boxShadow: "none" },
              }}
            >
              {aiLoading ? "Generating…" : "Generate"}
            </Button>
          </Box>

          {/* ── AI hints (missing fields / suggested questions) ── */}
          {hasHints && (
            <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
              <Box
                onClick={() => setHintsOpen((o) => !o)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  backgroundColor: "#f9fafb",
                  borderBottom: hintsOpen ? "1px solid #e5e7eb" : "none",
                }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ color: "#6b7280" }}>
                  AI SUGGESTIONS
                </Typography>
                {hintsOpen ? (
                  <ExpandLessIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 16, color: "#9ca3af" }} />
                )}
              </Box>
              <Collapse in={hintsOpen}>
                <Box sx={{ px: 2, py: 1.5 }}>
                  {missingFields.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: "#374151", display: "block", mb: 0.8 }}
                      >
                        Missing information
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                        {missingFields.map((f) => (
                          <Chip
                            key={f}
                            label={f}
                            size="small"
                            sx={{
                              fontSize: 11,
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                              fontWeight: 500,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {suggestedQuestions.length > 0 && (
                    <Box>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: "#374151", display: "block", mb: 0.8 }}
                      >
                        Clarifying questions
                      </Typography>
                      {suggestedQuestions.map((q, i) => (
                        <Typography
                          key={i}
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "#6b7280",
                            mb: 0.5,
                            pl: 1,
                            borderLeft: "2px solid #d1fae5",
                          }}
                        >
                          {q}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* ── Editable fields ── */}
          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.8}>
              Title <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              fullWidth
              placeholder="Enter ticket title"
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.8}>
              Description
            </Typography>
            <TextField
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              multiline
              rows={4}
              placeholder="Describe the issue in detail..."
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.8}>
              Category
            </Typography>
            <Select
              value={categoryOptions.find((opt) => opt.value === form.category) || ""}
              options={categoryOptions}
              onChange={(item) => handleChange("category", item.value)}
              label="Select category"
              style={{ width: "100%" }}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.8}>
              Priority
            </Typography>
            <Select
              value={form.priority}
              options={priorityOptions}
              onChange={(item) => handleChange("priority", item.value)}
              label="Select priority"
              style={{ width: "100%" }}
            />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={500} mb={0.8}>
              Attachments
            </Typography>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileIcon />}
              size="small"
              sx={{ borderRadius: 2 }}
            >
              Attach Files
              <input type="file" hidden multiple onChange={handleFileChange} />
            </Button>
            {form.attachments.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {form.attachments.map((file, i) => (
                  <Chip
                    key={i}
                    label={file.name}
                    size="small"
                    onDelete={() => removeAttachment(i)}
                    sx={{ maxWidth: 200 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ px: 3, py: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={!form.title.trim()}
          sx={{ borderRadius: 2 }}
        >
          Submit Ticket
        </Button>
        <Button variant="outlined" fullWidth onClick={onClose} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTicket;
