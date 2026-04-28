import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getAllTickets } from "../../Supportive Files/api";
import { toArray, normalizeTicket, Card, TH, TD, Spinner, ModTag, SevTag, StatTag, TicketDetailDialog } from "./shared";

const AllTicketsPanel = () => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [filterMod, setFilterMod] = useState("");
  const [filterSev, setFilterSev] = useState("");
  const [filterStat, setFilterStat] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAllTickets({ module: filterMod || undefined, severity: filterSev || undefined, status: filterStat || undefined })
      .then(res => { if (active) { setAllTickets(toArray(res).map(normalizeTicket)); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filterMod, filterSev, filterStat]);

  const filtered = allTickets.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
  );

  const selSx = {
    fontSize: 13, py: "6px", px: "10px", borderRadius: "6px",
    border: `0.5px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    cursor: "pointer", outline: "none",
  };

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
          {["DPAI", "TMS", "DS", "EDM"].map(m => <option key={m}>{m}</option>)}
        </Box>
        <Box component="select" value={filterSev} onChange={e => setFilterSev(e.target.value)} sx={selSx}>
          <option value="">All severities</option>
          {["S1", "S2", "S3"].map(s => <option key={s}>{s}</option>)}
        </Box>
        <Box component="select" value={filterStat} onChange={e => setFilterStat(e.target.value)} sx={selSx}>
          <option value="">All statuses</option>
          {["Open", "In Progress", "Closed"].map(s => <option key={s}>{s}</option>)}
        </Box>
      </Box>

      {loading ? <Spinner /> : (
        <Card sx={{ overflowX: "auto" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
            <Box component="thead">
              <Box component="tr">
                {["Id", "Title", "Date", "Module", "Env", "Severity", "Category", "Status"].map(h => <TH key={h}>{h}</TH>)}
              </Box>
            </Box>
            <Box component="tbody">
              {filtered.map(t => (
                <Box component="tr" key={t.id} onClick={() => setSelectedTicket(t)} sx={{ cursor: "pointer", "&:hover td": { backgroundColor: theme.palette.action.hover }, "&:last-child td": { borderBottom: "none" } }}>
                  <TD sx={{ color: theme.palette.text.disabled, fontSize: 12 }}>{t.id}</TD>
                  <TD sx={{ minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 500, fontSize: 13, color: theme.palette.text.primary }}>{t.title}</Typography>
                  </TD>
                  <TD sx={{ color: theme.palette.text.disabled, fontSize: 12, whiteSpace: "nowrap" }}>{t.date}</TD>
                  <TD><ModTag m={t.module} /></TD>
                  <TD sx={{ color: theme.palette.text.secondary }}>{t.env}</TD>
                  <TD><SevTag sev={t.sev} /></TD>
                  <TD sx={{ color: theme.palette.text.secondary, fontSize: 12 }}>{t.cat}</TD>
                  <TD><StatTag status={t.status} /></TD>
                </Box>
              ))}
            </Box>
          </Box>
          {filtered.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6, color: theme.palette.text.disabled, fontSize: 14 }}>No tickets match your filters</Box>
          )}
        </Card>
      )}
    </Box>
  );
};

export default AllTicketsPanel;
