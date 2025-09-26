"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie";
import { useLoginPost } from "../../lib";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { FiLock } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const loginPost = useLoginPost();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginPost("/auth/login", { email, password });
      const token = response.data.token;
      Cookies.set("accessToken", token);
      router.push("/admin");
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="mb-8 flex items-center justify-center gap-3 text-gray-700">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200"><FiLock /></span>
          <span className="text-sm tracking-wide">Admin Access</span>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
              <p className="mt-1 text-sm text-gray-500">Use your administrator credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 relative">
                  <input
                    type="email"
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-gray-900 focus:ring-gray-900 px-4 py-3 pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full inline-flex justify-center items-center gap-2 rounded-lg font-medium px-4 py-3 shadow-sm transition ${
                  isLoading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-black"
                }`}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-gray-500">
              Encrypted connection • Authorized users only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
