import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/analytics" element={<Analytics />}/>
    </Routes>
  );
};