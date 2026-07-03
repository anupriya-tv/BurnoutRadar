import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeDetail from "./pages/EmployeeDetail";
import AddEmployee from "./pages/AddEmployee";

export default function App() {
  return (
    <BrowserRouter>
      <div style={S.app}>
        <nav style={S.nav}>
          <span style={S.brand}>🔥 BurnoutRadar</span>
          <div style={S.links}>
            <Link style={S.link} to="/">Dashboard</Link>
            <Link style={S.link} to="/employees">Employees</Link>
            <Link style={S.link} to="/add">Add Employee</Link>
          </div>
        </nav>
        <main style={S.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/add" element={<AddEmployee />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const S = {
  app: { minHeight: "100vh", background: "#0a1628", color: "#f0ecec", fontFamily: "'Inter', sans-serif" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1c2c4a" },
  brand: { fontSize: "18px", fontWeight: 700, color: "#E8B4B8" },
  links: { display: "flex", gap: "28px" },
  link: { color: "#8089a0", textDecoration: "none", fontSize: "14px" },
  main: { padding: "40px" },
};