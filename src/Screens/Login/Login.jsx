import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormControl,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { login } from "../../Supportive Files/api";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const HandleSubmit = async () => {
    try {
      const response = await login(username, password);
      console.log(response);

      const token = response.token;
      const user  = response.user ?? response;
      const role  = user?.role?.name || user?.role || "";

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (role.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") HandleSubmit();
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Login Card */}
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 4,
          p: "40px 36px",
          width: 380,
          boxShadow: theme.palette.mode === "dark"
            ? "0 8px 32px rgba(0,0,0,0.5)"
            : "0 8px 32px rgba(0,0,0,0.12)",
          border: `0.5px solid ${theme.palette.divider}`,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #4a6741 60%, #c87941 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: 14, height: 14, backgroundColor: "#fff", borderRadius: "2px", transform: "rotate(45deg)" }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 20, color: theme.palette.text.primary, letterSpacing: 0.5 }}>
            Relay Customer Portal
          </Typography>
        </Box>

        {/* Heading */}
        <Typography variant="h5" fontWeight={700} sx={{ color: theme.palette.text.primary, mb: 0.5 }}>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 3.5 }}>
          Sign in to your customer portal
        </Typography>

        {/* Email Field */}
        <FormControl fullWidth sx={{ mb: 2.5 }}>
          <OutlinedInput
            placeholder="Email Address"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <MailOutlineIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
              </InputAdornment>
            }
            sx={{
              borderRadius: 2.5,
              backgroundColor: theme.palette.background.default,
              fontSize: 14,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4a6741" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4a6741" },
            }}
          />
        </FormControl>

        {/* Password Field */}
        <FormControl fullWidth sx={{ mb: 3.5 }}>
          <OutlinedInput
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            startAdornment={
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
              </InputAdornment>
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                  {showPassword
                    ? <VisibilityOffIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />
                    : <VisibilityIcon sx={{ fontSize: 18, color: theme.palette.text.disabled }} />}
                </IconButton>
              </InputAdornment>
            }
            sx={{
              borderRadius: 2.5,
              backgroundColor: theme.palette.background.default,
              fontSize: 14,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4a6741" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#4a6741" },
            }}
          />
        </FormControl>

        {/* Sign In Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={HandleSubmit}
          sx={{
            py: 1.4,
            borderRadius: 2.5,
            backgroundColor: "#4a6741",
            fontWeight: 600,
            fontSize: 15,
            textTransform: "none",
            letterSpacing: 0.3,
            boxShadow: "none",
            "&:hover": { backgroundColor: "#3a5232", boxShadow: "none" },
          }}
        >
          Sign In
        </Button>

        {/* Sign Up Link */}
        <Typography variant="body2" sx={{ textAlign: "center", mt: 2.5, color: theme.palette.text.secondary }}>
          Don&apos;t have an account?{" "}
          <Box component="span" sx={{ color: "#4a6741", fontWeight: 600, cursor: "pointer" }}>
            Sign Up
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
