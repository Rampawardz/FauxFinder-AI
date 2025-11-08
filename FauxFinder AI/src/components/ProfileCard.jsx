import React from "react";

function ProfileCard({ profile, onPredict, onReport }) {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-black hover:shadow-lg transition-shadow">
      <h3 className="font-bold text-lg mb-2">{profile.handle}</h3>

      <p>Followers: {profile.followers ?? 0}</p>
      <p>Following: {profile.following ?? 0}</p>
      <p>Posts: {profile.posts ?? 0}</p>
      <p>
        Risk Score:{" "}
        {profile.riskScore !== undefined && profile.riskScore !== null
          ? profile.riskScore.toFixed(2)
          : "N/A"}
      </p>
      <p>Status: {profile.isFake ? "⚠️ Fake" : "✅ Legit"}</p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onPredict(profile._id)}
          aria-label={`Predict for ${profile.handle}`}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          Predict
        </button>

        {profile.isFake && (
          <button
            onClick={() => onReport(profile)}
            aria-label={`Report ${profile.handle}`}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
          >
            Report
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileCard;
