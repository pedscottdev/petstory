import React from "react";
import AppRoutes from "./routes/page-routes";
import { BrowserRouter } from "react-router-dom";
import ScrollToTop from "./components/ui/scroll-to-top";

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;