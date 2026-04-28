import { getAllProjects } from "../../Supportive Files/api";
import { C, Badge, Card, Btn, SHeader, Spinner, ProgressBar, useFetch, toArray, ClientBadge } from "./shared";

const ProjectsSection = () => {
  const { data: projectsRaw, loading } = useFetch(() => getAllProjects());

  const STATIC_PROJECTS = [
    { title: "DPAI — Phase 2 Rollout", client: "Client 2", spoc: "Nikita K.", due: "28 Feb 2026", statusLabel: "In progress · 68%", statusSx: { background: C.warnBg, color: C.warn }, pct: 68, pColor: "#378ADD", note: "AI summary: Integration testing blocked by 3 open env tickets. ETA slipping by ~4 days." },
    { title: "TMS — Configuration Upgrade", client: "Client 2", spoc: "Nikita K.", due: "15 May 2026", statusLabel: "Planned · 22%", statusSx: { background: C.blueBg, color: C.blue }, pct: 22, pColor: "#378ADD", note: null },
    { title: "DS — Data Migration v2", client: "Client 1", spoc: "Ravi M.", due: "30 Jun 2026", statusLabel: "Planned · 10%", statusSx: { background: C.blueBg, color: C.blue }, pct: 10, pColor: "#378ADD", note: null },
    { title: "TMS — Onboarding", client: "Client 3", spoc: "Priya S.", due: "30 Sep 2026", statusLabel: "Complete · 100%", statusSx: { background: C.successBg, color: C.success }, pct: 100, pColor: C.green, note: null },
  ];

  const statusSxMap = (s = "") => {
    const sl = s.toLowerCase();
    if (sl.includes("progress") || sl.includes("active")) return { bg: C.warnBg, color: C.warn };
    if (sl.includes("complete") || sl.includes("done")) return { bg: C.successBg, color: C.success };
    return { bg: C.blueBg, color: C.blue };
  };

  const rawProjects = toArray(projectsRaw);
  const projects = rawProjects.length > 0
    ? rawProjects.map(p => {
        const status = p.status?.name || p.status || "Planned";
        const pct = p.progress ?? p.completionPct ?? p.percentage ?? 0;
        const ssx = statusSxMap(status);
        return {
          title: p.name || p.title || "—",
          client: p.client?.name || p.client || "—",
          spoc: p.spoc?.name || p.deliverySpoc?.name || p.spoc || "—",
          due: (p.dueDate || p.due || "").split("T")[0] || "—",
          statusLabel: `${status} · ${pct}%`,
          statusSx: { background: ssx.bg, color: ssx.color },
          pct,
          pColor: "#378ADD",
          note: p.aiSummary || p.summary || null,
        };
      })
    : STATIC_PROJECTS;

  return (
    <div>
      <SHeader title="All projects">
        <Btn sm variant="primary">+ New project</Btn>
      </SHeader>
      {loading && <Spinner />}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p) => (
          <Card key={p.title} style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>
                  <ClientBadge client={p.client} /> · SPOC: {p.spoc} · Due {p.due}
                </div>
              </div>
              <Badge style={p.statusSx}>{p.statusLabel}</Badge>
            </div>
            <ProgressBar pct={p.pct} color={p.pColor} />
            {p.note && <div style={{ marginTop: 8, fontSize: 12, color: C.textSecondary }}>✦ {p.note}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
