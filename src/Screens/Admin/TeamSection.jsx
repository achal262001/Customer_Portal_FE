import { useState } from "react";
import { getAllTeams, editTeam } from "../../Supportive Files/api";
import {
  C, Badge, Card, CardTitle, Btn, SHeader, Spinner, ProgressBar,
  useFetch, toArray, normalizeTeamTicket, ClientTicketsPopup,
} from "./shared";

const TeamSection = () => {
  const [fetchKey, setFetchKey] = useState(0);
  const { data: teamsRaw, loading } = useFetch(() => getAllTeams(), [fetchKey]);
  const [viewTeam, setViewTeam] = useState(null);
  const [editTeamModal, setEditTeamModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const closeEdit = () => { setEditTeamModal(null); setEditForm({}); setEditError(""); };

  const handleEdit = (team) => {
    setEditTeamModal(team);
    setEditForm({ name: team.name, leadUserId: team.leadUserId, departmentId: team.departmentId, clientId: team.clientId });
    setEditError("");
  };

  const handleSaveEdit = async () => {
    if (!editTeamModal) return;
    setEditSaving(true);
    setEditError("");
    try {
      await editTeam(editTeamModal.teamId, {
        name: editForm.name,
        leadUserId: Number(editForm.leadUserId),
        departmentId: Number(editForm.departmentId),
        clientId: Number(editForm.clientId),
      });
      closeEdit();
      setFetchKey(k => k + 1);
    } catch (_) {
      setEditError("Failed to save. Please try again.");
    }
    setEditSaving(false);
  };

  const MEMBER_META = [
    { avSx: { background: C.blueBg, color: C.blueDark }, wColor: C.red },
    { avSx: { background: "#FBEAF0", color: "#72243E" }, wColor: C.orange },
    { avSx: { background: C.successBg, color: "#27500A" }, wColor: "#378ADD" },
    { avSx: { background: "#E1F5EE", color: "#085041" }, wColor: C.orange },
  ];

  const mkInitials = (name = "") => name.split(/\s+/).map(w => w[0] || "").join("").slice(0, 2).toUpperCase();

  const rawTeams = toArray(teamsRaw);

  const STATIC_TEAMS = [
    { teamId: null, name: "DPAI", leadUserName: "Nikita", departmentName: "Engineering", clientName: "Client 1" },
    { teamId: null, name: "DS", leadUserName: "Mahesh", departmentName: "Engineering", clientName: "Client 3" },
    { teamId: null, name: "EDM", leadUserName: "Kavya", departmentName: "Engineering", clientName: "Client 2" },
  ];

  const teams = rawTeams.length > 0
    ? rawTeams.map((u, i) => {
        const meta = MEMBER_META[i % MEMBER_META.length];
        const ticketCount = Array.isArray(u.tickets) ? u.tickets.length : 0;
        return {
          teamId: u.teamId,
          leadUserId: u.leadUserId,
          leadUserName: u.leadUserName || "—",
          departmentId: u.departmentId,
          departmentName: u.departmentName || "—",
          clientId: u.clientId,
          clientName: u.clientName || "—",
          name: u.name || `Team ${i + 1}`,
          initials: mkInitials(u.name || `T${i + 1}`),
          avSx: meta.avSx,
          workload: Math.min(ticketCount * 15, 100),
          wColor: meta.wColor,
          tickets: ticketCount,
          rawTickets: Array.isArray(u.tickets) ? u.tickets : [],
        };
      })
    : STATIC_TEAMS.map((t, i) => {
        const meta = MEMBER_META[i % MEMBER_META.length];
        return { ...t, leadUserId: null, departmentId: null, clientId: null, initials: mkInitials(t.name), avSx: meta.avSx, workload: 0, wColor: meta.wColor, tickets: 0, rawTickets: [] };
      });

  const viewTickets = viewTeam ? viewTeam.rawTickets.map(normalizeTeamTicket) : [];

  return (
    <div>
      <ClientTicketsPopup
        client={viewTeam ? { id: viewTeam.teamId, code: viewTeam.initials, name: viewTeam.name, avSx: viewTeam.avSx, spoc: viewTeam.leadUserName } : null}
        tickets={viewTickets}
        loading={false}
        onClose={() => setViewTeam(null)}
      />

      {editTeamModal && (
        <div onClick={closeEdit} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 420, background: C.bg, borderRadius: 12, boxShadow: "0 16px 48px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Edit Team</div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Team ID: {editTeamModal.teamId}</div>
              </div>
              <button onClick={closeEdit} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSecondary, fontSize: 20, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ padding: "20px" }}>
              {[
                { label: "Team Name", key: "name", type: "text", hint: "" },
                { label: "Lead User ID", key: "leadUserId", type: "number", hint: `Current: ${editTeamModal.leadUserName}` },
                { label: "Department ID", key: "departmentId", type: "number", hint: `Current: ${editTeamModal.departmentName}` },
                { label: "Client ID", key: "clientId", type: "number", hint: `Current: ${editTeamModal.clientName}` },
              ].map(({ label, key, type, hint }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.textSecondary, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {label}{hint && <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6, color: C.textTertiary }}>{hint}</span>}
                  </label>
                  <input type={type} value={editForm[key] ?? ""} onChange={(e) => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 10px", fontSize: 13, border: `1px solid ${C.border}`, borderRadius: 7, background: C.bg, color: C.text, boxSizing: "border-box", outline: "none" }} />
                </div>
              ))}
              {editError && <div style={{ fontSize: 12, color: C.danger, marginBottom: 10 }}>{editError}</div>}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <Btn ghost sm onClick={closeEdit}>Cancel</Btn>
                <Btn variant="primary" sm onClick={handleSaveEdit} style={editSaving ? { opacity: 0.6, pointerEvents: "none" } : {}}>
                  {editSaving ? "Saving…" : "Save changes"}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      <SHeader title="Team management">
        <Btn sm variant="primary">+ Add member</Btn>
      </SHeader>
      {loading && <Spinner />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <div>
          {teams.map((team) => (
            <div key={team.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, border: `0.5px solid ${C.border}`, borderRadius: 10, background: C.bg, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0, ...team.avSx }}>{team.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{team.name}</div>
                <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>Lead: {team.leadUserName}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                  <Badge style={{ background: "#EEEDFE", color: "#3C3489" }}>{team.departmentName}</Badge>
                  <Badge style={{ background: C.bgSecondary, color: C.textSecondary }}>{team.clientName}</Badge>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Btn sm ghost onClick={() => setViewTeam(team)}>Tickets ({team.tickets})</Btn>
                <Btn sm ghost onClick={() => handleEdit(team)}>Edit</Btn>
              </div>
            </div>
          ))}
        </div>

        <Card>
          <CardTitle>Team workload</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {teams.map((team) => (
              <div key={team.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span>{team.name}</span><span>{team.tickets} tickets</span>
                </div>
                <ProgressBar pct={team.workload} color={team.wColor} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: `0.5px solid ${C.border}` }}>
            <CardTitle>Role permissions</CardTitle>
            <div style={{ fontSize: 12 }}>
              {[
                { badge: "Admin", bg: C.dangerBg, color: C.danger, desc: "Full access — all clients, config, team" },
                { badge: "SPOC", bg: "#EEEDFE", color: "#3C3489", desc: "Assigned client — tickets, projects, KB" },
                { badge: "Agent", bg: "#E1F5EE", color: "#085041", desc: "View & update assigned tickets only" },
              ].map((r, i) => (
                <div key={r.badge} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none", alignItems: "center" }}>
                  <Badge style={{ background: r.bg, color: r.color }}>{r.badge}</Badge>
                  <span style={{ color: C.textSecondary, fontSize: 12 }}>{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamSection;
