// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import LogScreen from "./LogScreen";
import ChartScreen from "./ChartScreen";

function App() {
  return (
    <Router>
      <div>
        <nav className="flex justify-between p-4 bg-gray-800 text-white">
          <div>
            <Link to="/" className="text-xl font-bold mr-4">
              Chart
            </Link>

            <Link to="/logs?" className="text-xl font-bold ">
              Logs
            </Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ChartScreen />} />
          <Route path="/logs?" element={<LogScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
