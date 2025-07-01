import { FiMail, FiMapPin, FiClock, FiSend, FiLinkedin, FiGithub } from "react-icons/fi";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    alert("Thank you for your message! I'll get back to you within 24 hours.");

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      projectType: "",
      budget: "",
      timeline: "",
      message: "",
    });
  };

  return (
    <div id="contact" className="p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Let&apos;s Build Something Amazing Together
          </h1>
          <p className="text-xl text-base-content/70 max-w-3xl mx-auto">
            Ready to turn your vision into reality? I&apos;m here to help you build robust,
            intelligent software that moves the needle for your business. Let&apos;s discuss your
            project!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Get In Touch</h2>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <FiMail className="text-primary" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-base-content">Email</p>
                      <a
                        href="mailto:hello@gabrieleangeletti.com"
                        className="text-primary hover:underline"
                      >
                        hello@gabrieleangeletti.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <FiMapPin className="text-secondary" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-base-content">Location</p>
                      <p className="text-base-content/70">Remote</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <FiClock className="text-accent" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-base-content">Response Time</p>
                      <p className="text-base-content/70">Within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div>
                  <h3 className="font-semibold text-base-content mb-4">Connect With Me</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://www.linkedin.com/in/gabriele-angeletti/"
                      className="btn btn-circle btn-outline btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiLinkedin size={16} />
                    </a>
                    <a
                      href="https://github.com/gabrieleangeletti"
                      className="btn btn-circle btn-outline btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FiGithub size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Card */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">Current Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-base-content">Available for new projects</span>
                  </div>
                  <div className="text-base-content/70 text-sm">
                    <p>• Full-stack web applications</p>
                    <p>• AI/Machine Learning (agentic systems, predictive analytics, etc.)</p>
                    <p>• API development & integration</p>
                    <p>• System architecture consulting</p>
                    <p>• Technical audits & optimization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Start Your Project</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="Your company (optional)"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input input-bordered"
                      placeholder="your.email@company.com"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      className="select select-bordered"
                    >
                      <option value="">Select timeline</option>
                      <option value="asap">ASAP</option>
                      <option value="1-2-months">1-2 months</option>
                      <option value="3-6-months">3-6 months</option>
                      <option value="6-plus-months">6+ months</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                </div>

                <div className="form-control w-full">
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered h-48 w-full"
                    placeholder="Tell me about your project, goals, and any specific requirements..."
                    required
                  ></textarea>
                </div>

                <div className="form-control mt-8">
                  <button type="submit" className="btn btn-primary">
                    <FiSend size={18} />
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 shadow-lg">
            <div className="card-body">
              <h3 className="text-2xl font-bold text-base-content mb-4">Ready to Get Started?</h3>
              <p className="text-base-content/70 mb-6 max-w-2xl mx-auto">
                I work with businesses of all sizes to create software solutions that drive growth.
                Whether you need a complete application or technical consultation, I&apos;m here to
                help.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://github.com/gabrieleangeletti/resume/raw/master/resume.pdf"
                  download="Gabriele_Angeletti_CV.pdf"
                  className="btn btn-outline"
                >
                  Download CV
                </a>
                <a
                  href="mailto:hello@gabrieleangeletti.com?subject=Project Inquiry"
                  className="btn btn-primary"
                >
                  Email Me Directly
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
