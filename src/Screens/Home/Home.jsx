import React from "react";
import { Box, Grid, Paper, Typography } from "@mui/material";

const features = [
  "Ticket Creation",
  "Customer Dashboard",
  "Communication Hub",
  "AI Powered Features",
  "Project Overview",
];

const Home = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 4,
      }}
    >
      <Typography variant="h4" mb={3}>
        Home Dashboard
      </Typography>

      <Grid container spacing={3}>
        {features.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
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
                {item}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;