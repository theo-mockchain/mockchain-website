"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import BackgroundCanvas from "./components/BackgroundCanvas";
import Typewriter from "./components/Typewriter";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { WaitlistForm } from "./components/WaitlistForm";

// *** LANDING PAGE ***

const Home: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const titleText = "Mockchain";
  const messages = [
    "Living breathing testnets",
    "Contract simulations",
    "Contract CI/CD",
  ];

  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleWaitlistSubmit = async () => {
    if (!waitlistEmail) {
      toast.error("Please enter your email");
      return;
    }

    if (!isValidEmail(waitlistEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const toastId = toast.loading("Joining waitlist...");

    try {
      setStatus({ loading: true, error: "" });
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "waitlist", email: waitlistEmail }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setWaitlistEmail("");
      toast.success("Thanks for joining the waitlist!", { id: toastId });
    } catch (error) {
      toast.error("Failed to join waitlist. Please try again.", {
        id: toastId,
      });
    } finally {
      setStatus({ loading: false, error: "" });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactForm.email || !contactForm.name || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isValidEmail(contactForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setStatus({ loading: true, error: "" });
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...contactForm }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setContactForm({ name: "", email: "", message: "" });
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setStatus({ loading: false, error: "" });
    }
  };

  const handleChevronClick = (sectionIndex: number) => {
    const nextSection = containerRef.current?.children[sectionIndex + 1];
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="snap-y snap-mandatory h-screen overflow-y-scroll px-4 place-items-stretch my-8"
    >
      {/* Section 1: Logo, Waitlist, Features, and Socials for Desktop */}
      <section className="relative min-h-screen flex flex-col items-center text-gray-300 snap-start md:flex-row md:justify-center">
        <BackgroundCanvas />
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
          <Image
            src="/logo4A.svg"
            alt="Mockchain Logo"
            width={300}
            height={60}
          />
        </div>

        {/* Typewriter with responsive positioning */}
        <div className="absolute top-32 md:top-48 left-1/2 transform -translate-x-1/2 w-full z-20">
          <h2 className="text-lg md:text-5xl font-semibold text-center">
            <Typewriter
              title={titleText}
              text={messages}
              cursor={true}
              className="text-3xl md:text-5xl font-semibold inline-block"
            />
          </h2>
        </div>

        {/* Main content container */}
        <div className="flex flex-col items-center justify-center h-full">
          {/* Waitlist container */}
          <div className="text-center relative min-w-full max-w-4xl mx-auto mt-72">
            <WaitlistForm />
            <p className="text-gray-400/70 text-sm mb-12">
              Join the waitlist for early access
            </p>
          </div>

          {/* Features Section for Desktop */}
          <div className="hidden md:flex max-w-4xl w-full">
            <div className="flex flex-col md:flex-row justify-between items-stretch gap-8 p-8">
              {[
                {
                  title: "True-to-life stagenets",
                  description:
                    "Experience a true-to-life testing environment. Mockchain’s stagenets are private testnets that mimic mainnet with real transactions and simulated off-chain systems.",
                },
                {
                  title: "Contract Simulations",
                  description:
                    "Run large batches of custom and/or historical transactions through your contracts to test their performance and reliability. No config required.",
                },
                {
                  title: "Rapid Iteration",
                  description:
                    "Have changes to your contracts reflected in your stagenet deployments on each push. No need for fresh deployments or upgrades.",
                },
              ].map((feature, index) => (
                <React.Fragment key={index}>
                  <div className="flex-1 text-center px-4">
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-gray-700/50 to-transparent mx-2"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-8 mb-32">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-500 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href="mailto:contact@mockchain.com"
              className="text-gray-400 hover:text-green-400 transition-colors duration-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
          </div>

          {/* Add bouncing arrow at the bottom */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            <button
              onClick={() => handleChevronClick(0)}
              className="text-gray-400 hover:text-gray-200 transition-colors duration-300"
            >
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Features for Mobile */}
      <section className="snap-start flex flex-col justify-center min-h-screen md:hidden relative">
        <div className="max-w-4xl w-full">
          <div className="flex flex-col justify-between items-stretch gap-8 px-4">
            {[
              {
                title: "True-to-life stagenets",
                description:
                  "Experience a true-to-life testing environment. Mockchain's stagenets are private testnets that mimic mainnet with real transactions and simulated off-chain systems.",
              },
              {
                title: "Contract Simulations",
                description:
                  "Run large batches of custom and/or historical transactions through your contracts to test their performance and reliability. No config required.",
              },
              {
                title: "Rapid Iteration",
                description:
                  "Have changes to your contracts reflected in your stagenet deployments on each push. No need for fresh deployments or upgrades.",
              },
            ].map((feature, index) => (
              <React.Fragment key={index}>
                <div className="flex-1 text-center px-2">
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
                {index < 2 && (
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent my-1"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Add bouncing arrow at the bottom */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => handleChevronClick(1)}
            className="text-gray-400 hover:text-gray-200 transition-colors duration-300"
          >
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Section 3: Contact Us */}
      <section className="snap-start flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-3xl font-semibold mb-8">Get in Touch</h2>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <input
              type="text"
              value={contactForm.name}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Name"
              className="w-full p-3 bg-slate-600/30 rounded text-gray-200 placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:bg-slate-500/30 transition duration-300"
            />
            <input
              type="email"
              value={contactForm.email}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
              className="w-full p-3 bg-slate-600/30 rounded text-gray-200 placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:bg-slate-500/30 transition duration-300"
            />
            <textarea
              value={contactForm.message}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Message"
              rows={4}
              className="w-full p-3 bg-slate-600/30 rounded text-gray-200 placeholder-gray-400/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 hover:bg-slate-500/30 transition duration-300"
            ></textarea>
            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white font-bold py-3 px-4 rounded transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status.loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
