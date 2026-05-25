import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/dashboard-current-month/dashboard";
import Auth from "./pages/auth/auth";
import Analise from "./pages/analise/analise";
import Avert from "./pages/avert/avert";
import Pedidos from "./pages/pedidos/pedidos";
import Config from "./pages/config/config";
import Metas from "./pages/metas/metas";
import MetasAvert from "./pages/metas/metas-avert";
import MetasGeral from "./pages/metas/metas-geral";
import ImportacaoMetasPage from "./features/metas/importacao/pages/ImportacaoMetasPage";
import MobileShell from "./components/layouts/mobile-shell";
import AdminOnly from "./components/layouts/admin-only";
import ProtectedRoute from "./components/layouts/protected-route";

export const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/', 
                element: <MobileShell/>,
                children: [
                    { path: "/", element: <Dashboard /> },
                    { path: "avert", element: <Avert /> },
                    { path: "analise", element: <Analise /> },
                    { path: "pedidos", element: <Pedidos /> },
                    { path: "config", element: <Config /> },
                    {
                        element: <AdminOnly />,
                        children: [
                            { path: "metas", element: <Metas /> },
                            { path: "metas/geral", element: <MetasGeral /> },
                            { path: "metas/avert", element: <MetasAvert /> },
                            { path: "metas/avert/importacao", element: <ImportacaoMetasPage /> },
                        ],
                    },
                ]
            },
        ],
    },
    {
        path: '/login', 
        element: <Auth />,
    }
])
