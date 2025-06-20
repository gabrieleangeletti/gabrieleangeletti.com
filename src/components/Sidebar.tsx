import { FiHome, FiUser, FiSettings, FiBriefcase, FiFileText, FiMail } from "react-icons/fi";

const Sidebar = () => (
  <aside className="fixed top-0 left-0 h-full w-48 bg-base-200 shadow-lg flex flex-col justify-between p-6">
    <div>
      <h1 className="text-2xl font-bold tracking-widest text-base-content">TOKYO</h1>
      <nav className="mt-12">
        <ul>
          <li className="mb-6">
            <a
              href="#home"
              className="flex items-center text-base-content/70 hover:text-base-content"
            >
              <FiHome className="mr-3" /> Home
            </a>
          </li>
          <li className="mb-6">
            <a
              href="#about"
              className="flex items-center text-base-content/70 hover:text-base-content"
            >
              <FiUser className="mr-3" /> About
            </a>
          </li>
          <li className="mb-6">
            <a
              href="#service"
              className="flex items-center text-base-content/70 hover:text-base-content"
            >
              <FiSettings className="mr-3" /> Service
            </a>
          </li>
          <li className="mb-6">
            <a
              href="#portfolio"
              className="flex items-center text-base-content/70 hover:text-base-content"
            >
              <FiBriefcase className="mr-3" /> Portfolio
            </a>
          </li>
          <li className="mb-6">
            <a
              href="#news"
              className="flex items-center text-base-content/70 hover:text-base-content"
            >
              <FiFileText className="mr-3" /> News
            </a>
          </li>
          <li>
            <a
              href="#contact"
              className="flex items-center text-base-content/70 hover:text-base-content"
            >
              <FiMail className="mr-3" /> Contact
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <div className="text-sm text-base-content/50">
      <p>&copy; 2025</p>
      <p>All rights reserved</p>
    </div>
  </aside>
);

export default Sidebar;
