import sys
import json
import pickle
import numpy as np
import os

# Load model and feature order
base_dir = os.path.dirname(__file__)
model_path = os.path.join(base_dir, "model.pkl")
feature_path = os.path.join(base_dir, "feature_list.json")

with open(model_path, "rb") as f:
    clf = pickle.load(f)

with open(feature_path, "r") as f:
    features = json.load(f)

# Get profile data from Node.js
profile = json.loads(sys.argv[1])

def yesno2int(val):
    # Safely convert yes/no/(true/false) to 1/0, otherwise pass through
    if isinstance(val, str):
        sval = val.strip().lower()
        if sval == "yes":
            return 1
        if sval == "no":
            return 0
        if sval == "true":
            return 1
        if sval == "false":
            return 0
    return val

# Prepare input vector, ensure all features match CSV and convert yes/no to float
x = [yesno2int(profile.get(feat, 0)) for feat in features]
x = np.array(x).astype(float).reshape(1, -1)

# Predict probability
if hasattr(clf, "predict_proba") and len(clf.classes_) > 1:
    proba = clf.predict_proba(x)[0][1]
else:
    proba = 1.0 if clf.predict(x)[0] == 1 else 0.0

label = clf.predict(x)[0]

# Output - includes all features for traceability
output = {
    "riskScore": float(proba),
    "isFake": bool(label),
    "features": {feat: profile.get(feat, 0) for feat in features}
}

print(json.dumps(output))
