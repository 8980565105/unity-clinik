import React, { useState } from "react";
import Row from "../ui/Row";
import Button from "../ui/Button";
import Section from "../ui/Section";
import { createContact } from "../../features/contact/contactThunk";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
export default function ContactSection() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createContact(formData)).unwrap();
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error || "Something went wrong");
    }
  };

  return (
    <Section className="w-full bg-white mb-[25px] md:mb-[50px]">
      <Toaster position="top-center" />
      <Row className="grid grid-cols-1 md:grid-cols-2 gap-[30px]">
        <div>
          <h2 className="text-[36px] font-semibold text-dark mb-[18px]">
            Get In Touch
          </h2>
          <form
            className="space-y-[15px] md:space-y-[28px]"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="name"
              placeholder="Name*"
              className="input-common"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail*"
              className="input-common"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="subject"
              placeholder="Your Subject "
              className="input-common"
              value={formData.subject}
              onChange={handleChange}
            />

            <textarea
              rows="4"
              name="message"
              placeholder="Message*"
              className="input-common"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <Button
              type="submit"
              variant="common"
              className="mt-3 border text-primary hover:text-white rounded-full  flex items-center justify-center gap-2 transition"
            >
              Send Message
            </Button>
          </form>
        </div>
        <div className="w-full h-[500px] md:h-full rounded-md overflow-hidden shadow-md">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3718.8641114288503!2d72.8829878!3d21.2372365!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f44e00969b3%3A0xf68c5249f9bae7a0!2sdhara%20arcade%2C%20Mota%20Varachha%2C%20Surat%2C%20Gujarat%20394101!5e0!3m2!1sen!2sin!4v1781174341607!5m2!1sen!2sin"
            width="100%"
            height="100%"
            allowfullscreen
            loading="lazy"
            className="border-0"
          >
            
          </iframe>
        </div>
      </Row>
    </Section>
  );
}
