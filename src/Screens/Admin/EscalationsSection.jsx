import { useState, useEffect } from "react";
import { getEscalationUnresolved } from "../../Supportive Files/api";
import { C, Card, Btn, SHeader, Spinner, toArray, AlertBanner, ClientBadge, SevBadge } from "./shared";

const EscalationsSection = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getEscalationUnresolved().then((res) => {
      if (active) { setEscalations(toArray(res)); setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const unassigned = escalations.filter(e => !e.spoc || e.spoc === "—").length;
  const selectSx = { fontSize: 12, padding: "4px 8px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text };

  return (
    <div>
      <SHeader title="Escalations">
        <Btn sm variant="primary">Assign all</Btn>
      </SHeader>
      {unassigned > 0 && (
        <AlertBanner type="warn">
          {unassigned} escalated ticket{unassigned > 1 ? "s are" : " is"} unassigned. Assign immediately to meet SLA.
        </AlertBanner>
      )}
      {loading ? <Spinner /> : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {["Ticket", "Client", "Severity", "SPOC", "Category", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ textAlign: "center", padding: "8px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 11, fontWeight: 500, color: C.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {escalations.map((e) => (
                <tr key={e.id} onMouseEnter={(ev) => ev.currentTarget.style.background = C.bgSecondary} onMouseLeave={(ev) => ev.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{e?.ticket?.title || e?.ticket}</div>
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><ClientBadge client={e?.ticket?.client?.name} /></td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><SevBadge sev={e?.ticket?.severity?.label} /></td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12, ...((!e.spoc || e.spoc === "—") ? { color: C.danger } : {}) }}>
                    {e.spoc && e.spoc !== "—" ? e.spoc : "Unassigned"}
                  </td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12 }}>{e?.ticket?.category?.name}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12, color: C.danger }}>{e?.ticket?.dateOfCreation}</td>
                  <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <select style={selectSx}>
                        <option value="">Assign…</option>
                        <option>Nikita K.</option><option>Ravi M.</option><option>Priya S.</option>
                      </select>
                      <Btn sm variant="success">Resolve</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {escalations.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px 0", color: C.textTertiary, fontSize: 13 }}>No escalated tickets</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default EscalationsSection;
