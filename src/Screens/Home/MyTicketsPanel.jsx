import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getTicketsByClient } from "../../Supportive Files/api";
import { toArray, normalizeTicket, Card, TH, TD, ModTag, SevTag, StatTag, TicketDetailDialog } from "./shared";

const LAST_UPDATES = ["2h ago", "Yesterday", "3d ago", "1d ago", "5h ago", "4h ago", "6d ago", "3h ago", "2d ago", "1h ago"];

const MyTicketsPanel = () => {
  const theme = useTheme();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [search, setSearch] = useState("");
  const [filterMod, setFilterMod] = useState("");
  const [filterSev, setFilterSev] = useState("");
  const [filterStat, setFilterStat] = useState("");
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const selSx = {
    fontSize: 13, border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px",
    px: 1.2, py: "6px", backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary,
    outline: "none", cursor: "pointer", fontFamily: "inherit",
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTicketsByClient(2)
      .then(res => { if (active) { setAllTickets(toArray(res).map(normalizeTicket)); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const myTickets = allTickets
    .filter(t => t.status !== "Closed")
    .filter(t =>
      (!search || t.title.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)) &&
      (!filterMod || t.module === filterMod) &&
      (!filterSev || t.sev === filterSev) &&
      (!filterStat || t.status === filterStat)
    );

  return (
    <Box>
      <TicketDetailDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, flex: 1, minWidth: 160, backgroundColor: theme.palette.background.paper, border: `0.5px solid ${theme.palette.divider}`, borderRadius: "6px", px: 1.2, py: "6px" }}>
          <SearchIcon sx={{ fontSize: 16, color: theme.palette.text.disabled, flexShrink: 0 }} />
          <Box component="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" sx={{ border: "none", outline: "none", fontSize: 13, color: theme.palette.text.primary, background: "transparent", width: "100%", fontFamily: "inherit" }} />
        </Box>
        <Box component="select" value={filterMod} onChange={e => setFilterMod(e.target.value)} sx={selSx}>
          <option value="">All modules</option>
          {["DPAI", "DS", "TMS"].map(m => <option key={m}>{m}</option>)}
        </Box>
        <Box component="select" value={filterSev} onChange={e => setFilterSev(e.target.value)} sx={selSx}>
          <option value="">All severities</option>
          {["S1", "S2", "S3"].map(s => <option key={s}>{s}</option>)}
        </Box>
        <Box component="select" value={filterStat} onChange={e => setFilterStat(e.target.value)} sx={selSx}>
          <option value="">All statuses</option>
          {["Open", "In Progress"].map(s => <option key={s}>{s}</option>)}
        </Box>
      </Box>

      <Card sx={{ overflowX: "auto" }}>
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr">
              {["ID", "Title", "Module", "Severity", "Status", "Last update"].map(h => <TH key={h}>{h}</TH>)}
            </Box>
          </Box>
          <Box component="tbody">
            {myTickets.length === 0 ? (
              <Box component="tr">
                <Box component="td" colSpan={6} sx={{ textAlign: "center", py: 5, color: theme.palette.text.disabled, fontSize: 13 }}>
                  {loading ? "Loading…" : "No tickets match your filters."}
                </Box>
              </Box>
            ) : (
              myTickets.map((t, i) => (
                <Box component="tr" key={t.id} onClick={() => setSelectedTicket(t)} sx={{ cursor: "pointer", "&:hover td": { backgroundColor: theme.palette.action.hover }, "&:last-child td": { borderBottom: "none" } }}>
                  <TD sx={{ color: theme.palette.text.disabled, fontSize: 12 }}>{t.id}</TD>
                  <TD><Typography sx={{ fontWeight: 500, fontSize: 13, color: theme.palette.text.primary }}>{t.title}</Typography></TD>
                  <TD><ModTag m={t.module} /></TD>
                  <TD><SevTag sev={t.sev} /></TD>
                  <TD><StatTag status={t.status} /></TD>
                  <TD sx={{ color: theme.palette.text.disabled, fontSize: 12 }}>{LAST_UPDATES[i % LAST_UPDATES.length]}</TD>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default MyTicketsPanel;
