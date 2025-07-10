import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  //create a query client
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, //don't refetch on window focus
    },
  },
});

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      {/* Provide the query client to the app */}
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);
