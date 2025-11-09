import pandas as pd
import json
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os

base_dir = os.path.dirname(__file__)
csv_path = os.path.join(base_dir, "test_data.csv")
df = pd.read_csv(csv_path)

features = [
    "profile pic",
    "nums/length username",
    "fullname words",
    "nums/length fullname",
    "name==username",
    "description length",
    "external URL",
    "private",
    "#posts",
    "#followers",
    "#follows"
]
target = "fake"

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    max_depth=10,
    min_samples_split=2,
    min_samples_leaf=1
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model Training Complete | Accuracy: {accuracy:.2f}")

model_path = os.path.join(base_dir, "model.pkl")
feature_path = os.path.join(base_dir, "feature_list.json")
with open(model_path, "wb") as f:
    pickle.dump(model, f)
with open(feature_path, "w") as f:
    json.dump(features, f)
print("✅ Model and feature list saved successfully!")
