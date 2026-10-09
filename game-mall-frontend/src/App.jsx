import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/home/Home";
import Login from "./Pages/auth/Login";
import Mall from "./Pages/Mall";

import VendorDashboard from "./Pages/vendor/VendorDashboard";
import VendorStoreEditor from "./Componant/Mall/VendorStoreEditor";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Customer */}
                <Route
                    path="/mall"
                    element={<Mall />}
                />

                {/* Vendor */}
                <Route
                    path="/vendor"
                    element={<VendorDashboard />}
                />

                <Route
                    path="/vendor/store/:storeId"
                    element={<VendorStoreEditor />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
