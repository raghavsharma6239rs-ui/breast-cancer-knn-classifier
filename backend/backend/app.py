from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import csv
import joblib
import json
import os
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# -----------------------------
# Load trained ML model
# -----------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")
WDBC_DATA_PATH = os.path.join(PROJECT_DIR, "data", "wdbc.data")

model = joblib.load(
    os.path.join(BASE_DIR, "model", "knn_model.pkl")
)

scaler = joblib.load(
    os.path.join(BASE_DIR, "model", "scaler.pkl")
)

with open(
    os.path.join(BASE_DIR, "model", "feature_names.json"),
    "r"
) as f:
    feature_names = json.load(f)


# -----------------------------
# Health check
# -----------------------------

@app.route("/app", methods=["GET"])
@app.route("/ui", methods=["GET"])
def frontend():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/style.css", methods=["GET"])
def frontend_stylesheet():
    return send_from_directory(FRONTEND_DIR, "style.css")


@app.route("/script.js", methods=["GET"])
def frontend_script():
    return send_from_directory(FRONTEND_DIR, "script.js")


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Breast Cancer KNN API is running",
        "model": "K-Nearest Neighbors",
        "features": len(feature_names)
    })


@app.route("/random-sample", methods=["GET"])
def random_sample():
    try:
        with open(WDBC_DATA_PATH, "r", newline="", encoding="utf-8") as dataset_file:
            rows = list(csv.reader(dataset_file))

        valid_rows = [row for row in rows if len(row) == len(feature_names) + 2 and row[1] in {"B", "M"}]
        if not valid_rows:
            return jsonify({"error": "No valid WDBC dataset rows were found."}), 500

        row = random.choice(valid_rows)
        return jsonify({
            "sample_id": row[0],
            "features": {
                name: float(value)
                for name, value in zip(feature_names, row[2:])
            },
            "actual_label": "Benign" if row[1] == "B" else "Malignant"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Prediction endpoint
# -----------------------------

@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        # Check that all required features are present
        missing_features = [
            feature for feature in feature_names
            if feature not in data
        ]

        if missing_features:
            return jsonify({
                "error": "Missing features",
                "missing": missing_features
            }), 400

        # Arrange values in the exact order used during training
        values = [
            float(data[feature])
            for feature in feature_names
        ]

        # Preserve the training feature names to avoid sklearn warnings.
        sample = pd.DataFrame([values], columns=feature_names)

        # Apply the same scaling used during training
        sample_scaled = pd.DataFrame(
            scaler.transform(sample),
            columns=feature_names
        )

        # Make prediction
        prediction = model.predict(sample_scaled.to_numpy())[0]

        # Get probability
        probabilities = model.predict_proba(sample_scaled.to_numpy())[0]

        # Convert prediction to readable result
        if prediction == 0:
            result = "Benign"
        else:
            result = "Malignant"

        confidence = float(
            probabilities[prediction] * 100
        )

        return jsonify({
            "prediction": result,
            "confidence": round(confidence, 2)
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# -----------------------------
# Run server
# -----------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
