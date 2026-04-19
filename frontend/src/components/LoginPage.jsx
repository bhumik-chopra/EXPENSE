import React, { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { motion as Motion } from "framer-motion";
import { AlertCircle, Cake, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import BorderGlow from "./BorderGlow";
import { darkModeGlowProps } from "./borderGlowTheme";
import ThemeToggle from "./ThemeToggle";
import sidebarBadge from "../assets/expense-tracker-sidebar-badge.svg";
import sidebarBadgeDark from "../assets/expense-tracker-sidebar-badge-dark.svg";
import authBackground from "../assets/image.png";
import authBackgroundDark from "../assets/image-copy.png";

export default function LoginPage({ theme, onToggleTheme, onLoginSuccess }) {
  const isDark = theme === "dark";
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const [mode, setMode] = useState("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpDob, setSignUpDob] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpVerificationCode, setSignUpVerificationCode] = useState("");
  const [pendingSignUpVerification, setPendingSignUpVerification] = useState(false);
  const [pendingSignInVerification, setPendingSignInVerification] = useState(false);
  const [signInVerificationCode, setSignInVerificationCode] = useState("");
  const [signInVerificationLabel, setSignInVerificationLabel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = {
    minLength: signUpPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(signUpPassword),
    hasLowercase: /[a-z]/.test(signUpPassword),
  };
  const isSignUpPasswordValid =
    passwordChecks.minLength &&
    passwordChecks.hasUppercase &&
    passwordChecks.hasLowercase;

  const formatClerkError = (clerkError, fallbackMessage) => {
    const firstError = clerkError?.errors?.[0];
    return (
      firstError?.longMessage ||
      firstError?.message ||
      clerkError?.message ||
      fallbackMessage
    );
  };

  const formatSignInStatus = (result) => {
    const status = result?.status;
    if (!status || status === "complete") {
      return "";
    }

    if (status === "needs_second_factor") {
      return "This account requires a second verification step before sign-in can finish.";
    }

    if (status === "needs_client_trust") {
      return "Clerk marked this as a new device and requires an email or second-factor verification step.";
    }

    if (status === "needs_first_factor") {
      return "This account needs a supported first-factor sign-in method. Check that password sign-in is enabled in Clerk.";
    }

    if (status === "needs_new_password") {
      return "This account needs a new password before sign-in can continue.";
    }

    if (status === "needs_identifier") {
      return "Enter your email address to continue.";
    }

    return `Additional sign-in steps are required. Clerk returned status: ${status}.`;
  };

  const factorSupportsStrategy = (factor, strategy) => {
    if (!factor) {
      return false;
    }

    if (typeof factor === "string") {
      return factor === strategy;
    }

    return factor.strategy === strategy;
  };

  const getFactorLabel = (factor) => {
    if (!factor || typeof factor === "string") {
      return "";
    }

    return (
      factor.safeIdentifier ||
      factor.emailAddress ||
      factor.phoneNumber ||
      factor.displayName ||
      ""
    );
  };

  const resetSignInFlow = () => {
    setPendingSignInVerification(false);
    setSignInVerificationCode("");
    setSignInVerificationLabel("");
    setError("");
  };

  const resetSignUpFlow = () => {
    setPendingSignUpVerification(false);
    setSignUpVerificationCode("");
    setError("");
  };

  const beginSignInEmailVerification = async (signInResult) => {
    const emailFactor =
      signInResult.supportedSecondFactors?.find((factor) => factorSupportsStrategy(factor, "email_code")) ||
      signInResult.supportedFirstFactors?.find((factor) => factorSupportsStrategy(factor, "email_code"));

    if (!emailFactor) {
      throw new Error(formatSignInStatus(signInResult));
    }

    if (signInResult.status === "needs_second_factor" || signInResult.status === "needs_client_trust") {
      await signIn.prepareSecondFactor({ strategy: "email_code" });
    } else {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      });
    }

    setPendingSignInVerification(true);
    setSignInVerificationCode("");
    setSignInVerificationLabel(getFactorLabel(emailFactor));
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!isSignInLoaded) {
      return;
    }

    setLoading(true);
    setError("");
    resetSignInFlow();

    try {
      const normalizedIdentifier = username.trim().toLowerCase();
      const result = await signIn.create({
        identifier: normalizedIdentifier,
        password,
      });

      if (result.status !== "complete") {
        if (
          result.status === "needs_second_factor" ||
          result.status === "needs_client_trust" ||
          (result.status === "needs_first_factor" &&
            result.supportedFirstFactors?.some((factor) => factorSupportsStrategy(factor, "email_code")))
        ) {
          await beginSignInEmailVerification(result);
          return;
        }

        throw new Error(formatSignInStatus(result));
      }

      await setSignInActive({ session: result.createdSessionId });
      onLoginSuccess?.();
    } catch (submitError) {
      setError(formatClerkError(submitError, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    if (!isSignUpLoaded) {
      return;
    }

    if (!isSignUpPasswordValid) {
      setError(
        "Password must be at least 8 characters and include both uppercase and lowercase letters."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [firstName, ...remainingName] = signUpName.trim().split(/\s+/);
      await signUp.create({
        emailAddress: signUpEmail.trim().toLowerCase(),
        password: signUpPassword,
        firstName: firstName || undefined,
        lastName: remainingName.join(" ") || undefined,
        unsafeMetadata: {
          dob: signUpDob,
          fullName: signUpName,
        },
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingSignUpVerification(true);
      setSignUpVerificationCode("");
    } catch (submitError) {
      setError(formatClerkError(submitError, "Sign up failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (event) => {
    event.preventDefault();
    if (!isSignUpLoaded) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: signUpVerificationCode,
      });

      if (result.status !== "complete") {
        throw new Error("Verification is not complete yet. Please check the code and try again.");
      }

      await setSignUpActive({ session: result.createdSessionId });
      onLoginSuccess?.();
    } catch (verificationError) {
      setError(formatClerkError(verificationError, "Verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignInEmail = async (event) => {
    event.preventDefault();
    if (!isSignInLoaded) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const currentStatus = signIn?.status;
      const isSecondFactorFlow =
        currentStatus === "needs_second_factor" || currentStatus === "needs_client_trust";
      const result = isSecondFactorFlow
        ? await signIn.attemptSecondFactor({
            strategy: "email_code",
            code: signInVerificationCode,
          })
        : await signIn.attemptFirstFactor({
            strategy: "email_code",
            code: signInVerificationCode,
          });

      if (result.status !== "complete") {
        throw new Error(formatSignInStatus(result) || "Verification is not complete yet.");
      }

      await setSignInActive({ session: result.createdSessionId });
      onLoginSuccess?.();
    } catch (verificationError) {
      setError(formatClerkError(verificationError, "Verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const loginCard = (
    <Motion.div
      className={`w-full max-w-2xl rounded-[1.35rem] p-4 shadow-xl backdrop-blur sm:p-5 ${
        isDark
          ? "border border-fuchsia-400/20 bg-slate-950/82 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          : "border border-white/40 bg-white/95"
      }`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
        <div
          className={`mb-4 rounded-[1rem] p-4 ${
            isDark
              ? "border border-fuchsia-400/15 bg-white/6"
              : "bg-blue-50"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
          <div>
            <div className="relative h-14 w-full max-w-[220px] overflow-hidden">
              <Motion.img
                src={sidebarBadge}
                alt="Expense Tracker logo"
                className="absolute inset-0 h-full w-full object-contain object-left px-1 py-1"
                animate={{ opacity: theme === "dark" ? 0 : 1, scale: theme === "dark" ? 0.992 : 1 }}
                transition={{ duration: 0.42, ease: "easeInOut" }}
              />
              <Motion.img
                src={sidebarBadgeDark}
                alt="Expense Tracker logo dark"
                className="absolute inset-0 h-full w-full object-contain object-left px-1 py-1"
                animate={{ opacity: theme === "dark" ? 1 : 0, scale: theme === "dark" ? 1 : 0.992 }}
                transition={{ duration: 0.42, ease: "easeInOut" }}
              />
            </div>
            <h1 className="mt-1.5 text-[1.4rem] font-bold leading-tight sm:text-[1.65rem]">Sign in</h1>
            <p className={`mt-1 text-[13px] ${isDark ? "text-slate-300" : "text-gray-600"}`}>
              {mode === "signin"
                ? pendingSignInVerification
                  ? "Enter the verification code sent to your email to finish signing in."
                  : "Sign in with your email and password."
                : pendingSignUpVerification
                  ? "Enter the verification code sent to your email."
                  : "Create a new account with your email and password."}
            </p>
          </div>
          <ThemeToggle
            checked={theme === "dark"}
            onChange={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          />
        </div>
        </div>

        <div
          className={`mb-3 grid grid-cols-2 rounded-xl p-1 ${
            isDark ? "bg-white/8" : "bg-gray-100"
          }`}
        >
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "signin"
                ? isDark
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "bg-white shadow"
                : isDark
                  ? "text-slate-300 hover:bg-white/6"
                  : "text-gray-600"
            }`}
            onClick={() => {
              setMode("signin");
              setError("");
              resetSignInFlow();
              resetSignUpFlow();
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === "signup"
                ? isDark
                  ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "bg-white shadow"
                : isDark
                  ? "text-slate-300 hover:bg-white/6"
                  : "text-gray-600"
            }`}
            onClick={() => {
              setMode("signup");
              setError("");
              resetSignInFlow();
              resetSignUpFlow();
            }}
          >
            Sign up
          </button>
        </div>

        {mode === "signin" ? (
          pendingSignInVerification ? (
            <form className="space-y-3" onSubmit={handleVerifySignInEmail}>
              <div
                className={`rounded-xl px-4 py-2.5 text-sm ${
                  isDark
                    ? "border border-white/10 bg-white/6 text-slate-200"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <p className="font-medium">Check your email</p>
                <p className="mt-1">
                  We sent a verification code
                  {signInVerificationLabel ? (
                    <>
                      {" "}
                      to <span className="font-semibold">{signInVerificationLabel}</span>
                    </>
                  ) : (
                    " to your email address"
                  )}
                  .
                </p>
              </div>

              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Verification code</span>
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isDark
                      ? "border border-white/12 bg-black/20"
                      : "border"
                  }`}
                >
                  <Mail size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                  <input
                    type="text"
                    value={signInVerificationCode}
                    onChange={(event) => setSignInVerificationCode(event.target.value)}
                    placeholder="Enter code"
                    className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                      isDark
                        ? "text-white caret-white placeholder:text-slate-500"
                        : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                    }`}
                    autoComplete="one-time-code"
                  />
                </div>
              </label>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.25 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify and sign in"}
                </button>
                <button
                  type="button"
                  className={`w-full rounded-xl px-4 py-2.25 font-semibold transition ${
                    isDark
                      ? "border border-white/12 bg-white/6 text-slate-100 hover:bg-white/10"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={resetSignInFlow}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleSignIn}>
            <label className="block">
              <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Email</span>
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                  isDark
                    ? "border border-white/12 bg-black/20"
                    : "border"
                }`}
              >
                <UserRound size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                <input
                  type="email"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Email"
                  className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                    isDark
                      ? "text-white caret-white placeholder:text-slate-500"
                      : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                  }`}
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="block">
              <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Password</span>
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                  isDark
                    ? "border border-white/12 bg-black/20"
                    : "border"
                }`}
              >
                <LockKeyhole size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                    isDark
                      ? "text-white caret-white placeholder:text-slate-500"
                      : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={`transition ${isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500 hover:text-gray-700"}`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.25 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
          )
        ) : (
          pendingSignUpVerification ? (
            <form className="space-y-3" onSubmit={handleVerifyEmail}>
              <div
                className={`rounded-xl px-4 py-2.5 text-sm ${
                  isDark
                    ? "border border-white/10 bg-white/6 text-slate-200"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <p className="font-medium">Check your email</p>
                <p className="mt-1">
                  We sent a verification code to <span className="font-semibold">{signUpEmail}</span>.
                </p>
              </div>

              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Verification code</span>
                <div
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                    isDark
                      ? "border border-white/12 bg-black/20"
                      : "border"
                  }`}
                >
                  <Mail size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                  <input
                    type="text"
                    value={signUpVerificationCode}
                    onChange={(event) => setSignUpVerificationCode(event.target.value)}
                    placeholder="Enter code"
                    className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                      isDark
                        ? "text-white caret-white placeholder:text-slate-500"
                        : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                    }`}
                    autoComplete="one-time-code"
                  />
                </div>
              </label>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.25 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Verifying..." : "Verify email"}
                </button>
                <button
                  type="button"
                  className={`w-full rounded-xl px-4 py-2.25 font-semibold transition ${
                    isDark
                      ? "border border-white/12 bg-white/6 text-slate-100 hover:bg-white/10"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={resetSignUpFlow}
                >
                  Use another email
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleSignUp}>
              <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Name</span>
                    <div
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                        isDark
                          ? "border border-white/12 bg-black/20"
                          : "border"
                      }`}
                    >
                      <UserRound size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                      <input
                        type="text"
                        value={signUpName}
                        onChange={(event) => setSignUpName(event.target.value)}
                        placeholder="Full name"
                        className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                          isDark
                            ? "text-white caret-white placeholder:text-slate-500"
                            : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                        }`}
                        autoComplete="name"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Email</span>
                    <div
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                        isDark
                          ? "border border-white/12 bg-black/20"
                          : "border"
                      }`}
                    >
                      <Mail size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                      <input
                        type="email"
                        value={signUpEmail}
                        onChange={(event) => setSignUpEmail(event.target.value)}
                        placeholder="Email"
                        className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                          isDark
                            ? "text-white caret-white placeholder:text-slate-500"
                            : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                        }`}
                        autoComplete="email"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Date of Birth</span>
                    <div
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                        isDark
                          ? "border border-white/12 bg-black/20"
                          : "border"
                      }`}
                    >
                      <Cake size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                      <input
                        type="date"
                        value={signUpDob}
                        onChange={(event) => setSignUpDob(event.target.value)}
                        className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                          isDark ? "text-white caret-white" : "text-slate-900 caret-slate-900"
                        }`}
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-100" : ""}`}>Password</span>
                    <div
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                        isDark
                          ? "border border-white/12 bg-black/20"
                          : "border"
                      }`}
                    >
                      <LockKeyhole size={18} className={isDark ? "text-slate-400" : "text-gray-500"} />
                      <input
                        type="password"
                        value={signUpPassword}
                        onChange={(event) => setSignUpPassword(event.target.value)}
                        placeholder="Password"
                        className={`auth-input w-full border-0 bg-transparent p-0 focus:outline-none ${
                          isDark
                            ? "text-white caret-white placeholder:text-slate-500"
                            : "text-slate-900 caret-slate-900 placeholder:text-slate-400"
                        }`}
                        autoComplete="new-password"
                      />
                    </div>
                  </label>
                </div>

                <div
                  className={`rounded-xl px-3 py-2.5 text-sm lg:sticky lg:top-0 ${
                    isDark
                      ? "border border-white/10 bg-white/6 text-slate-200"
                      : "border border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <p className="font-medium">Password must:</p>
                  <p className={passwordChecks.minLength ? "text-green-500" : ""}>
                    Be at least 8 characters long
                  </p>
                  <p className={passwordChecks.hasUppercase ? "text-green-500" : ""}>
                    Include at least one uppercase letter
                  </p>
                  <p className={passwordChecks.hasLowercase ? "text-green-500" : ""}>
                    Include at least one lowercase letter
                  </p>
                </div>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.25 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )
        )}
    </Motion.div>
  );

  return (
    <div
      className={`relative flex min-h-screen min-h-dvh items-center justify-center overflow-x-hidden overflow-y-auto px-4 py-4 sm:py-5 ${
        theme === "dark" ? "theme-dark" : "theme-light"
      }`}
      style={{
        backgroundImage: `url(${theme === "dark" ? authBackgroundDark : authBackground})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div
        className={`absolute inset-0 ${
          theme === "dark" ? "bg-slate-950/70" : "bg-white/55"
        }`}
      />
      {theme === "dark" ? (
        <div className="relative z-10">
          <BorderGlow {...darkModeGlowProps}>{loginCard}</BorderGlow>
        </div>
      ) : (
        <div className="relative z-10">{loginCard}</div>
      )}
    </div>
  );
}
