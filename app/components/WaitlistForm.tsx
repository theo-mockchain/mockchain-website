// Create a new component for the waitlist form
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";

export const WaitlistForm = () => {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "" });

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleWaitlistSubmit = useCallback(async () => {
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
  }, [waitlistEmail]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-6 mt-10">
      <input
        type="email"
        value={waitlistEmail}
        onChange={(e) => setWaitlistEmail(e.target.value)}
        placeholder="Enter your email"
        className="flex-1 px-4 py-2 rounded-md
          bg-slate-600/30 backdrop-blur-sm
          border border-gray-500/30
          text-white placeholder-gray-400/70
          focus:outline-none focus:ring-2 focus:ring-blue-500/30
          focus:border-transparent
          transition-all duration-300"
      />
      <button
        onClick={handleWaitlistSubmit}
        disabled={status.loading}
        className="px-6 py-2 rounded-md
          bg-gradient-to-r from-blue-500/50 to-purple-500/50
          hover:from-blue-500/60 hover:to-purple-500/60
          border border-gray-500/30
          text-white font-medium
          transform hover:scale-105
          transition-all duration-300
          backdrop-blur-sm
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.loading ? "Joining..." : "Join →"}
      </button>
    </div>
  );
};
