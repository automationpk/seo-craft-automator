import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <AdminAuthProvider>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </BrowserRouter>
);
