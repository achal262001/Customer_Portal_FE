import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../../Supportive Files/apis";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const HandleInputChange = (e, setter) => {
    setter(e.target.value);
  }
  const HandleSubmit = async () => {
    const response = await handleLogin(username, password);
    console.log("Login response: from HandleSubmit", response);
    if (response) {
      console.log("Login successful:", response);
      navigate("/home");
    }
  };
  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "#f5f5f5", // off-white
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: 350,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" mb={2}>
          Login
        </Typography>

        <TextField
          label="Email or Username"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => HandleInputChange(e, setUsername)}
        />

        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => HandleInputChange(e, setPassword)}
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2, py: 1.2 }}
          onClick={HandleSubmit}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
}
export default Login;