import { getTicketsByClientDashboard, getTicketsByCategory, getTicketsByModule } from "../../Supportive Files/api";
import { C, Card, CardTitle, Btn, SHeader, useFetch, toArray } from "./shared";

const AnalyticsSection = () => {
  const { data: clientChartRaw } = useFetch(() => getTicketsByClientDashboard());
  const { data: categoryChartRaw } = useFetch(() => getTicketsByCategory());
  const { data: moduleChartRaw } = useFetch(() => getTicketsByModule());

  const SimpleBarChart = ({ data, colorFn }) => {
    const max = Math.max(...data.map((d) => d.val), 1);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 110, marginBottom: 6 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 3, height: "100%" }}>
            <div style={{ fontSize: 10, fontWeight: 500 }}>{d.val}</div>
            <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: colorFn ? colorFn(d) : "#378ADD", height: `${(d.val / max) * 100}%` }} />
            </div>
            <div style={{ fontSize: 10, color: C.textTertiary }}>{d.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const CLIENT_COLORS = ["#D4537E", "#378ADD", "#1D9E75", "#EF9F27", "#9C6FDE"];
  const SEV_COLORS = { S1: C.red, S2: C.orange, S3: C.green };

  const rawClient = toArray(clientChartRaw);
  const rawCategory = toArray(categoryChartRaw);
  const rawModule = toArray(moduleChartRaw);

  const clientData = rawClient.length > 0
    ? rawClient.map((d, i) => ({ label: d.name || d.client || d.clientName || `C${i + 1}`, val: d.count ?? d.value ?? 0, color: CLIENT_COLORS[i % CLIENT_COLORS.length] }))
    : [{ label: "C1", val: 18, color: "#D4537E" }, { label: "C2", val: 22, color: "#378ADD" }, { label: "C3", val: 12, color: "#1D9E75" }];

  const monthData = [
    { label: "Oct", val: 6 }, { label: "Nov", val: 9 }, { label: "Dec", val: 14 },
    { label: "Jan", val: 11 }, { label: "Feb", val: 8 },
  ];

  const sevData = rawModule.length > 0
    ? rawModule.map(d => { const l = d.name || d.module || "—"; return { label: l, val: d.count ?? d.value ?? 0, color: SEV_COLORS[l] || "#378ADD" }; })
    : [{ label: "S1", val: 12, color: C.red }, { label: "S2", val: 16, color: C.orange }, { label: "S3", val: 10, color: C.green }];

  const totalCat = rawCategory.reduce((s, d) => s + (d.count ?? d.value ?? 0), 0) || 1;
  const categoryItems = rawCategory.length > 0
    ? rawCategory.map((d, i) => ({ color: CLIENT_COLORS[i % CLIENT_COLORS.length], label: `${d.name || d.category || "—"} ${Math.round(((d.count ?? d.value ?? 0) / totalCat) * 100)}%` }))
    : [{ color: "#378ADD", label: "Env issue 42%" }, { color: C.orange, label: "Bug 25%" }, { color: C.green, label: "Change req 20%" }, { color: "#D4537E", label: "Other 13%" }];

  return (
    <div>
      <SHeader title="Analytics">
        <Btn sm ghost>Export CSV</Btn>
      </SHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Tickets by client</CardTitle>
          <SimpleBarChart data={clientData} colorFn={(d) => d.color} />
        </Card>
        <Card>
          <CardTitle>Category mix</CardTitle>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <svg width={80} height={80} viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="28" fill="none" stroke="#E6F1FB" strokeWidth="14" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="#378ADD" strokeWidth="14" strokeDasharray="53 126" strokeDashoffset="0" transform="rotate(-90 40 40)" />
              <circle cx="40" cy="40" r="28" fill="none" stroke={C.orange} strokeWidth="14" strokeDasharray="32 126" strokeDashoffset="-53" transform="rotate(-90 40 40)" />
              <circle cx="40" cy="40" r="28" fill="none" stroke={C.green} strokeWidth="14" strokeDasharray="25 126" strokeDashoffset="-85" transform="rotate(-90 40 40)" />
              <circle cx="40" cy="40" r="28" fill="none" stroke="#D4537E" strokeWidth="14" strokeDasharray="16 126" strokeDashoffset="-110" transform="rotate(-90 40 40)" />
            </svg>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
              {categoryItems.map((ci) => (
                <div key={ci.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ci.color, flexShrink: 0 }} />
                  <span>{ci.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardTitle>Monthly volume</CardTitle>
          <SimpleBarChart data={monthData} colorFn={() => "#378ADD"} />
        </Card>
        <Card>
          <CardTitle>Module breakdown</CardTitle>
          <SimpleBarChart data={sevData} colorFn={(d) => d.color} />
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsSection;
