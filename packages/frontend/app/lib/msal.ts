import {
  type Configuration,
  PublicClientApplication,
} from "@azure/msal-browser";

// Fallback values for development
const clientId =
  import.meta.env.VITE_AZURE_CLIENT_ID ||
  "ecd0ef78-9257-4b5e-b7d7-f9e931273cf0";
const tenantId =
  import.meta.env.VITE_AZURE_TENANT_ID ||
  "65be328e-8d6a-492e-8891-0e4fb61f55c4";
// Use root URL as redirect URI, not /verify
const redirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin;

const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri,
  },
  cache: {
    cacheLocation: "localStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {
        return;
      },
    },
  },
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read", "openid", "profile", "email"],
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);
