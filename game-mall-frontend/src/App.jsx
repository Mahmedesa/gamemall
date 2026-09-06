import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/home/Home";
import Login from "./Pages/auth/Login";
import Mall from "./Pages/Mall";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route 
                    path="/mall" 
                    element={<Mall />} 
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;