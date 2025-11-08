import React from "react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section className="min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 via-rose-50 to-yellow-50 text-gray-900 pt-12 text-center overflow-x-hidden">
      <div className="w-full max-w-7xl px-6 py-20 space-y-12">

        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-orange-600">About FauxFinder AI</h1>
          <p className="text-xl text-orange-800/70">Fast, Accurate, Detection</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-orange-700">Who We Are</h2>
          <p className="text-lg text-gray-800">
            FauxFinder AI is built on a simple idea: <strong>truth should be easy to verify.</strong>  
            In a digital world filled with misinformation and fake accounts, we create technology that helps people and organizations identify authenticity instantly.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-orange-700">What We Do</h2>
          <p className="text-lg text-gray-800">
            Our AI-powered detection system analyzes social media profiles, posts, and online interactions to flag suspicious behavior with precision. 
            We combine advanced machine learning with human-centered design to make detection effortless — <strong>fast, accurate, and no code required.</strong>
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-orange-700">Our Mission</h2>
          <p className="text-lg text-gray-800">
            We believe AI should foster trust. Our mission is to empower creators, communities, and businesses to maintain authentic digital spaces by detecting deception before it spreads.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-orange-700">How It Works</h2>
          <ol className="list-decimal list-inside space-y-3 text-left mx-auto max-w-md text-gray-800">
            <li><strong>Upload or Connect:</strong> Add a post, profile, or dataset for review.</li>
            <li><strong>AI Detection:</strong> Our system scans patterns, metadata, and behavior signals.</li>
            <li><strong>Instant Insights:</strong> Receive a confidence score with clear explanations.</li>
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-orange-700">Why Choose FauxFinder AI</h2>
          <ul className="space-y-2 text-left mx-auto max-w-md text-gray-800">
            <li>🚀 <strong>Fast & Reliable:</strong> Instant results, built for scale.</li>
            <li>🔒 <strong>Privacy-Focused:</strong> Your data stays secure and confidential.</li>
            <li>⚙️ <strong>No-Code Needed:</strong> Simple API and dashboard.</li>
            <li>💡 <strong>Transparent AI:</strong> We explain every detection clearly.</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-semibold text-orange-700">Our Vision</h2>
          <p className="text-lg text-gray-800">
            To make authenticity measurable — building a digital world where trust is the default.
          </p>
        </div>

        <div className="pt-10">
          <Link
            to="/register"
            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-full font-semibold shadow-md hover:shadow-sm hover:bg-orange-600 transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

      </div>
    </section>
  );
}
