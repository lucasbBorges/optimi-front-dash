import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "./theme/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "./lib/auth";

const queryClient = new QueryClient()

export default function App() {
  return (
    <>
      <ThemeProvider storageKey="optimi-dash-rca" defaultTheme="dark">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router}/>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  )
}
