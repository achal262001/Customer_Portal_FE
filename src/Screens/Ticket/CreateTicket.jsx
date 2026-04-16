import { useState } from "react";
import { TextField, Select } from "@3sc/common-component";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { categoryOptions, priorityOptions, statusOptions } from "./constant";

const CreateTicket = ({ onSubmit, onClose }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    status: "open",
    attachments: [],
  });

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

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({
      ...form,
      createdAt: new Date().toLocaleDateString("en-CA"),
    });
    onClose();
  };

  return (
    <Box
      sx={{
        width: 480,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

          {/* <Box>
            <Typography variant="body2" fontWeight={500} mb={0.8}>
              Status
            </Typography>
            <Select
              value={form.status}
              options={statusOptions}
              onChange={(value) => handleChange("status", value)}
              label="Select status"
              style={{ width: "100%" }}
            />
          </Box> */}

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
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{ borderRadius: 2 }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default CreateTicket;
