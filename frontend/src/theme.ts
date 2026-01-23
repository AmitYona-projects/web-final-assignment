import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00C2E8",
    },
    secondary: {
      main: "#4B5563",
      "100": "#8B99AE",
    },
    background: {
      default: "#F5F5F5",
      paper: "#DDF4F8",
    },
  },
  typography: {
    fontFamily: "Outfit",
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 30,
        },
      },
    },
  },
});

export default theme;

