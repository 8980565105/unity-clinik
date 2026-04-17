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
    order_number: "",
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
      setFormData({ name: "", email: "", order_number: "", message: "" });
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
            {/* <input
              type="text" name="order_number" placeholder="Order Number"
              className="input-common" value={formData.order_number}
              onChange={handleChange}
            /> */}
            <div className="flex sm:grid flex-col sm:grid-cols-2 gap-[15px] md:gap-[28px]">
              <input
                type="text"
                name="order_number"
                placeholder="Order Number"
                className="input-common"
                value={formData.order_number}
                onChange={handleChange}
              />
              <input
                type="date"
                name="orderDate"
                placeholder="DD/MM/YY"
                className="input-common placeholder-[#BCBCBC]"
                value={formData.orderDate}
                onChange={handleChange}
              />
            </div>
            <textarea
              rows="4"
              name="message"
              placeholder="Message*"
              className="input-common"
              value={formData.message}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="common">
              Send Message
            </Button>
          </form>
        </div>
        <div className="w-full h-[500px] md:h-full rounded-md overflow-hidden shadow-md">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3682.857730642045!2d72.86647431503077!3d21.205491385909074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04fb03e1e8c8b%3A0x93dcdbb0e08da8c!2sMota%20Varachha%2C%20Surat!5e0!3m2!1sen!2sin!4v1677840410877!5m2!1sen!2sin"
            width="100%"
            height="100%"
            allowFullScreen
            loading="lazy"
            className="border-0"
          />
        </div>
      </Row>
    </Section>
  );
}
