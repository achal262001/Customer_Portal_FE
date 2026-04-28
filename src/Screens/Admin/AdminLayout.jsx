import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppTheme } from "../../ThemeContext";
import { logout } from "../../Supportive Files/api";
import { C, ToastContainer, NAV_ITEMS, NewTicketCtx, NewTicketModal } from "./shared";
import DashboardSection from "./DashboardSection";
import AllTicketsSection from "./AllTicketsSection";
import EscalationsSection from "./EscalationsSection";
import ClientsSection from "./ClientsSection";
import TeamSection from "./TeamSection";
import AnalyticsSection from "./AnalyticsSection";
import ProjectsSection from "./ProjectsSection";
import SlaSection from "./SlaSection";
import SettingsSection from "./SettingsSection";

const AdminLayout = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const navigate = useNavigate();
  const { mode, toggleTheme } = useAppTheme();

  const handleLogout = useCallback(async () => {
    try { await logout(); } catch (_) {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const openNewTicket = useCallback(() => setNewTicketOpen(true), []);

  const sections = {
    dashboard: <DashboardSection />,
    tickets: <AllTicketsSection />,
    escalated: <EscalationsSection />,
    clients: <ClientsSection />,
    team: <TeamSection />,
    analytics: <AnalyticsSection />,
    projects: <ProjectsSection />,
    sla: <SlaSection />,
    settings: <SettingsSection />,
  };

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: C.text, display: "flex", flexDirection: "column", height: "100vh", fontSize: 14 }}>
      <ToastContainer />
      {newTicketOpen && <NewTicketModal onClose={() => setNewTicketOpen(false)} />}

      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: `0.5px solid ${C.border}`, background: C.bg, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#185FA5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="#fff" strokeWidth={2.2}>
              <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /><path d="M16 3H8v4h8V3z" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 500 }}>Relay</span>
          <span style={{ fontSize: 11, fontWeight: 500, background: C.dangerBg, color: C.danger, padding: "2px 8px", borderRadius: 4, marginLeft: 6 }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={toggleTheme} title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
            style={{ width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {mode === "light" ? (
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
            )}
          </button>
          <div style={{ position: "relative", cursor: "pointer", width: 28, height: 28, borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke={C.textSecondary} strokeWidth={2}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, position: "absolute", top: 4, right: 4 }} />
          </div>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#185FA5", color: "#fff", fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>SA</div>
          <span style={{ fontSize: 13, color: C.textSecondary }}>Super Admin</span>
          <button onClick={handleLogout}
            style={{ marginLeft: 4, display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 6, border: `0.5px solid ${C.borderSecondary}`, background: C.bg, color: C.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FCEBEB"; e.currentTarget.style.color = "#A32D2D"; e.currentTarget.style.borderColor = "#FECACA"; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.bg; e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.borderColor = C.borderSecondary; }}>
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            Logout
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 180, borderRight: `0.5px solid ${C.border}`, background: C.bg, flexShrink: 0, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map((group) => (
            <div key={group.section}>
              <div style={{ fontSize: 10, fontWeight: 500, color: C.textTertiary, padding: "12px 14px 4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {group.section}
              </div>
              {group.items.map((item) => {
                const isActive = activeSection === item.key;
                return (
                  <div key={item.key} onClick={() => setActiveSection(item.key)}
                    style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", fontSize: 13, cursor: "pointer", color: isActive ? "#185FA5" : C.textSecondary, background: isActive ? C.blueBg : "transparent", borderLeft: isActive ? "2px solid #185FA5" : "2px solid transparent", fontWeight: isActive ? 500 : 400, transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = C.bgSecondary; e.currentTarget.style.color = C.text; } }}
                    onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSecondary; } }}>
                    {item.icon}
                    {item.label}
                    {item.count !== undefined && (
                      <span style={{ marginLeft: "auto", fontSize: 11, padding: "1px 6px", borderRadius: 10, ...(item.countStyle || { background: C.dangerBg, color: C.danger }) }}>
                        {item.count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 18, background: C.bgTertiary, overflowY: "auto", minWidth: 0 }}>
          <NewTicketCtx.Provider value={openNewTicket}>
            {sections[activeSection]}
          </NewTicketCtx.Provider>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
