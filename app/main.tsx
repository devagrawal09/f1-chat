/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import App from "./App.tsx";
import "./index.css";
import { schema } from "../shared/schema.ts";
import Cookies from "js-cookie";
import { createZero } from "@rocicorp/zero/solid";
import { createMutators } from "../shared/mutators.ts";
import { decodeAuthData } from "../shared/auth.ts";

// Initialize auth data
const encodedJWT = Cookies.get("jwt");
const authData = decodeAuthData(encodedJWT);
const userID = authData?.sub ?? authData?.clerkUserID ?? "anon";

// Create Zero client
const z = createZero({
  userID,
  auth: encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER || "http://localhost:4848",
  schema,
  mutators: createMutators(authData),
  kvStore: "idb",
});

// For debugging and inspection
(window as any)._zero = z;

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

render(() => (
  <Router>
    <App z={z} />
  </Router>
), root);
