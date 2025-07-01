import { useState, useEffect } from "react";
import type { JSX } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import About from "./pages/About";
import Blog, { BlogPost } from "./pages/Blog";
import Contact from "./pages/Contact";
import ThemeToggle from "./components/ThemeToggle";

const routes: { [key: string]: () => JSX.Element } = {
  "#home": Home,
  "#about": About,
  "#blog": () => <Blog />,
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

  // Handle blog post routes
  const getBlogPostSlug = (hash: string): string | null => {
    const match = hash.match(/^#!blog-post-(.+)$/);
    return match ? match[1] : null;
  };

  // Handle blog tag routes
  const getBlogTag = (hash: string): string | null => {
    const match = hash.match(/^#!blog-tag-(.+)$/);
    return match ? match[1] : null;
  };

  const renderPage = () => {
    const blogPostSlug = getBlogPostSlug(page);
    const blogTag = getBlogTag(page);

    if (blogPostSlug) {
      return <BlogPost key={`post-${blogPostSlug}`} postSlug={blogPostSlug} />;
    }

    if (blogTag) {
      return <Blog key={`tag-${blogTag}`} filterTag={blogTag} />;
    }

    const PageComponent = routes[page] || Home;
    return <PageComponent key={page} />;
  };

  return (
    <div className="bg-base-100 min-h-screen font-montserrat">
      <Sidebar />
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <main className="ml-48">{renderPage()}</main>
    </div>
  );
}

export default App;
