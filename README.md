# Breast Cancer Detection using K-Nearest Neighbors

## 1. Project Overview

This educational machine-learning project uses the UCI Wisconsin Breast Cancer Diagnostic dataset to classify digitized fine needle aspirate (FNA) sample measurements as Benign or Malignant with a K-Nearest Neighbors (KNN) classifier. It includes a Jupyter notebook for model development, saved model artifacts, a Flask API, and a browser-based demonstration frontend.

## 2. Problem Statement

The task is to classify a sample represented by 30 numerical measurements extracted from cell nuclei. The classifier produces a dataset class label, Benign or Malignant. It does not predict whether a person will develop cancer in the future.

## 3. Project Objectives

- Explore and prepare the Wisconsin Breast Cancer Diagnostic dataset.
- Compare KNN neighbor counts using cross-validation on the training data.
- Evaluate the selected model once on a held-out test set.
- Save the fitted model and its associated feature metadata.
- Provide a Flask API and a simple web interface for demonstration.
- Show real dataset samples and compare their known labels with model predictions after analysis.

## 4. Solution Architecture

~~~mermaid
flowchart TD
    A[WDBC dataset] --> B[Jupyter notebook: prepare data and split]
    B --> C[Fit StandardScaler on training data]
    C --> D[Training data: 5-fold CV selects K]
    D --> E[Fit final KNN with K=3 on scaled training data]
    E --> F[Evaluate once on held-out test data]
    E --> G[Save model artifact]
    C --> H[Save scaler artifact]
    G --> I[Flask API]
    H --> I
    J[Browser frontend] -->|30 feature values| I
    I -->|classification and model score| J
    I -->|real random sample| J
~~~

The held-out test data is reserved for final evaluation and is not used to select K.

## 5. Key Features

- KNN classifier with K=3.
- Training-only 5-fold cross-validation for model selection.
- A separate held-out test set for final evaluation.
- Flask routes for API status, prediction, and real random dataset samples.
- A responsive frontend with a 30-feature form, model score display, and sample comparison.
- Included fitted model and scaler artifacts for running the application.

## 6. Technology Stack

| Area | Technology |
| --- | --- |
| Language | Python |
| Data handling | NumPy, pandas |
| Visualization and exploration | Matplotlib, seaborn |
| Machine learning | scikit-learn |
| Model persistence | joblib |
| API | Flask, Flask-CORS |
| Frontend | HTML, CSS, JavaScript |
| Exploration | Jupyter Notebook |

## 7. Machine Learning Methodology

The notebook prepares the features and labels, then makes a train/test split. The StandardScaler is fitted using training features and applied to the training and held-out test features. Candidate values of K from 1 through 20 are compared with 5-fold cross-validation on the training data only.

The training cross-validation results show that K=3 and K=7 tie for the highest mean accuracy at 96.92%. K=3 has the lower cross-validation standard deviation (2.13%, compared with 2.35% for K=7), so K=3 is selected as the final model. The final KNN classifier is fitted on the scaled training data. The held-out test set is used once for final evaluation and does not influence K selection.

## 8. Dataset

The project uses the UCI Machine Learning Repository's Wisconsin Breast Cancer Diagnostic dataset.

- 569 samples and 30 numerical input features.
- Labels: Benign and Malignant (357 benign, 212 malignant).
- Features are measurements extracted from cell nuclei in digitized FNA images.
- The 30 measurements comprise three groups: mean, standard error, and worst.
- Each group contains radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, and fractal dimension.
- Official source: [UCI Wisconsin Breast Cancer Diagnostic dataset](https://archive.ics.uci.edu/dataset/17/breast-cancer-wisconsin-diagnostic)
- DOI: 10.24432/C5DW2B
- Dataset license: CC BY 4.0

The dataset describes nuclear measurements. It does not provide patient symptoms, age, ER, PR, HER2, tumor grade, or anatomical tumor coordinates as model features.

## 9. Model Performance

The final K=3 model was evaluated once against the existing held-out test split.

- **Held-out test accuracy:** 93.86%
- **5-fold training cross-validation mean accuracy for K=3:** 96.92%
- **5-fold training cross-validation standard deviation for K=3:** 2.13%

Classification report:

| Class | Precision | Recall | F1-score | Support |
| --- | ---: | ---: | ---: | ---: |
| Benign | 0.92 | 0.99 | 0.95 | 72 |
| Malignant | 0.97 | 0.86 | 0.91 | 42 |
| Accuracy |  |  | 0.94 | 114 |
| Macro average | 0.94 | 0.92 | 0.93 | 114 |
| Weighted average | 0.94 | 0.94 | 0.94 | 114 |

Confusion matrix, with rows representing actual labels and columns representing predicted labels in the order Benign, Malignant:

~~~text
[[71, 1],
 [ 6, 36]]
~~~

On this split, 71 benign and 36 malignant samples were classified correctly; one benign sample was classified as malignant, and six malignant samples were classified as benign. Cross-validation is used for model selection; the held-out accuracy and report describe the final evaluation.

## 10. Project Structure

~~~text
.
|-- .gitignore
|-- README.md
|-- requirements.txt
|-- breast_cancer_knn.ipynb
|-- backend/
|   |-- backend/
|   |   |-- app.py
|   |   +-- test_api.py
|   +-- model/
|       |-- feature_names.json
|       |-- knn_model.pkl
|       +-- scaler.pkl
|-- data/
|   |-- wdbc.data
|   +-- wdbc.names
+-- frontend/
    |-- index.html
    |-- script.js
    +-- style.css
~~~

## 11. Project Demonstration

1. Start the Flask application and open its frontend in a browser.
2. Load a random sample selected from the local WDBC dataset.
3. Review the populated numerical measurements.
4. Submit the measurements to the prediction endpoint.
5. Review the Benign or Malignant classification and the model score.
6. After prediction completes, view the sample's actual dataset label and whether the classification matched it.

The frontend's conceptual cellular visualization is an abstract display of the model classification, not an anatomical image or tumor location.

## 12. Feature Status

| Feature | Status |
| --- | --- |
| Dataset exploration notebook | Included |
| Training-only cross-validation model selection | Included |
| Final K=3 classifier and fitted scaler | Included |
| Flask prediction API | Included |
| Random real dataset sample endpoint | Included |
| 30-feature browser form | Included |
| Model classification score display | Included |
| Actual-versus-predicted sample comparison | Included |
| Conceptual cellular visualization | Included |

## 13. Running the Project

From the project root on Windows, create and activate a virtual environment, install the listed dependencies, and start Flask:

~~~powershell
python -m venv .venv
.venv/Scripts/Activate.ps1
pip install -r requirements.txt
python backend/backend/app.py
~~~

In Command Prompt, the activation command is:

~~~bat
.venv/Scripts/activate
~~~

Open the frontend at [http://127.0.0.1:5000/app](http://127.0.0.1:5000/app). Flask's built-in server is intended for local development and demonstrations.

## 14. API

The Flask application runs at http://127.0.0.1:5000.

### GET /

Returns the API status JSON.

### POST /predict

Accepts a JSON request containing the 30 numerical feature values expected by the model. It returns the model's Benign or Malignant classification and score information. The frontend presents the malignant-class score as a model score, not as a clinical probability.

### GET /random-sample

Selects a real row from the project's local data/wdbc.data dataset and returns its sample ID, 30 feature values, and actual dataset label. The frontend keeps the label hidden until the /predict request has completed, then displays it for an educational comparison.

## 15. Learning Outcomes

- Explore and interpret a labeled classification dataset.
- Prepare features and labels for machine-learning workflows.
- Scale numerical features without fitting preprocessing on the held-out test set.
- Use cross-validation on training data to compare model hyperparameters.
- Keep model selection separate from final held-out evaluation.
- Fit, save, and load a scikit-learn model and scaler.
- Expose a model through a Flask API and connect it to a browser interface.
- Interpret classification metrics and a confusion matrix.
- Distinguish a model classification score from a clinical probability.

## 16. Developed By

**Raghav Sharma**

## 17. Conclusion

This project demonstrates a complete educational classification workflow: dataset exploration, training-only cross-validation, final held-out evaluation, saved artifacts, a Flask prediction API, and a browser interface. Its predictions and scores illustrate machine-learning behavior on the supplied dataset; they are not medical guidance.

## 18. Important Scientific Disclaimer

> **This project is an educational machine-learning demonstration and is not a medical device or diagnostic tool. The KNN model's score is a model classification score, not an individual's probability of developing breast cancer. The conceptual visualization does not represent anatomical tumor location.**

Do not use this project to make health decisions. Consult a qualified healthcare professional for medical questions.
