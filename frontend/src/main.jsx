import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl">
          <h1 className="text-2xl font-bold">Clerk Setup Needed</h1>
          <p className="mt-3 text-sm text-slate-300">
            Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>frontend/.env</code> to enable authentication.
          </p>
        </div>
      </div>
    )}
  </StrictMode>,
)
