"use client";

import { useState } from "react";

function isValidName(v: string | null) {
  return !!v && v.trim().length >= 3;
}
function isValidEmail(v: string | null) {
  if (!v) return false;
  const s = v.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isValidMessage(v: string | null) {
  return !!v && v.trim().length >= 3;
}

export default function ContactUsForm() {
  // fields
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // UX state
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // derived validity (always-on, no "touched" gate)
  const nameOk = isValidName(name);
  const emailOk = isValidEmail(email);
  const messageOk = isValidMessage(message);
  const isFormValid = nameOk && emailOk && messageOk;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError("Please fix the highlighted fields before sending.");
      return;
    }

    const body = {
      name: (name || "").trim(),
      email: (email || "").trim(),
      message: (message || "").trim(),
    };

    setSending(true);
    try {
      const res = await fetch(`/api/contactus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let friendly = "Could not send the message.";
        if (res.status === 422) friendly = "Some fields are invalid. Please check and try again.";
        if (res.status === 429) friendly = "Too many requests. Please wait a bit and try again.";
        const text = await res.text().catch(() => "");
        throw new Error(text || friendly);
      }

      // reset form
      setName("");
      setEmail("");
      setMessage("");

      setSuccess("Thanks! Your message was sent to the team.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Could not send the message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto" noValidate>
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Contact Us</h1>
            <p className="text-sm opacity-70">We usually reply within 1–2 business days.</p>
          </div>

          {/* Global banners */}
          {error && (
            <div className="alert alert-error" role="alert" aria-live="assertive">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success" role="status" aria-live="polite">
              <span>{success}</span>
            </div>
          )}

          {/* Name */}
          <div className="form-control">
            <label htmlFor="name" className="label">
              <span className="label-text">
                Name <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your full name"
              className={`input input-bordered w-full ${name ? (nameOk ? "" : "input-error") : ""}`}
              value={name ?? ""}
              onChange={(e) => setName(e.target.value)}
              disabled={sending}
              aria-invalid={!!name && !nameOk}
            />
            {!!name && !nameOk && (
              <span className="text-xs text-error mt-1">Name must be at least 3 characters.</span>
            )}
          </div>

          {/* Email */}
          <div className="form-control">
            <label htmlFor="email" className="label">
              <span className="label-text">
                Email <span className="text-error">*</span>
              </span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className={`input input-bordered w-full ${email ? (emailOk ? "" : "input-error") : ""}`}
              value={email ?? ""}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
              aria-invalid={!!email && !emailOk}
            />
            {!!email && !emailOk && (
              <span className="text-xs text-error mt-1">Enter a valid email address.</span>
            )}
          </div>

          {/* Message */}
          <div className="form-control">
            <label htmlFor="message" className="label">
              <span className="label-text">
                Message <span className="text-error">*</span>
              </span>
            </label>
            <textarea
              id="message"
              placeholder="How can we help?"
              className={`textarea textarea-bordered w-full min-h-32 ${
                message ? (messageOk ? "" : "textarea-error") : ""
              }`}
              value={message ?? ""}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              aria-invalid={!!message && !messageOk}
            />
            {!!message && !messageOk && (
              <span className="text-xs text-error mt-1">Message must be at least 3 characters.</span>
            )}
          </div>

          {/* Button with tooltip on inactive */}
          <div className="mt-2">
            <button
  type="submit"
  aria-disabled={!isFormValid || sending}
  onClick={(e) => {
    if (!isFormValid || sending) {
      e.preventDefault();
      setError("Please fix the highlighted fields before sending.");
      return;
    }
  }}
  className={`btn px-5 py-2 text-white transition ${
    isFormValid && !sending
      ? "bg-indigo-600 hover:bg-indigo-700"
      : "bg-indigo-400 cursor-not-allowed"
  } ${sending ? "opacity-70" : ""}`}
>
  {sending ? (
    <span className="flex items-center gap-2">
      <span className="loading loading-spinner loading-sm" />
      Sending…
    </span>
  ) : (
    "Send"
  )}
</button>
          </div>

          <p className="text-xs opacity-60">We’ll email a confirmation and follow up if needed.</p>
        </div>
      </div>
    </form>
  );
}