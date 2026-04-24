import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { triageIssue, createTicket } from "../../Supportive Files/api";

// ── Constants ─────────────────────────────────────────────────────────────────
const MODULE_OPTS   = ["DPAI", "DS", "TMS", "EDM", "RP", "MRP", "Platform", "Unknown"];
const ENV_OPTS      = ["PROD", "UAT", "DEV", "Unknown"];
const SEVERITY_OPTS = [
  "Severity 1 (High)",
  "Severity 2 (Moderate)",
  "Severity 3 (Minor)",
  "Unknown",
];
const CATEGORY_OPTS = [
  "Bug (Code defect)",
  "Configuration gap",
  "Data issue",
  "Performance issue",
  "Environment issue",
  "Other",
  "Unknown",
];

// ── Shared style helpers ──────────────────────────────────────────────────────
const inputSx = (err = false) => ({
  width: "100%", p: "8px 10px",
  border: `0.5px solid ${err ? "#A32D2D" : "#D1D5DB"}`,
  borderRadius: "6px", fontSize: 13, fontFamily: "inherit",
  outline: "none", backgroundColor: "#fff", color: "#111827",
  boxSizing: "border-box", "&:focus": { borderColor: "#185FA5" },
});
const selectSx = (err = false) => ({
  ...inputSx(err), appearance: "auto", cursor: "pointer", height: 36,
});
const labelSx = {
  fontSize: 12, fontWeight: 500, color: "#374151", mb: 0.4, display: "block",
};
const btnBase = {
  px: "16px", py: "8px", borderRadius: "6px", fontSize: 13,
  cursor: "pointer", fontWeight: 500, fontFamily: "inherit", border: "none",
};

// ── Sub-components ────────────────────────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.2 }}>
    {children}
  </Typography>
);

const Pill = ({ label, bg = "#F3F4F6", color = "#374151" }) => (
  <Box component="span" sx={{ fontSize: 11, fontWeight: 500, px: "8px", py: "3px", borderRadius: "4px", backgroundColor: bg, color, display: "inline-block", mr: 0.6, mb: 0.6 }}>
    {label}
  </Box>
);

const Field = ({ label, children }) => (
  <Box>
    <Typography component="label" sx={labelSx}>{label}</Typography>
    {children}
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────
export const TriageFlow = () => {
  const [inputIssue,     setInputIssue]     = useState("");
  const [triageResp,     setTriageResp]     = useState(null);   // raw LLM response
  const [editable,       setEditable]       = useState({        // user-editable copy
    title: "", predicted_module: "", predicted_environment: "",
    predicted_severity: "", predicted_ticket_category: "", summary: "",
  });
  // phase: "idle" | "loading" | "review" | "submitting" | "done"
  const [phase,          setPhase]          = useState("idle");
  const [error,          setError]          = useState("");

  const setField = (k, v) => setEditable(f => ({ ...f, [k]: v }));

  // Step 2 — call /triage
  const handleAnalyze = async () => {
    if (!inputIssue.trim()) { setError("Please describe your issue first."); return; }
    setError(""); setPhase("loading");
    try {
      const result = await triageIssue(inputIssue);
      setTriageResp(result);
      setEditable({
        title:                    result.title                    ?? "",
        predicted_module:         result.predicted_module         ?? "",
        predicted_environment:    result.predicted_environment    ?? "",
        predicted_severity:       result.predicted_severity       ?? "",
        predicted_ticket_category:result.predicted_ticket_category?? "",
        summary:                  result.summary                  ?? "",
      });
      setPhase("review");
    } catch (err) {
      setError(err?.message || "Failed to analyse issue. Please try again.");
      setPhase("idle");
    }
  };

  // Step 6 — call /api/tickets
  const handleSubmit = async () => {
    if (!editable.title.trim()) { setError("Title is required before submitting."); return; }
    setError(""); setPhase("submitting");
    try {
      await createTicket({
        title:       editable.title,
        description: editable.summary,
        module:      editable.predicted_module,
        environment: editable.predicted_environment,
        severity:    editable.predicted_severity,
        category:    editable.predicted_ticket_category,
        references:  triageResp?.retrieved_references ?? [],
        metadata: {
          triage_timestamp: triageResp?.triage_timestamp,
          llm_generated:    true,
        },
      });
      setPhase("done");
      setTimeout(() => {
        setPhase("idle"); setInputIssue(""); setTriageResp(null);
        setEditable({ title: "", predicted_module: "", predicted_environment: "", predicted_severity: "", predicted_ticket_category: "", summary: "" });
      }, 3500);
    } catch (_) {
      // api interceptor shows toast
      setPhase("review");
    }
  };

  const handleReanalyze = () => {
    setPhase("idle"); setTriageResp(null);
    setEditable({ title: "", predicted_module: "", predicted_environment: "", predicted_severity: "", predicted_ticket_category: "", summary: "" });
    setError("");
  };

  const isBusy = phase === "loading" || phase === "submitting";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

      {/* ── Header ── */}
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#111827", mb: 0.3 }}>
          AI-powered ticket triage
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
          Describe your issue freely — the LLM analyses it and pre-fills all fields.
        </Typography>
      </Box>

      {/* ── Success banner ── */}
      {phase === "done" && (
        <Box sx={{ backgroundColor: "#EAF3DE", border: "0.5px solid #3B6D11", borderRadius: "6px", p: "10px 14px", fontSize: 13, color: "#3B6D11" }}>
          Ticket submitted successfully!
        </Box>
      )}

      {/* ── Error banner ── */}
      {error && (
        <Box sx={{ backgroundColor: "#FCEBEB", border: "0.5px solid #A32D2D", borderRadius: "6px", p: "10px 14px", fontSize: 13, color: "#A32D2D" }}>
          {error}
        </Box>
      )}

      {/* ── Step 1: Input ── */}
      {phase !== "done" && (
        <Box>
          <Field label="Describe your issue">
            <Box
              component="textarea"
              value={inputIssue}
              onChange={e => { setInputIssue(e.target.value); setError(""); }}
              disabled={isBusy || phase === "review"}
              placeholder="e.g. When I save a calendar entry in DPAI it returns a 400 error in UAT environment…"
              sx={{
                ...inputSx(false), resize: "vertical", minHeight: 90, display: "block",
                opacity: (isBusy || phase === "review") ? 0.6 : 1,
              }}
            />
          </Field>

          <Box sx={{ display: "flex", gap: 1, mt: 1.2 }}>
            <Box
              component="button"
              onClick={handleAnalyze}
              disabled={isBusy || phase === "review"}
              sx={{
                ...btnBase, backgroundColor: "#185FA5", color: "#fff",
                opacity: (isBusy || phase === "review") ? 0.6 : 1,
                cursor: (isBusy || phase === "review") ? "not-allowed" : "pointer",
                "&:hover": { opacity: (isBusy || phase === "review") ? 0.6 : 0.9 },
              }}
            >
              {phase === "loading" ? "Analysing…" : "✦ Analyse Issue"}
            </Box>
            {phase === "review" && (
              <Box
                component="button"
                onClick={handleReanalyze}
                sx={{ ...btnBase, backgroundColor: "#fff", color: "#374151", border: "0.5px solid #D1D5DB", "&:hover": { backgroundColor: "#F9FAFB" } }}
              >
                Re-analyse
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ── Loading indicator ── */}
      {phase === "loading" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, color: "#6B7280", fontSize: 13 }}>
          <Box sx={{ width: 16, height: 16, border: "2px solid #D1D5DB", borderTopColor: "#185FA5", borderRadius: "50%", animation: "spin 0.8s linear infinite",
            "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
          Contacting LLM service…
        </Box>
      )}

      {/* ── Steps 3–5: Review & edit ── */}
      {(phase === "review" || phase === "submitting") && triageResp && (
        <>
          {/* Editable fields */}
          <Box sx={{ backgroundColor: "#EBF4FF", border: "0.5px solid #BFDBFE", borderRadius: "8px", p: "14px 16px" }}>
            <SectionTitle>✦ AI analysis — edit before submitting</SectionTitle>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
              <Field label="Title *">
                <Box
                  component="input"
                  value={editable.title}
                  onChange={e => setField("title", e.target.value)}
                  disabled={phase === "submitting"}
                  sx={{ ...inputSx(false), opacity: phase === "submitting" ? 0.7 : 1 }}
                />
              </Field>

              <Field label="Summary / Description *">
                <Box
                  component="textarea"
                  value={editable.summary}
                  onChange={e => setField("summary", e.target.value)}
                  disabled={phase === "submitting"}
                  sx={{ ...inputSx(false), resize: "vertical", minHeight: 70, display: "block", opacity: phase === "submitting" ? 0.7 : 1 }}
                />
              </Field>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
                <Field label="Module">
                  <Box component="select" value={editable.predicted_module}
                    onChange={e => setField("predicted_module", e.target.value)}
                    disabled={phase === "submitting"}
                    sx={{ ...selectSx(false), opacity: phase === "submitting" ? 0.7 : 1 }}>
                    {MODULE_OPTS.map(o => <option key={o}>{o}</option>)}
                  </Box>
                </Field>

                <Field label="Environment">
                  <Box component="select" value={editable.predicted_environment}
                    onChange={e => setField("predicted_environment", e.target.value)}
                    disabled={phase === "submitting"}
                    sx={{ ...selectSx(false), opacity: phase === "submitting" ? 0.7 : 1 }}>
                    {ENV_OPTS.map(o => <option key={o}>{o}</option>)}
                  </Box>
                </Field>

                <Field label="Severity">
                  <Box component="select" value={editable.predicted_severity}
                    onChange={e => setField("predicted_severity", e.target.value)}
                    disabled={phase === "submitting"}
                    sx={{ ...selectSx(false), opacity: phase === "submitting" ? 0.7 : 1 }}>
                    {SEVERITY_OPTS.map(o => <option key={o}>{o}</option>)}
                  </Box>
                </Field>

                <Field label="Category">
                  <Box component="select" value={editable.predicted_ticket_category}
                    onChange={e => setField("predicted_ticket_category", e.target.value)}
                    disabled={phase === "submitting"}
                    sx={{ ...selectSx(false), opacity: phase === "submitting" ? 0.7 : 1 }}>
                    {CATEGORY_OPTS.map(o => <option key={o}>{o}</option>)}
                  </Box>
                </Field>
              </Box>
            </Box>
          </Box>

          {/* Non-editable insights */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2 }}>
            {/* Missing fields */}
            {triageResp.missing_fields?.length > 0 && (
              <Box sx={{ border: "0.5px solid #E5E7EB", borderRadius: "8px", p: "12px 14px", backgroundColor: "#FFFBF0" }}>
                <SectionTitle>Missing information</SectionTitle>
                {triageResp.missing_fields.map((f, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}>
                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#854F0B", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 12, color: "#374151" }}>{f}</Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* Suggested questions */}
            {triageResp.suggested_questions?.length > 0 && (
              <Box sx={{ border: "0.5px solid #E5E7EB", borderRadius: "8px", p: "12px 14px", backgroundColor: "#F0F9FF" }}>
                <SectionTitle>Suggested questions</SectionTitle>
                {triageResp.suggested_questions.map((q, i) => (
                  <Box key={i} sx={{ display: "flex", gap: 0.8, mb: 0.7 }}>
                    <Typography sx={{ fontSize: 12, color: "#185FA5", flexShrink: 0, fontWeight: 600 }}>Q{i + 1}.</Typography>
                    <Typography sx={{ fontSize: 12, color: "#374151" }}>{q}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Retrieved references table */}
          {triageResp.retrieved_references?.length > 0 && (
            <Box sx={{ border: "0.5px solid #E5E7EB", borderRadius: "8px", p: "12px 14px" }}>
              <SectionTitle>Similar tickets</SectionTitle>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <Box component="thead">
                  <Box component="tr">
                    {["ID", "Issue", "Category", "Severity", "Score"].map(h => (
                      <Box key={h} component="th" sx={{ textAlign: "left", py: "6px", px: "8px", borderBottom: "0.5px solid #E5E7EB", color: "#6B7280", fontWeight: 500, fontSize: 11, whiteSpace: "nowrap" }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {triageResp.retrieved_references.map((ref, i) => (
                    <Box key={i} component="tr" sx={{ "&:hover": { backgroundColor: "#F9FAFB" } }}>
                      <Box component="td" sx={{ py: "6px", px: "8px", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap", color: "#6B7280" }}>
                        {ref.ticket_id ?? `REF-${i + 1}`}
                      </Box>
                      <Box component="td" sx={{ py: "6px", px: "8px", borderBottom: "0.5px solid #F3F4F6", maxWidth: 240 }}>
                        <Typography sx={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ref.issues ?? ref.issue ?? ref.description ?? "—"}
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ py: "6px", px: "8px", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        {ref.ticket_category ?? ref.category ?? "—"}
                      </Box>
                      <Box component="td" sx={{ py: "6px", px: "8px", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        {ref.severity_of_issue ?? ref.severity ?? "—"}
                      </Box>
                      <Box component="td" sx={{ py: "6px", px: "8px", borderBottom: "0.5px solid #F3F4F6", whiteSpace: "nowrap" }}>
                        {typeof ref.score === "number" ? `${(ref.score * 100).toFixed(0)}%` : "—"}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* Metadata strip */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Pill label={`Triage: ${new Date(triageResp.triage_timestamp).toLocaleTimeString()}`} />
            <Pill label="LLM-generated" bg="#EAF3DE" color="#3B6D11" />
            {triageResp.retrieved_references?.length > 0 && (
              <Pill label={`${triageResp.retrieved_references.length} similar ticket(s) found`} bg="#EBF4FF" color="#185FA5" />
            )}
          </Box>

          {/* Submit actions */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              component="button"
              onClick={handleSubmit}
              disabled={phase === "submitting"}
              sx={{
                ...btnBase, backgroundColor: "#185FA5", color: "#fff",
                opacity: phase === "submitting" ? 0.7 : 1,
                cursor: phase === "submitting" ? "not-allowed" : "pointer",
                "&:hover": { opacity: phase === "submitting" ? 0.7 : 0.9 },
              }}
            >
              {phase === "submitting" ? "Submitting…" : "Submit Ticket"}
            </Box>
            <Box
              component="button"
              onClick={handleReanalyze}
              disabled={phase === "submitting"}
              sx={{ ...btnBase, backgroundColor: "#fff", color: "#374151", border: "0.5px solid #D1D5DB", "&:hover": { backgroundColor: "#F9FAFB" } }}
            >
              Start over
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
