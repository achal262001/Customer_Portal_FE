import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import {
  createTicket, getAllModules, getAllEnvironments, getAllCategories,
  getAllSeverities, getAllProjects, getMilestones,
} from "../../Supportive Files/api";
import { TriageFlow } from "./TriageFlow";
import { toArray } from "./shared";

export const RaiseIssuePanel = () => {
  const theme = useTheme();

  const inputSx = (err) => ({
    width: "100%", p: "8px 10px", border: `0.5px solid ${err ? "#A32D2D" : theme.palette.divider}`,
    borderRadius: "6px", fontSize: 13, fontFamily: "inherit", outline: "none",
    backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, boxSizing: "border-box",
    "&:focus": { borderColor: "#185FA5" },
  });
  const selectSx = (err) => ({ ...inputSx(err), appearance: "auto", cursor: "pointer", height: 36 });
  const labelSx = { fontSize: 12, fontWeight: 500, color: theme.palette.text.primary, mb: 0.4, display: "block" };
  const errSx = { fontSize: 11, color: "#A32D2D", mt: 0.3 };
  const btnBase = { px: "16px", py: "8px", borderRadius: "6px", fontSize: 13, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" };

  const [modules, setModules] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [clients] = useState([]);

  useEffect(() => {
    getAllModules().then(res => setModules(toArray(res))).catch(() => {});
    getAllEnvironments().then(res => setEnvironments(toArray(res))).catch(() => {});
    getAllCategories().then(res => setCategories(toArray(res))).catch(() => {});
    getAllSeverities().then(res => setSeverities(toArray(res))).catch(() => {});
    getAllProjects().then(res => setProjects(toArray(res))).catch(() => {});
    getMilestones().then(res => setMilestones(toArray(res))).catch(() => {});
  }, []);

  const EMPTY_FORM = { title: "", description: "", module: "", environment: "", category: "", severity: "", project: "", milestone: "", client: "" };
  const [form, setForm] = useState(EMPTY_FORM);
  const [manSubmitted, setManSubmitted] = useState(false);
  const [manSubmitting, setManSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const handleManSubmit = async () => {
    const required = ["title", "description", "module", "environment", "category", "severity"];
    const newErr = {};
    required.forEach(k => { if (!form[k]) newErr[k] = "Required"; });
    if (Object.keys(newErr).length) { setErrors(newErr); return; }
    setManSubmitting(true);
    try {
      await createTicket({
        title: form.title,
        description: form.description,
        moduleId: form.module,
        environmentId: form.environment,
        categoryId: form.category,
        severityId: form.severity,
        projectId: form.project || null,
        milestoneId: form.milestone || null,
        clientId: form.client || null,
      });
      setForm(EMPTY_FORM); setErrors({});
      setManSubmitted(true);
      setTimeout(() => setManSubmitted(false), 3500);
    } catch (_) {
    } finally {
      setManSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, height: "100%", overflow: "hidden" }}>
      <Box sx={{ borderRight: `1px solid ${theme.palette.divider}`, pr: 3, overflowY: "auto" }}>
        <TriageFlow />
      </Box>

      <Box sx={{ pl: 3, overflowY: "auto" }}>
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: theme.palette.text.primary, mb: 0.3 }}>Manual ticket</Typography>
          <Typography sx={{ fontSize: 12, color: theme.palette.text.disabled }}>Fill in the details yourself and submit.</Typography>
        </Box>

        {manSubmitted && (
          <Box sx={{ backgroundColor: "#EAF3DE", border: "0.5px solid #3B6D11", borderRadius: "6px", p: "10px 14px", fontSize: 13, color: "#3B6D11", mb: 2 }}>
            Ticket submitted successfully!
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.6 }}>
          <Box>
            <Typography component="label" sx={labelSx}>Title <span style={{ color: "#A32D2D" }}>*</span></Typography>
            <Box component="input" value={form.title} onChange={e => setField("title", e.target.value)} placeholder="Short summary of the issue" sx={inputSx(errors.title)} />
            {errors.title && <Typography sx={errSx}>{errors.title}</Typography>}
          </Box>

          <Box>
            <Typography component="label" sx={labelSx}>Description <span style={{ color: "#A32D2D" }}>*</span></Typography>
            <Box component="textarea" value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Describe the issue in detail…" sx={{ ...inputSx(errors.description), resize: "vertical", minHeight: 80, display: "block" }} />
            {errors.description && <Typography sx={errSx}>{errors.description}</Typography>}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={labelSx}>Module <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.module} onChange={e => setField("module", Number(e.target.value))} sx={selectSx(errors.module)}>
                <option value="">Select module</option>
                {modules.map(m => <option key={m.id} value={m.moduleId}>{m.name}</option>)}
              </Box>
              {errors.module && <Typography sx={errSx}>{errors.module}</Typography>}
            </Box>
            <Box>
              <Typography component="label" sx={labelSx}>Environment <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.environment} onChange={e => setField("environment", Number(e.target.value))} sx={selectSx(errors.environment)}>
                <option value="">Select environment</option>
                {environments.map(env => <option key={env.environmentId} value={env.environmentId}>{env.name}</option>)}
              </Box>
              {errors.environment && <Typography sx={errSx}>{errors.environment}</Typography>}
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={labelSx}>Category <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.category} onChange={e => setField("category", Number(e.target.value))} sx={selectSx(errors.category)}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </Box>
              {errors.category && <Typography sx={errSx}>{errors.category}</Typography>}
            </Box>
            <Box>
              <Typography component="label" sx={labelSx}>Severity <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.severity} onChange={e => setField("severity", Number(e.target.value))} sx={selectSx(errors.severity)}>
                <option value="">Select severity</option>
                {severities.map(s => <option key={s.severityId} value={s.severityId}>{s.label}</option>)}
              </Box>
              {errors.severity && <Typography sx={errSx}>{errors.severity}</Typography>}
            </Box>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Box>
              <Typography component="label" sx={labelSx}>Project <span style={{ color: "#A32D2D" }}>*</span></Typography>
              <Box component="select" value={form.project} onChange={e => setField("project", Number(e.target.value))} sx={selectSx(errors.project)}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.projectId} value={p.projectId}>{p.title}</option>)}
              </Box>
              {errors.project && <Typography sx={errSx}>{errors.project}</Typography>}
            </Box>
            <Box>
              <Typography component="label" sx={labelSx}>Milestone</Typography>
              <Box component="select" value={form.milestone} onChange={e => setField("milestone", Number(e.target.value))} sx={selectSx(false)}>
                <option value="">Select milestone</option>
                {milestones.map(m => <option key={m.milestoneId} value={m.milestoneId}>{m.title}</option>)}
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography component="label" sx={labelSx}>Client</Typography>
            <Box component="select" value={form.client} onChange={e => setField("client", e.target.value)} sx={selectSx(errors.client)}>
              <option value="">Select client</option>
              {clients.map(c => <option key={c.clientId} value={c.clientId}>{c.name}</option>)}
            </Box>
            {errors.client && <Typography sx={errSx}>{errors.client}</Typography>}
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
            <Box component="button" onClick={handleManSubmit} disabled={manSubmitting}
              sx={{ ...btnBase, backgroundColor: "#185FA5", color: "#fff", border: "none", opacity: manSubmitting ? 0.7 : 1, cursor: manSubmitting ? "not-allowed" : "pointer", "&:hover": { opacity: manSubmitting ? 0.7 : 0.9 } }}>
              {manSubmitting ? "Submitting…" : "Submit ticket"}
            </Box>
            <Box component="button" onClick={() => { setForm(EMPTY_FORM); setErrors({}); }} disabled={manSubmitting}
              sx={{ ...btnBase, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, border: `0.5px solid ${theme.palette.divider}`, "&:hover": { backgroundColor: theme.palette.action.hover } }}>
              Reset
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RaiseIssuePanel;
