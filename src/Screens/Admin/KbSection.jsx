import { useState } from "react";
import { C, Btn, SHeader } from "./shared";

const KbSection = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");

  const articles = [
    { cat: "Environment", catSx: { background: C.blueBg, color: C.blueDark }, title: "Fixing 400 errors on calendar save in DPAI", meta: "142 views · Updated 8 Apr 2026 · By Nikita K." },
    { cat: "Configuration", catSx: { background: "#EEEDFE", color: "#3C3489" }, title: "UAT environment reset checklist", meta: "98 views · Updated 2 Apr 2026 · By Ravi M." },
    { cat: "Bug", catSx: { background: C.dangerBg, color: C.danger }, title: "Troubleshooting SSO login redirect loops", meta: "76 views · Updated 29 Mar 2026 · By Priya S." },
    { cat: "Change Request", catSx: { background: C.successBg, color: C.success }, title: "How to submit a change request", meta: "211 views · Updated 1 Apr 2026 · By Nikita K." },
    { cat: "Environment", catSx: { background: C.blueBg, color: C.blueDark }, title: "Data sync timeouts — causes and resolutions", meta: "55 views · Updated 5 Apr 2026 · By Arjun T." },
    { cat: "Configuration", catSx: { background: "#EEEDFE", color: "#3C3489" }, title: "TMS workflow approval not triggering", meta: "89 views · Updated 10 Apr 2026 · By Ravi M." },
  ];

  const filtered = articles.filter(
    (a) => (!search || a.title.toLowerCase().includes(search.toLowerCase())) && (!catFilter || a.cat === catFilter)
  );

  const selectSx = { fontSize: 13, padding: "6px 10px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text };

  return (
    <div>
      <SHeader title="Knowledge base">
        <Btn sm variant="primary">+ New article</Btn>
      </SHeader>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles…" style={{ ...selectSx, flex: 1, minWidth: 140 }} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} style={selectSx}>
          <option value="">All categories</option>
          <option>Environment</option><option>Bug</option><option>Configuration</option><option>Change Request</option>
        </select>
      </div>
      {filtered.map((a) => (
        <div key={a.title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.bg, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap", ...a.catSx }}>{a.cat}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
            <div style={{ fontSize: 11, color: C.textTertiary }}>{a.meta}</div>
          </div>
          <div style={{ display: "flex", gap: 5 }}>
            <Btn sm ghost>Edit</Btn>
            <Btn sm variant="danger">Delete</Btn>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KbSection;
