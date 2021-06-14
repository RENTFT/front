import React from "react";
import ReactDOM from "react-dom";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Debug from "debug";


if (process.env.NEXT_PUBLIC_DEBUG) {
  Debug.enable(process.env.NEXT_PUBLIC_DEBUG);

console.log("NODE_ENV ", process.env.NODE_ENV);

if (IS_PROD && process.env.NEXT_PUBLIC_ADDRESS) {
  throw Error("Please do not use ADDRESS in PRODUCTION env!");
}
// throw error if required env variable isn't provided
[
  "NEXT_PUBLIC_RENFT_API",
  "NEXT_PUBLIC_CORS_PROXY",
  "NEXT_PUBLIC_OPENSEA_API",
  "NEXT_PUBLIC_EIP721_API",
  "NEXT_PUBLIC_EIP1155_API",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDERID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
].forEach((name) => {
  if (!process.env[name]) {
    throw Error(`Please provide a value for ${name} variable`);
  }
});

import App from "./components/app-layout";
import { StateProvider } from "./contexts/StateProvider";

import { ErrorBoundary } from "react-error-boundary";
import { IS_PROD } from "./consts";

const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Click to refresh</button>
    </div>
  );
};

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
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // TODO we will do something better, refresh for now
          window.location.reload();
        }}
      >
        <App />
      </ErrorBoundary>
    </ThemeProvider>
  </StateProvider>,
  document.getElementById("root")
);
