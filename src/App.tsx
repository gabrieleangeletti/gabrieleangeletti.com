import { useState, useEffect } from "react";
import type { JSX } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Service from "./pages/Service";
import Portfolio from "./pages/Portfolio";
import News from "./pages/News";
import Contact from "./pages/Contact";
import ThemeToggle from "./components/ThemeToggle";

const routes: { [key: string]: () => JSX.Element } = {
  "#home": Home,
  "#about": About,
  "#service": Service,
  "#portfolio": Portfolio,
  "#news": News,
  "#contact": Contact,
};

function App() {
  const [page, setPage] = useState(window.location.hash || "#home");

  useEffect(() => {
    const handleHashChange = () => {
      setPage(window.location.hash || "#home");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const Page = routes[page] || Home;

  return (
    <div className="bg-base-100 min-h-screen font-sans">
      <Sidebar />
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <main className="ml-48">
        <Page />
      </main>
    </div>
  );
}

export default App;
