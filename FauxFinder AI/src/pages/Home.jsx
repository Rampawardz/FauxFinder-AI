import React from "react";
import {Link} from "react-router-dom";

export default function Home() {
  return (
    <section className="Hero w-screen h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 via-rose-50 to-yellow-50 text-gray-900 text-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <svg
          className="absolute top-0 right-0 w-64 h-64 opacity-20 text-orange-100"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="120" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 font-bold text-xl sm:text-5xl overflow-hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26L3 18V8zm8 0l7.89 5.26L11 18V8z" />
            </svg>
            <p>FauxFinder AI</p>
          </div>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold leading-tight">
          Try <span className="text-orange-500">AI-Powered</span> Detection
        </h1>

        <p className="text-xl text-gray-600">Instantly Identify Fake Profiles with AI Precision</p>

        <Link
          to="/register"
          className="inline-block bg-white border border-orange-300 text-gray-900 px-8 py-3 rounded-full font-semibold shadow-sm hover:shadow-md hover:bg-orange-50 transition-all duration-200"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
