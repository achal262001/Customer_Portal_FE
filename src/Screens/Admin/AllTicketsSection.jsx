import { useState, useEffect, useContext } from "react";
import {
  getAllTickets, getAllClients, getAllModules, getAllSeverities,
  getAllTicketStatuses, getAllUsers, getAllTeams,
} from "../../Supportive Files/api";
import {
  C, Card, Btn, SHeader, Spinner, useFetch, toArray,
  normalizeAdminTicket, ClientBadge, ModBadge, SevBadge, StatBadge,
  TicketDetailDialog, NewTicketCtx,
} from "./shared";

const AllTicketsSection = () => {
  const openNewTicket = useContext(NewTicketCtx);
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterMod, setFilterMod] = useState("");
  const [filterSev, setFilterSev] = useState("");
  const [filterStat, setFilterStat] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkVisible, setBulkVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: ticketsRaw, loading } = useFetch(
    () => getAllTickets({ module: filterMod || undefined, severity: filterSev || undefined, status: filterStat || undefined }),
    [filterMod, filterSev, filterStat]
  );
  const tickets = toArray(ticketsRaw).map(normalizeAdminTicket);

  const [clients, setClients] = useState([]);
  const [modules, setModules] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    getAllClients().then(res => setClients(toArray(res))).catch(() => {});
    getAllModules().then(res => setModules(toArray(res))).catch(() => {});
    getAllSeverities().then(res => setSeverities(toArray(res))).catch(() => {});
    getAllTicketStatuses().then(res => setStatuses(toArray(res))).catch(() => {});
    getAllUsers().then(res => setUsers(toArray(res))).catch(() => {});
    getAllTeams().then(res => setTeams(toArray(res))).catch(() => {});
  }, []);

  const sevNameToLabel = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("1") || n.includes("high")) return "S1";
    if (n.includes("2") || n.includes("moderate")) return "S2";
    return "S3";
  };

  const filtered = tickets.filter((t) => {
    const s = search.toLowerCase();
    return (
      (!s || t.title.toLowerCase().includes(s) || t.id.toLowerCase().includes(s)) &&
      (!filterClient || t?.projects?.client?.name === filterClient) &&
      (!filterMod || t.mod === filterMod) &&
      (!filterSev || t.sev === sevNameToLabel(filterSev)) &&
      (!filterStat || t.status === filterStat)
    );
  });

  const toggleAll = (checked) => setSelected(checked ? new Set(filtered.map(t => t.id)) : new Set());

  const selectSx = { fontSize: 13, padding: "6px 10px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.text };

  return (
    <div>
      <TicketDetailDialog ticket={selectedTicket} users={users} teams={teams} onClose={() => setSelectedTicket(null)} />
      <SHeader title="All tickets">
        <Btn sm ghost onClick={() => setBulkVisible(!bulkVisible)}>Bulk actions</Btn>
        <Btn sm variant="primary" onClick={openNewTicket}>+ New ticket</Btn>
      </SHeader>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12, alignItems: "center" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets…" style={{ ...selectSx, flex: 1, minWidth: 140 }} />
        <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} style={selectSx}>
          <option value="">All clients</option>
          {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={filterMod} onChange={(e) => setFilterMod(e.target.value)} style={selectSx}>
          <option value="">All modules</option>
          {modules.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
        </select>
        <select value={filterSev} onChange={(e) => setFilterSev(e.target.value)} style={selectSx}>
          <option value="">All severities</option>
          {severities.map(s => <option key={s.id} value={s.severityId}>{s.label}</option>)}
        </select>
        <select value={filterStat} onChange={(e) => setFilterStat(e.target.value)} style={selectSx}>
          <option value="">All statuses</option>
          {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
      </div>

      {bulkVisible && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.blueBg, borderRadius: 6, marginBottom: 10, fontSize: 13, color: C.blue }}>
          <span>{selected.size} selected</span>
          <select style={{ ...selectSx, fontSize: 12, padding: "4px 8px" }}>
            <option value="">Assign to…</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <Btn sm variant="success">Close selected</Btn>
          <Btn sm variant="warn">Escalate</Btn>
          <Btn sm variant="danger">Delete</Btn>
        </div>
      )}

      {loading ? <Spinner /> : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Ticket", "Client", "Module", "Severity", "Status", "SPOC", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "center", padding: "8px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 11, fontWeight: 500, color: C.textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} onMouseEnter={(e) => e.currentTarget.style.background = C.bgSecondary} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: C.textTertiary, marginTop: 1 }}>Id-{t.id} · {t.date}</div>
                    </td>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><ClientBadge client={t.client} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><ModBadge mod={t.mod} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><SevBadge sev={t.sev} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}><StatBadge status={t.status} /></td>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}`, fontSize: 12 }}>{t.spoc}</td>
                    <td style={{ padding: "9px 10px", borderBottom: `0.5px solid ${C.border}` }}>
                      <Btn sm ghost onClick={() => setSelectedTicket(t)}>View</Btn>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "24px 0", color: C.textTertiary, fontSize: 13 }}>No tickets match your filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AllTicketsSection;
