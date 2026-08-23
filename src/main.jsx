import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import App from './App.jsx'
import './index.css'
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { api } from "../convex/_generated/api";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function EnsureUser() {
  const ensureUser = useMutation(api.users.ensure);
  
  useEffect(() => {
    ensureUser(); 
  }, [ensureUser]);
  
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <EnsureUser />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
)