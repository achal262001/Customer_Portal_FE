import { C, Card, CardTitle, Btn, SHeader, Toggle } from "./shared";

const SettingsSection = () => {
  const SettingsRow = ({ label, sub, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `0.5px solid ${C.border}` }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 2 }}>{sub}</div>
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <SHeader title="System settings">
        <Btn sm variant="primary">Save</Btn>
      </SHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Notifications</CardTitle>
          <SettingsRow label="Email alerts on SLA breach" sub="Admin receives email when breach triggered"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Slack integration" sub="Post escalation alerts to #support-alerts"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Daily digest email" sub="Summary sent to admin at 9:00 AM IST"><Toggle defaultOn={false} /></SettingsRow>
          <SettingsRow label="Client notifications" sub="Auto-notify clients on ticket status change"><Toggle defaultOn /></SettingsRow>
        </Card>
        <Card>
          <CardTitle>AI features</CardTitle>
          <SettingsRow label="Triage agent" sub="Auto-categorise and pre-fill raised tickets"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Similar ticket suggestions" sub="Show related tickets on raise screen"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="KB deflection" sub="Show KB matches before ticket submission"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Auto-generate KB articles" sub="Create draft articles from closed tickets"><Toggle defaultOn={false} /></SettingsRow>
          <SettingsRow label="Weekly project summaries" sub="AI generates and sends project digests"><Toggle defaultOn /></SettingsRow>
        </Card>
        <Card>
          <CardTitle>Access & security</CardTitle>
          <SettingsRow label="SSO authentication" sub="Enforce Google / Azure AD login"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Two-factor auth" sub="Required for admin & SPOC accounts"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="Audit logging" sub="Log all admin actions with timestamps"><Toggle defaultOn /></SettingsRow>
          <SettingsRow label="IP allow-list" sub="Restrict admin access by IP range"><Toggle defaultOn={false} /></SettingsRow>
        </Card>
        <Card>
          <CardTitle>Danger zone</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
            <button style={{ textAlign: "left", width: "100%", display: "flex", justifyContent: "space-between", padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", background: "transparent", border: `0.5px solid ${C.borderSecondary}`, color: C.text }}>
              Export all data <span style={{ color: C.textTertiary }}>CSV / JSON</span>
            </button>
            <button style={{ textAlign: "left", width: "100%", display: "flex", justifyContent: "space-between", padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", background: "transparent", border: `0.5px solid ${C.borderSecondary}`, color: C.text }}>
              Reset demo data <span style={{ color: C.textTertiary }}>Restore defaults</span>
            </button>
            <button style={{ textAlign: "left", width: "100%", padding: "7px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 500, fontFamily: "inherit", background: C.dangerBg, color: C.danger, border: "none" }}>
              Purge closed tickets older than 90d
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsSection;
