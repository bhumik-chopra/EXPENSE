import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Bot, LoaderCircle, SendHorizonal, Wallet } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import { useTheme } from "./ThemeContext";
import { sendMuneemMessage } from "../utils/api";

const starterQuestions = [
  "How can I reduce this month's spending?",
  "Which category is taking most of my budget?",
  "Give me a simple weekly expense plan.",
];

export default function Muneem() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "I’m Muneem. Ask me about your expenses, your budget, or where your spending pattern looks heavy this month.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const clearError = () => setError("");

    window.addEventListener("expenseAdded", clearError);
    window.addEventListener("expenseDeleted", clearError);
    window.addEventListener("budgetUpdated", clearError);

    return () => {
      window.removeEventListener("expenseAdded", clearError);
      window.removeEventListener("expenseDeleted", clearError);
      window.removeEventListener("budgetUpdated", clearError);
    };
  }, []);

  const shellClassName = useMemo(
    () =>
      theme === "dark"
        ? "rounded-[28px] border border-white/10 bg-[#0d1117] p-4 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6"
        : "rounded-[28px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6",
    [theme]
  );

  const sendMessage = async (content) => {
    const trimmed = String(content || "").trim();
    if (!trimmed || sending) {
      return;
    }

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError("");

    try {
      const response = await sendMuneemMessage(nextMessages);
      setMessages((current) => [...current, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setError(err.message || "Muneem could not answer right now.");
    } finally {
      setSending(false);
    }
  };

  const content = (
    <Motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <section
        className={
          theme === "dark"
            ? `${shellClassName} bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.16),_transparent_24%),linear-gradient(180deg,#111827_0%,#0b1220_100%)]`
            : `${shellClassName} bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_28%),linear-gradient(180deg,#ffffff_0%,#f0fdf4_100%)]`
        }
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                theme === "dark" ? "bg-emerald-500/15 text-emerald-200" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Bot size={14} />
              Muneem
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">Your expense copilot</h2>
            <p className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>
              Muneem answers from the signed-in user&apos;s saved expenses and budget, so you can ask for trend explanations, savings ideas, and spending guidance.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
              theme === "dark" ? "bg-white/8 text-slate-200" : "bg-slate-100 text-slate-700"
            }`}
          >
            <Wallet size={16} />
            Uses your current account&apos;s expense history only
          </div>
        </div>
      </section>

      <section className={`${shellClassName} grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]`}>
        <div className="space-y-3">
          <p className={`text-sm font-semibold ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}>
            Quick prompts
          </p>
          {starterQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => sendMessage(question)}
              disabled={sending}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                theme === "dark"
                  ? "border-white/10 bg-white/[0.04] text-slate-200 hover:border-emerald-400/40"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300"
              }`}
            >
              {question}
            </button>
          ))}
        </div>

        <div className="flex min-h-[65vh] flex-col overflow-hidden rounded-[24px] border border-black/5 bg-black/[0.02]">
          <div className={`flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 ${theme === "dark" ? "bg-white/[0.02]" : "bg-white/70"}`}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.role === "user"
                      ? "bg-emerald-500 text-white"
                      : theme === "dark"
                        ? "border border-white/10 bg-[#111827] text-slate-100"
                        : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {sending ? (
              <div className="flex justify-start">
                <div
                  className={`inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm ${
                    theme === "dark"
                      ? "border border-white/10 bg-[#111827] text-slate-200"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <LoaderCircle size={16} className="animate-spin" />
                  Thinking through your spending...
                </div>
              </div>
            ) : null}

            <div ref={scrollAnchorRef} />
          </div>

          <div className={`border-t p-4 ${theme === "dark" ? "border-white/10 bg-[#0b1220]" : "border-slate-200 bg-slate-50/80"}`}>
            {error ? (
              <p className="mb-3 text-sm text-red-500">{error}</p>
            ) : null}

            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage(input);
              }}
            >
              <textarea
                rows={3}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask how to manage your expenses..."
                className={`min-h-[88px] flex-1 resize-none rounded-2xl border px-4 py-3 outline-none transition ${
                  theme === "dark"
                    ? "border-white/10 bg-white/[0.04] text-slate-100 placeholder:text-slate-500"
                    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
                }`}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:self-end"
              >
                <SendHorizonal size={16} />
                Ask Muneem
              </button>
            </form>
          </div>
        </div>
      </section>
    </Motion.div>
  );

  return theme === "dark" ? <BorderGlow {...darkModeGlowProps}>{content}</BorderGlow> : content;
}
