import { createBrowserRouter } from "react-router";
import Dashboard from "./pages/dashboard-current-month/dashboard";
import Auth from "./pages/auth/auth";
import Analise from "./pages/analise/analise";
import Pedidos from "./pages/pedidos/pedidos";
import Config from "./pages/config/config";
import MobileShell from "./components/layouts/mobile-shell";
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
                    { path: "analise", element: <Analise /> },
                    { path: "pedidos", element: <Pedidos /> },
                    { path: "config", element: <Config /> },
                ]
            },
        ],
    },
    {
        path: '/login', 
        element: <Auth />,
    }
])
