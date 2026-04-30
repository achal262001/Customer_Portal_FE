import { C, Card, CardTitle, Badge, Btn, SHeader, Toggle, SlaTrack } from "./shared";

const SlaSection = () => {
  const SlaRule = ({ label, sub, children }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 10, border: `0.5px solid ${C.border}`, borderRadius: 6, background: C.bg, marginBottom: 6 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 11, color: C.textSecondary, marginTop: 2 }}>{sub}</div>
      </div>
      {children}
    </div>
  );

  const SlaInput = ({ defaultValue }) => (
    <input defaultValue={defaultValue}
      style={{ width: 70, padding: "5px 8px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, fontSize: 13, textAlign: "center", background: C.bg, color: C.text }} />
  );

  return (
    <div>
      <SHeader title="SLA configuration">
        <Btn sm variant="primary">Save changes</Btn>
      </SHeader>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
        <Card>
          <CardTitle>Response time (hours)</CardTitle>
          <SlaRule label={<><Badge style={{ background: C.dangerBg, color: C.danger }}>S1 — Critical</Badge></>} sub="First response target"><SlaInput defaultValue="2" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.warnBg, color: C.warn }}>S2 — Moderate</Badge></>} sub="First response target"><SlaInput defaultValue="8" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.successBg, color: C.success }}>S3 — Low</Badge></>} sub="First response target"><SlaInput defaultValue="24" /></SlaRule>
        </Card>
        <Card>
          <CardTitle>Resolution time (hours)</CardTitle>
          <SlaRule label={<><Badge style={{ background: C.dangerBg, color: C.danger }}>S1 — Critical</Badge></>} sub="Full resolution target"><SlaInput defaultValue="8" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.warnBg, color: C.warn }}>S2 — Moderate</Badge></>} sub="Full resolution target"><SlaInput defaultValue="48" /></SlaRule>
          <SlaRule label={<><Badge style={{ background: C.successBg, color: C.success }}>S3 — Low</Badge></>} sub="Full resolution target"><SlaInput defaultValue="120" /></SlaRule>
        </Card>
        <Card>
          <CardTitle>Escalation rules</CardTitle>
          <SlaRule label="Auto-escalate at breach %" sub="Triggers auto-assign to senior SPOC"><SlaInput defaultValue="80" /></SlaRule>
          <SlaRule label="Notify admin at %" sub="Sends admin alert notification"><SlaInput defaultValue="60" /></SlaRule>
          <SlaRule label="S1 re-alert interval (min)" sub="Repeat alerts until resolved"><SlaInput defaultValue="30" /></SlaRule>
        </Card>
        <Card>
          <CardTitle>Business hours</CardTitle>
          <SlaRule label="Start time" sub="SLA clock start (IST)"><SlaInput defaultValue="09:00" /></SlaRule>
          <SlaRule label="End time" sub="SLA clock end (IST)"><SlaInput defaultValue="18:00" /></SlaRule>
          <SlaRule label="Weekend SLA pause" sub="Exclude Sat & Sun from clock"><Toggle defaultOn={true} /></SlaRule>
        </Card>
      </div>
    </div>
  );
};

export default SlaSection;
