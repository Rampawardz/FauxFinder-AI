"""
predict.py — FauxFinder AI  |  ML Prediction Script
=====================================================
Called by Java's ProfileAnalysisService via ProcessBuilder:
    python ml/predict.py '<json-string>'

Input  (sys.argv[1]): JSON string with feature values.
Output (stdout):      JSON string { riskScore, isFake, features, confidence }.
Stderr:               Error messages (captured by Java and re-thrown).

Accepts BOTH camelCase keys (from Java DTO) and original dataset keys.
camelCase mapping:
  profilePic          → "profile pic"
  numsLengthUsername  → "nums/length username"
  fullnameWords       → "fullname words"
  numsLengthFullname  → "nums/length fullname"
  nameEqualsUsername  → "name==username"
  descriptionLength   → "description length"
  externalUrl         → "external URL"
  isPrivate           → "private"
  posts               → "#posts"
  followers           → "#followers"
  follows             → "#follows"
"""

import sys
import json
import pickle
import warnings
import numpy as np
import os

# Suppress sklearn's "X does not have valid feature names" UserWarning.
# This fires because the model was trained on a DataFrame (named columns) but
# we pass a plain numpy array at inference time. Predictions are still correct.
warnings.filterwarnings("ignore", category=UserWarning)

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH   = os.path.join(BASE_DIR, "model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "feature_list.json")

# ── camelCase → dataset column name mapping ───────────────────────────────────
CAMEL_TO_DATASET = {
    "profilePic":         "profile pic",
    "numsLengthUsername": "nums/length username",
    "fullnameWords":      "fullname words",
    "numsLengthFullname": "nums/length fullname",
    "nameEqualsUsername": "name==username",
    "descriptionLength":  "description length",
    "externalUrl":        "external URL",
    "isPrivate":          "private",
    "posts":              "#posts",
    "followers":          "#followers",
    "follows":            "#follows",
}


def normalize_profile(raw: dict) -> dict:
    """
    Convert camelCase keys to dataset column names.
    If the key is already in dataset format, keep it as-is.
    Unknown keys are left unchanged.
    """
    result = {}
    for k, v in raw.items():
        dataset_key = CAMEL_TO_DATASET.get(k, k)
        result[dataset_key] = v
    return result


def load_artifacts():
    """Load model and feature list from disk. Fail fast with clear error."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"model.pkl not found at {MODEL_PATH}. "
            "Run ml/quick_train.py first."
        )
    with open(MODEL_PATH, "rb") as f:
        clf = pickle.load(f)
    with open(FEATURE_PATH, "r") as f:
        features = json.load(f)
    return clf, features


def coerce_number(val):
    """
    Convert string representations to float.
    Handles: yes/no, true/false, numeric strings, plain floats.
    """
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        s = val.strip().lower()
        if s in ("yes", "true",  "1"): return 1.0
        if s in ("no",  "false", "0"): return 0.0
        try:
            return float(s)
        except ValueError:
            return 0.0
    return 0.0


def engineer_features(profile: dict) -> dict:
    """
    Compute the same derived features that quick_train.py added.
    Only applied if feature_list.json includes the derived column names.
    """
    eps = 1e-6
    followers = coerce_number(profile.get("#followers", 0))
    follows   = coerce_number(profile.get("#follows",   0))
    posts     = coerce_number(profile.get("#posts",     0))

    return {
        "followers_follows_ratio": followers / (follows + eps),
        "posts_per_follower":      posts     / (followers + eps),
        "log_posts":               float(np.log1p(posts)),
        "log_followers":           float(np.log1p(followers)),
        "log_follows":             float(np.log1p(follows)),
    }


def build_input_vector(profile: dict, features: list) -> np.ndarray:
    """
    Build the [1 × n_features] array expected by the model.
    profile must use dataset column names (already normalized).
    """
    derived = engineer_features(profile)

    row = []
    for feat in features:
        if feat in profile:
            row.append(coerce_number(profile[feat]))
        elif feat in derived:
            row.append(derived[feat])
        else:
            row.append(0.0)

    return np.array(row, dtype=float).reshape(1, -1)


def main():
    # ── Read input ────────────────────────────────────────────────────────────
    # Java sends JSON via stdin (ProcessBuilder.getOutputStream()).
    # This avoids Windows argument quoting corruption for JSON with
    # special chars: spaces, #, /, ==, quotes.
    # Falls back to sys.argv[1] so you can still test from the command line:
    #   python predict.py '{"profilePic": 1, ...}'
    if not sys.stdin.isatty():
        raw_input = sys.stdin.read().strip()
    elif len(sys.argv) >= 2:
        raw_input = sys.argv[1]
    else:
        print(
            json.dumps({"error": "No profile data provided. Pass JSON via stdin or as first argument."}),
            flush=True
        )
        sys.exit(1)

    # ── Parse input ──────────────────────────────────────────────────────────
    try:
        raw_profile = json.loads(raw_input)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"Invalid JSON input: {e}"}), flush=True)
        sys.exit(1)

    # ── Normalize keys (camelCase → dataset names) ────────────────────────────
    profile = normalize_profile(raw_profile)

    # ── Load model ────────────────────────────────────────────────────────────
    try:
        clf, features = load_artifacts()
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)

    # ── Build input vector ────────────────────────────────────────────────────
    x = build_input_vector(profile, features)

    # ── Predict ──────────────────────────────────────────────────────────────
    label = int(clf.predict(x)[0])

    if hasattr(clf, "predict_proba"):
        proba_arr = clf.predict_proba(x)[0]
        proba = float(proba_arr[1]) if len(proba_arr) > 1 else (1.0 if label else 0.0)
    else:
        proba = 1.0 if label else 0.0

    # Confidence = distance from 0.5 boundary, mapped to [0, 1]
    confidence = round(abs(proba - 0.5) * 2, 4)

    # ── Output ────────────────────────────────────────────────────────────────
    output = {
        "riskScore":  round(proba, 6),
        "isFake":     bool(label),
        "confidence": confidence,
        "label":      "FAKE" if label else "LEGIT",
        "features":   {
            # Echo back using the original camelCase names for Java DTO compatibility
            "profilePic":         profile.get("profile pic", 0),
            "numsLengthUsername": profile.get("nums/length username", 0),
            "fullnameWords":      profile.get("fullname words", 0),
            "numsLengthFullname": profile.get("nums/length fullname", 0),
            "nameEqualsUsername": profile.get("name==username", 0),
            "descriptionLength":  profile.get("description length", 0),
            "externalUrl":        profile.get("external URL", 0),
            "isPrivate":          profile.get("private", 0),
            "posts":              profile.get("#posts", 0),
            "followers":          profile.get("#followers", 0),
            "follows":            profile.get("#follows", 0),
        }
    }

    print(json.dumps(output), flush=True)


if __name__ == "__main__":
    main()
