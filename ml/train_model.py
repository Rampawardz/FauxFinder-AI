"""
train_model.py — FauxFinder AI  |  Improved Model Training Pipeline
====================================================================
Improvements over the original single-estimator script:

1.  Stratified K-Fold cross-validation (5 folds) — gives honest accuracy
    estimate even on a small 621-row dataset (no train/test leak).
2.  GridSearchCV for hyperparameter tuning — finds the best combination of
    n_estimators, max_depth, min_samples_leaf, max_features, class_weight
    without manual trial-and-error.
3.  Log-transforms highly-skewed count features (#posts, #followers, #follows)
    so the forest splits are more meaningful (follower counts span 0–10,000+).
4.  Feature engineering — adds two derived ratios:
      • followers_follows_ratio: high ratio = organic account
      • posts_per_follower: very low = new/bot account
5.  Feature importance report printed to stdout for traceability.
6.  Model saved with metadata dict alongside the .pkl for auditability.
7.  Class-weight balancing ('balanced') so fake/legit imbalance does not
    bias the classifier.

Usage:
    python ml/train_model.py
"""

import os
import json
import pickle
import warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.model_selection import StratifiedKFold, GridSearchCV, cross_val_score
from sklearn.preprocessing import FunctionTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, roc_auc_score
)

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
CSV_PATH     = os.path.join(BASE_DIR, "data", "instagram_fake.csv")
MODEL_PATH   = os.path.join(BASE_DIR, "model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "feature_list.json")
META_PATH    = os.path.join(BASE_DIR, "model_metadata.json")

# ── Raw feature names (must match feature_list.json and predict.py) ───────────
RAW_FEATURES = [
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
    "#follows",
]
TARGET = "fake"

# ── Engineered feature names ───────────────────────────────────────────────────
ALL_FEATURES = RAW_FEATURES + [
    "followers_follows_ratio",
    "posts_per_follower",
    "log_posts",
    "log_followers",
    "log_follows",
]


# ── Feature engineering ────────────────────────────────────────────────────────
def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add derived features that help the model separate real from fake."""
    df = df.copy()
    eps = 1e-6  # avoid division by zero

    # Ratio: organic accounts tend to have far more followers than they follow
    df["followers_follows_ratio"] = df["#followers"] / (df["#follows"] + eps)

    # Ratio: low posts-per-follower → might be a new or purchased account
    df["posts_per_follower"] = df["#posts"] / (df["#followers"] + eps)

    # Log-transform count columns to reduce skew (followers can be 0–10,000)
    df["log_posts"]     = np.log1p(df["#posts"])
    df["log_followers"] = np.log1p(df["#followers"])
    df["log_follows"]   = np.log1p(df["#follows"])

    return df


# ── Load and prepare data ─────────────────────────────────────────────────────
print("=" * 60)
print("FauxFinder AI — Model Training Pipeline")
print("=" * 60)

df = pd.read_csv(CSV_PATH)
print(f"\n📂 Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"   Class distribution:\n{df[TARGET].value_counts().to_string()}")

# Drop rows with NaN in features or target
before = len(df)
df.dropna(subset=RAW_FEATURES + [TARGET], inplace=True)
after = len(df)
if before != after:
    print(f"   ⚠️  Dropped {before - after} rows with missing values")

df = engineer_features(df)

X = df[ALL_FEATURES]
y = df[TARGET].astype(int)

print(f"\n✅ Feature matrix shape: {X.shape}")
print(f"   Features: {ALL_FEATURES}")


# ── Baseline cross-validation (original simple RF) ────────────────────────────
print("\n" + "─" * 60)
print("Step 1 — Baseline (original params, raw features only)")
print("─" * 60)

baseline_rf = RandomForestClassifier(
    n_estimators=100, max_depth=10,
    min_samples_split=2, min_samples_leaf=1,
    random_state=42
)
X_raw = df[RAW_FEATURES]
cv_baseline = cross_val_score(
    baseline_rf, X_raw, y,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="accuracy"
)
print(f"   Baseline CV accuracy: {cv_baseline.mean():.4f} ± {cv_baseline.std():.4f}")


# ── Grid search for best Random Forest ────────────────────────────────────────
print("\n" + "─" * 60)
print("Step 2 — GridSearchCV on Random Forest (engineered features)")
print("─" * 60)

rf_param_grid = {
    "n_estimators":    [200, 300, 500],
    "max_depth":       [None, 8, 15, 25],
    "min_samples_leaf":[1, 2, 4],
    "max_features":    ["sqrt", "log2", 0.6],
    "class_weight":    ["balanced", None],
}

rf_grid = GridSearchCV(
    RandomForestClassifier(random_state=42, n_jobs=-1),
    rf_param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="roc_auc",
    n_jobs=-1,
    verbose=0,
)
rf_grid.fit(X, y)

best_rf = rf_grid.best_estimator_
print(f"   Best RF params: {rf_grid.best_params_}")
print(f"   Best RF ROC-AUC (CV): {rf_grid.best_score_:.4f}")


# ── Gradient Boosting ensemble ────────────────────────────────────────────────
print("\n" + "─" * 60)
print("Step 3 — Gradient Boosting classifier")
print("─" * 60)

gb_param_grid = {
    "n_estimators":  [100, 200],
    "learning_rate": [0.05, 0.1],
    "max_depth":     [3, 5],
    "subsample":     [0.8, 1.0],
}

gb_grid = GridSearchCV(
    GradientBoostingClassifier(random_state=42),
    gb_param_grid,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="roc_auc",
    n_jobs=-1,
    verbose=0,
)
gb_grid.fit(X, y)

best_gb = gb_grid.best_estimator_
print(f"   Best GB params: {gb_grid.best_params_}")
print(f"   Best GB ROC-AUC (CV): {gb_grid.best_score_:.4f}")


# ── Soft-voting ensemble (RF + GB) ────────────────────────────────────────────
print("\n" + "─" * 60)
print("Step 4 — Soft-Voting Ensemble (RF + GradientBoosting)")
print("─" * 60)

ensemble = VotingClassifier(
    estimators=[("rf", best_rf), ("gb", best_gb)],
    voting="soft",
    weights=[2, 1],   # RF gets higher weight (usually better calibrated here)
)

cv_ensemble = cross_val_score(
    ensemble, X, y,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="accuracy",
)
cv_auc = cross_val_score(
    ensemble, X, y,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="roc_auc",
)
print(f"   Ensemble CV Accuracy: {cv_ensemble.mean():.4f} ± {cv_ensemble.std():.4f}")
print(f"   Ensemble CV ROC-AUC: {cv_auc.mean():.4f} ± {cv_auc.std():.4f}")


# ── Pick best single model vs. ensemble ───────────────────────────────────────
# Use whichever scores higher on ROC-AUC (more informative than accuracy)
rf_auc_cv = cross_val_score(
    best_rf, X, y,
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
    scoring="roc_auc",
).mean()

if cv_auc.mean() >= rf_auc_cv:
    final_model = ensemble
    model_name  = "VotingEnsemble(RF+GradientBoosting)"
    final_auc   = cv_auc.mean()
    final_acc   = cv_ensemble.mean()
else:
    final_model = best_rf
    model_name  = "RandomForest"
    final_auc   = rf_auc_cv
    final_acc   = cross_val_score(
        best_rf, X, y,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="accuracy",
    ).mean()

print(f"\n✅ Selected model: {model_name}")
print(f"   CV Accuracy: {final_acc:.4f} | CV ROC-AUC: {final_auc:.4f}")


# ── Final fit on all data ─────────────────────────────────────────────────────
print("\n" + "─" * 60)
print("Step 5 — Final fit on entire dataset")
print("─" * 60)

final_model.fit(X, y)
y_pred     = final_model.predict(X)
y_proba    = final_model.predict_proba(X)[:, 1]
train_acc  = accuracy_score(y, y_pred)
train_auc  = roc_auc_score(y, y_proba)

print(f"\n   Train accuracy:  {train_acc:.4f}")
print(f"   Train ROC-AUC:   {train_auc:.4f}")
print(f"\n   Classification Report:\n{classification_report(y, y_pred)}")
print(f"\n   Confusion Matrix:\n{confusion_matrix(y, y_pred)}")


# ── Feature importance (RF component) ────────────────────────────────────────
print("\n" + "─" * 60)
print("Step 6 — Feature Importances")
print("─" * 60)

rf_component = best_rf if model_name == "RandomForest" else best_rf
importances  = rf_component.feature_importances_
feat_imp     = sorted(zip(ALL_FEATURES, importances), key=lambda x: x[1], reverse=True)

for feat, imp in feat_imp:
    bar = "█" * int(imp * 60)
    print(f"   {feat:<30} {imp:.4f}  {bar}")


# ── Save model and metadata ────────────────────────────────────────────────────
print("\n" + "─" * 60)
print("Step 7 — Saving model artifacts")
print("─" * 60)

with open(MODEL_PATH, "wb") as f:
    pickle.dump(final_model, f, protocol=pickle.HIGHEST_PROTOCOL)

# Save feature list — predict.py reads this
with open(FEATURE_PATH, "w") as f:
    json.dump(ALL_FEATURES, f, indent=2)

# Save metadata for auditability
metadata = {
    "model_name":       model_name,
    "cv_accuracy":      round(float(final_acc), 4),
    "cv_roc_auc":       round(float(final_auc), 4),
    "train_accuracy":   round(float(train_acc), 4),
    "train_roc_auc":    round(float(train_auc), 4),
    "raw_features":     RAW_FEATURES,
    "all_features":     ALL_FEATURES,
    "baseline_cv_acc":  round(float(cv_baseline.mean()), 4),
    "improvement":      round(float(final_acc - cv_baseline.mean()), 4),
    "n_samples":        int(len(df)),
    "class_counts":     df[TARGET].value_counts().to_dict(),
    "rf_best_params":   rf_grid.best_params_,
}
with open(META_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"\n✅ model.pkl        → {MODEL_PATH}")
print(f"✅ feature_list.json → {FEATURE_PATH}")
print(f"✅ model_metadata.json → {META_PATH}")
print(f"\n🏆 Final Model: {model_name}")
print(f"   Baseline CV Accuracy: {cv_baseline.mean():.4f}")
print(f"   Improved CV Accuracy: {final_acc:.4f}")
print(f"   Improvement:          +{final_acc - cv_baseline.mean():.4f}")
print("=" * 60)
