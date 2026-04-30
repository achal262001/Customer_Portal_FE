import { useContext } from "react";
import { getDashboardStats, getRecentActivities, getTicketsByClientDashboard } from "../../Supportive Files/api";
import { C, Card, CardTitle, Btn, SHeader, Spinner, useFetch, toArray, NewTicketCtx } from "./shared";

const DashboardSection = () => {
  const openNewTicket = useContext(NewTicketCtx);
  const { data: statsRaw, loading: statsLoading } = useFetch(() => getDashboardStats());
  const { data: activitiesRaw, loading: activitiesLoading } = useFetch(() => getRecentActivities());
  const { data: clientChartRaw } = useFetch(() => getTicketsByClientDashboard());

  const stats = statsRaw || {};
  const activities = toArray(activitiesRaw);
  const clientChartApi = toArray(clientChartRaw);

  const metricCards = [
    { label: "Total tickets", val: stats.totalTickets ?? stats.totalOpen ?? "0", valStyle: { color: C.blue }, sub: "Across 3 clients" },
    { label: "SLA breaches today", val: stats.slaBreachesToday ?? stats.slaBreaches ?? "0", valStyle: { color: C.danger }, sub: "↑ 2 vs yesterday" },
    { label: "Avg resolution time", val: stats.avgResolution ?? stats.avgResolutionTime ?? "0", valStyle: {}, sub: "Target: 2.5d" },
    { label: "Closed this month", val: stats.closedThisMonth ?? "0", valStyle: { color: C.success }, sub: "+18% vs last month" },
    { label: "Escalations open", val: stats.escalationsOpen ?? stats.openEscalations ?? "1", valStyle: { color: C.warn }, sub: "Unassigned: 1" },
    { label: "Team utilisation", val: stats.teamUtilisation ?? "0", valStyle: {}, sub: "4 agents active" },
  ];

  const FALLBACK_ACTIVITY = [
    { color: C.red, text: "TKT-004 escalated to S1 by Nikita K.", time: "12 min ago · Client 2" },
    { color: "#378ADD", text: "TKT-018 assigned to Ravi M.", time: "34 min ago · Client 1" },
    { color: C.green, text: "TKT-009 closed — root cause: config error.", time: "1h ago · Client 3" },
    { color: C.orange, text: "TKT-013 SLA warning triggered.", time: "2h ago · Client 2" },
    { color: "#378ADD", text: "New ticket TKT-034 raised by Client 1.", time: "3h ago · Client 1" },
  ];

  const clientColors = { "Client 1": "#D4537E", "Client 2": "#378ADD", "Client 3": "#1D9E75" };

  return (
    <div>
      <SHeader title="Admin dashboard">
        <Btn sm ghost>Export report</Btn>
        <Btn sm variant="primary" onClick={openNewTicket}>+ New ticket</Btn>
      </SHeader>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 18 }}>
        {metricCards.map((mc) => (
          <div key={mc.label} style={{ background: C.bgSecondary, borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.textSecondary, marginBottom: 5 }}>{mc.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, ...mc.valStyle }}>{statsLoading ? "—" : mc.val}</div>
            <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 3 }}>{mc.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Tickets by client</CardTitle>
          {(() => {
            const data = clientChartApi.length > 0
              ? clientChartApi.map(d => ({ client: d.name || d.client || d.clientName || d.label || "—", count: d.count ?? d.value ?? 0 }))
              : [];
            const max = Math.max(...data.map(d => d.count), 1);
            return (
              <div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 130 }}>
                  {data.map(d => (
                    <div key={d.client} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 4, height: "100%" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.count}</div>
                      <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", height: `${(d.count / max) * 100}%`, borderRadius: "4px 4px 0 0", background: clientColors[d.client] || C.blue, minHeight: 8, transition: "height 0.3s" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1.5px solid ${C.border}`, marginBottom: 6 }} />
                <div style={{ display: "flex", gap: 16 }}>
                  {data.map(d => <div key={d.client} style={{ flex: 1, textAlign: "center", fontSize: 11, color: C.textTertiary, fontWeight: 500 }}>{d.client}</div>)}
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                  {data.map(d => (
                    <div key={d.client} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textSecondary }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: clientColors[d.client] || C.blue, flexShrink: 0 }} />
                      {d.client} — {d.count} tickets
                    </div>
                  ))}
                </div>
                {data.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 12, color: C.textTertiary }}>No data</div>}
              </div>
            );
          })()}
        </Card>

        <Card>
          <CardTitle>Recent activity</CardTitle>
          {activitiesLoading ? <Spinner /> : (
            activities.length > 0
              ? activities.slice(0, 5).map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < Math.min(activities.length, 5) - 1 ? `0.5px solid ${C.border}` : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#378ADD", flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.action || a.text || a.message || "—"}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>Performed By: {a.performedBy || a.timeAgo || ""} - at: {a?.timestamp}</div>
                  </div>
                </div>
              ))
              : FALLBACK_ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < FALLBACK_ACTIVITY.length - 1 ? `0.5px solid ${C.border}` : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardSection;
