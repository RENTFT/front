import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import dotenv from "dotenv";
import Debug from "debug";

dotenv.config();

if (process.env.REACT_APP_DEBUG) {
  console.log("debug enabled", process.env.REACT_APP_DEBUG);
  Debug.enable(process.env.REACT_APP_DEBUG);
}

import App from "./components/app-layout";
import { StateProvider } from "./contexts/StateProvider";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Righteous",
      "consolas",
      "Menlo",
      "monospace",
      "sans-serif",
    ].join(","),
  },
});

ReactDOM.render(
    <StateProvider>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StateProvider>,
  document.getElementById("root")
);
