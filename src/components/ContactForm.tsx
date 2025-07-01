import { useState } from "react";

const ContactForm = () => {
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
              <span className="mr-2">📨</span>
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
