import { FiMail } from "react-icons/fi";

const About = () => {
  return (
    <div id="about" className="p-12 h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-8 text-center">About Me</h1>

        <div className="space-y-8">
          <div className="bg-base-200/50 p-8 rounded-xl shadow-lg">
            <p className="text-lg leading-relaxed text-base-content/80">
              Hi, I&apos;m <span className="font-semibold text-primary">Gabriele Angeletti</span>.
              For almost a decade now, I&apos;ve dived deep into the world of software engineering,
              leading teams and architecting complex systems that deliver real-world impact. My
              journey has taken me from laying the foundational engineering practices for startups
              scaling to over a million users, to modernizing critical platforms that support
              millions in turnover and streamline operations for entire companies.
            </p>

            <p className="text-lg leading-relaxed text-base-content/80 mt-6">
              My passion lies in crafting robust, intelligent software that doesn&apos;t just
              function, but truly excels and moves the needle for your business. I thrive on
              untangling complex technical challenges.
            </p>
          </div>

          <div className="bg-base-200/30 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-primary">Freelance Focus</h2>
            <p className="text-lg leading-relaxed text-base-content/80 mb-6">
              For my upcoming freelance projects, I am particularly keen to leverage my deep
              technical expertise and passion for AI/Machine Learning. I&apos;m excited by
              opportunities to:
            </p>

            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-base-content/80">
                  Develop and deploy intelligent applications.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-base-content/80">
                  Build sophisticated data processing and analysis pipelines for ML workflows.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-base-content/80">
                  Contribute to projects in areas like computer vision, data-driven automation, or
                  predictive analytics.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-bold mt-1">•</span>
                <span className="text-base-content/80">
                  Help businesses harness the power of AI to solve challenging problems and unlock
                  new value.
                </span>
              </li>
            </ul>

            <p className="text-lg leading-relaxed text-base-content/80 mt-6">
              If your project involves turning complex data into actionable insights or building the
              next generation of intelligent software, I believe my skills and experience would be a
              strong asset.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <a
            href="#contact"
            className="btn btn-primary flex items-center gap-3 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <FiMail size={20} />
            Get In Touch
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
