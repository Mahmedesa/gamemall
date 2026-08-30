import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Pages/home/Home";
import Login from "./Pages/auth/Login";

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

            </Routes>

        </BrowserRouter>
    );
}

export default App;