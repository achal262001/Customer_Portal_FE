import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Paper, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const features = [
  { label: "Ticket Creation", path: "/home/ticket" },
  { label: "Customer Dashboard", path: "/home/dashboard" },
  { label: "Communication Hub", path: "/home/communication-hub" },
  // { label: "Project Overview", path: "/home/project-overview" },
];

const Home = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const user = location.state?.user;
  console.log("User on Home:", user);

  const handleClick = (path) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundImage: "url('/BaseTheme.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        display: "flex",
        flexDirection: "column",
        padding: 4,
      }}
    >
      {/* Title — stays at the top */}
      <Typography variant="h4" fontWeight={700}>
        Welcome to Relay's Home
      </Typography>

      {/* Grid — centered against full viewport, offset by header height */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pb: "80px",
        }}
      >
        <Grid container spacing={3} sx={{ maxWidth: 900 }}>
          {features.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                elevation={3}
                onClick={() => handleClick(item.path)}
                sx={{
                  padding: 3,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    transform: "scale(1.03)",
                  },
                }}
              >
                <Typography variant="h6" align="center">
                  {item.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;
