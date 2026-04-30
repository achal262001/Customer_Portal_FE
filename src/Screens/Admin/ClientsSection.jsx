import { useState } from "react";
import { getTicketsByClient, getAllClients } from "../../Supportive Files/api";
import { C, Badge, Btn, SHeader, Spinner, useFetch, toArray, normalizeAdminTicket, ClientTicketsPopup } from "./shared";

const ClientsSection = () => {
  const [viewClient, setViewClient] = useState(null);
  const [viewTickets, setViewTickets] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);

  const handleViewTickets = async (cl) => {
    setViewClient(cl);
    setViewTickets([]);
    setViewLoading(true);
    try {
      const res = await getTicketsByClient(cl.id);
      setViewTickets(toArray(res).map(normalizeAdminTicket));
    } catch (_) {}
    setViewLoading(false);
  };

  const closePopup = () => { setViewClient(null); setViewTickets([]); setViewLoading(false); };
  const { data: clientsRaw, loading } = useFetch(() => getAllClients());

  const STATIC_CLIENTS = [
    { code: "C1", name: "Client 1", since: "Since Jan 2024", avSx: { background: "#FBEAF0", color: "#72243E" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, spoc: "Ravi M.", mods: "DPAI, DS", stats: [{ val: 11, label: "Open", color: C.blue }, { val: 2, label: "At risk", color: C.danger }, { val: 9, label: "Closed", color: C.success }], border: "none" },
    { code: "C2", name: "Client 2", since: "Since Mar 2024", avSx: { background: C.blueBg, color: C.blueDark }, health: { label: "At risk", bg: C.dangerBg, color: C.danger }, spoc: "Nikita K.", mods: "DPAI, TMS", stats: [{ val: 14, label: "Open", color: C.blue }, { val: 4, label: "At risk", color: C.danger }, { val: 12, label: "Closed", color: C.success }], border: `2px solid #378ADD` },
    { code: "C3", name: "Client 3", since: "Since Jul 2024", avSx: { background: C.successBg, color: "#27500A" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, spoc: "Priya S.", mods: "TMS, DS", stats: [{ val: 9, label: "Open", color: C.blue }, { val: 1, label: "At risk", color: C.warn }, { val: 6, label: "Closed", color: C.success }], border: "none" },
  ];

  const CLIENT_META = [
    { avSx: { background: "#FBEAF0", color: "#72243E" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, border: "none" },
    { avSx: { background: C.blueBg, color: C.blueDark }, health: { label: "At risk", bg: C.dangerBg, color: C.danger }, border: `2px solid #378ADD` },
    { avSx: { background: C.successBg, color: "#27500A" }, health: { label: "Healthy", bg: C.successBg, color: C.success }, border: "none" },
  ];

  const rawClients = toArray(clientsRaw);
  const clients = rawClients.length > 0
    ? rawClients.map((c, i) => {
        const meta = CLIENT_META[i % CLIENT_META.length];
        const name = c.name || c.clientName || `Client ${i + 1}`;
        return {
          code: name.slice(0, 2).toUpperCase(),
          name,
          id: c.id ?? c.clientId,
          since: c.createdAt ? `Since ${c.createdAt.split("T")[0]}` : c.since || "—",
          avSx: meta.avSx,
          health: meta.health,
          spoc: c.spoc?.name || c.deliverySpoc?.name || c.spoc || "—",
          mods: Array.isArray(c.modules) ? c.modules.join(", ") : c.modules || "—",
          stats: [
            { val: c.openTickets ?? "—", label: "Open", color: C.blue },
            { val: c.atRisk ?? "—", label: "At risk", color: C.danger },
            { val: c.closedTickets ?? "—", label: "Closed", color: C.success },
          ],
          border: meta.border,
        };
      })
    : STATIC_CLIENTS;

  return (
    <div>
      <ClientTicketsPopup client={viewClient} tickets={viewTickets} loading={viewLoading} onClose={closePopup} />
      <SHeader title="Client management">
        <Btn sm variant="primary">+ Add client</Btn>
      </SHeader>
      {loading && <Spinner />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {clients.map((cl) => (
          <div key={cl.code} style={{ background: C.bg, border: cl.border || `0.5px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, ...cl.avSx }}>{cl.code}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{cl.name}</div>
                  <div style={{ fontSize: 11, color: C.textSecondary }}>{cl.since}</div>
                </div>
              </div>
              <Badge style={{ background: cl.health.bg, color: cl.health.color }}>{cl.health.label}</Badge>
            </div>
            <div style={{ fontSize: 12, color: C.textSecondary, marginBottom: 6 }}>Client SPOC: {cl.spoc} · Modules: {cl.mods}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 10 }}>
              {cl.stats.map((s) => (
                <div key={s.label} style={{ background: C.bgSecondary, borderRadius: 6, padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: C.textTertiary }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
              <Btn sm ghost onClick={() => handleViewTickets(cl)}>View tickets</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsSection;
