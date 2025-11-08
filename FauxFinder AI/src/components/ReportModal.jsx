import { useState, useEffect } from "react";

function ReportModal({ isOpen, onClose, onSubmit, profile }) {
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("low");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSeverity("low");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/40">
      <div className="bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl p-6 w-96 text-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Report <span className="text-red-600">@{profile?.handle}</span>
        </h2>

        <textarea
          placeholder="Enter the reason for reporting..."
          className="border border-gray-300 bg-white/60 backdrop-blur-md p-2 w-full rounded-md mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <select
          className="border border-gray-300 bg-white/60 backdrop-blur-md p-2 w-full rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="low">Low Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="high">High Severity</option>
        </select>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white transition ${
              reason.trim()
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
            }`}
            onClick={() => onSubmit(reason, severity)}
            disabled={!reason.trim()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
