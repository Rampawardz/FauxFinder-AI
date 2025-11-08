import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import AiAssistant from "../components/AiAssistant";
import ReportModal from "../components/ReportModal";
import { createReport } from "../services/reportService";

const socket = io();

function Dashboard() {
  const [profile, setProfile] = useState({
    profile_pic: "",
    nums_length_username: "",
    fullname_words: "",
    nums_length_fullname: "",
    name_equals_username: "",
    description_length: "",
    external_URL: "",
    private: "",
    posts: "",
    followers: "",
    follows: "",
  });
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    socket.on("alert", (data) => setAlerts((prev) => [...prev, data.message]));
    return () => socket.off("alert");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/profiles/analyze",
        {
          profile_pic: profile.profile_pic,
          nums_length_username: profile.nums_length_username,
          fullname_words: profile.fullname_words,
          nums_length_fullname: profile.nums_length_fullname,
          name_equals_username: profile.name_equals_username,
          description_length: profile.description_length,
          external_URL: profile.external_URL,
          private: profile.private,
          posts: profile.posts,
          followers: profile.followers,
          follows: profile.follows,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || "Analysis failed" });
    }
    setLoading(false);
  };

  const handleSubmitReport = async (reason, severity) => {
    if (!result || !result._id) {
      alert("Profile analysis info missing for reporting.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await createReport(result._id, reason, severity, token);
      alert("Profile reported successfully!");
    } catch (e) {
      alert("Failed to report: " + (e.message || "Unknown error"));
    }
    setIsReportOpen(false);
  };

  return (
    <section className="w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-yellow-50 pt-32 pb-16 px-6 space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          FauxFinder AI
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Analyze social profiles using AI-powered detection.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label
            htmlFor="profile_pic"
            className="font-semibold text-gray-700 mb-1"
          >
            {" "}
            Is there a profile picture?
          </label>
          <input
            name="profile_pic"
            placeholder="Profile Pic"
            value={profile.profile_pic}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="nums_length_username"
            className="font-semibold text-gray-700 mb-1"
          >
            what is the length of the username?
          </label>
          <input
            name="nums_length_username"
            placeholder="Nums/Length Username"
            value={profile.nums_length_username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="fullname_words"
            className="font-semibold text-gray-700 mb-1"
          >
            How many words are in the full name?
          </label>
          <input
            name="fullname_words"
            placeholder="Fullname Words"
            value={profile.fullname_words}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="nums_length_fullname"
            className="font-semibold text-gray-700 mb-1"
          >
            How many numbers or what is the length of full name?
          </label>
          <input
            name="nums_length_fullname"
            placeholder="Nums/Length Fullname"
            value={profile.nums_length_fullname}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="name_equals_username"
            className="font-semibold text-gray-700 mb-1"
          >
            Does profile name exactly matching with username?
          </label>
          <input
            name="name_equals_username"
            placeholder="Name==Username"
            value={profile.name_equals_username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="description_length"
            className="font-semibold text-gray-700 mb-1"
          >
            What is the length of profile description?
          </label>
          <input
            name="description_length"
            placeholder="Description Length"
            value={profile.description_length}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="external_URL"
            className="font-semibold text-gray-700 mb-1"
          >
            Does it have an external link/URL in the profile?
          </label>
          <input
            name="external_URL"
            placeholder="External URL"
            value={profile.external_URL}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label htmlFor="private" className="font-semibold text-gray-700 mb-1">
            Is this a private account?
          </label>
          <input
            name="private"
            placeholder="Private"
            value={profile.private}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label htmlFor="posts" className="font-semibold text-gray-700 mb-1">
            How many posts does this profile have?
          </label>
          <input
            name="posts"
            placeholder="#Posts"
            value={profile.posts}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label
            htmlFor="followers"
            className="font-semibold text-gray-700 mb-1"
          >
            How many followers does the account have?
          </label>
          <input
            name="followers"
            placeholder="#Followers"
            value={profile.followers}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />
          <label htmlFor="follows" className="font-semibold text-gray-700 mb-1">
            How many accounts does this profile follow?
          </label>
          <input
            name="follows"
            placeholder="#Follows"
            value={profile.follows}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition duration-200"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {result?.error && (
          <p className="text-red-500 text-center mt-4">{result.error}</p>
        )}
        {result && result.riskScore !== undefined && (
          <div className="text-center mt-6">
            <p className="text-lg font-medium text-gray-800">
              Fake Profile Probability:{" "}
              <span className="font-bold text-orange-600">
                {(result.riskScore * 100).toFixed(2)}%
              </span>
            </p>
            <p className="mt-2 text-gray-700">
              Status:{" "}
              {result.isFake ? (
                <span className="text-red-600 font-semibold">Fake</span>
              ) : (
                <span className="text-green-600 font-semibold">Legit</span>
              )}
            </p>
            {result.isFake && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition"
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={handleSubmitReport}
        profile={result}
      />
      <button
        onClick={() => setAiOpen(true)}
        className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full p-3 shadow-lg hover:scale-105 transition flex items-center gap-2"
        aria-label="Open AI Assistant"
      >
        <h1>✦</h1>
        <span className="font-bold">AI Assistant</span>
      </button>
      {aiOpen && <AiAssistant onClose={() => setAiOpen(false)} />}
    </section>
  );
}

export default Dashboard;
