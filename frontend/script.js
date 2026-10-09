const API_URL = "/predict";

const featureGroups = [
  {
    title: "Mean values",
    subtitle: "AVERAGE CELL MEASUREMENTS",
    features: [
      ["radius_mean", "Radius"], ["texture_mean", "Texture"],
      ["perimeter_mean", "Perimeter"], ["area_mean", "Area"],
      ["smoothness_mean", "Smoothness"], ["compactness_mean", "Compactness"],
      ["concavity_mean", "Concavity"], ["concave_points_mean", "Concave points"],
      ["symmetry_mean", "Symmetry"], ["fractal_dimension_mean", "Fractal dimension"]
    ]
  },
  {
    title: "Standard error",
    subtitle: "MEASUREMENT VARIATION",
    features: [
      ["radius_se", "Radius"], ["texture_se", "Texture"],
      ["perimeter_se", "Perimeter"], ["area_se", "Area"],
      ["smoothness_se", "Smoothness"], ["compactness_se", "Compactness"],
      ["concavity_se", "Concavity"], ["concave_points_se", "Concave points"],
      ["symmetry_se", "Symmetry"], ["fractal_dimension_se", "Fractal dimension"]
    ]
  },
  {
    title: "Worst values",
    subtitle: "LARGEST MEASUREMENTS",
    features: [
      ["radius_worst", "Radius"], ["texture_worst", "Texture"],
      ["perimeter_worst", "Perimeter"], ["area_worst", "Area"],
      ["smoothness_worst", "Smoothness"], ["compactness_worst", "Compactness"],
      ["concavity_worst", "Concavity"], ["concave_points_worst", "Concave points"],
      ["symmetry_worst", "Symmetry"], ["fractal_dimension_worst", "Fractal dimension"]
    ]
  }
];

const featureNames = featureGroups.flatMap((group) => group.features.map(([name]) => name));

const form = document.getElementById("measurement-form");
const featureGroupsContainer = document.getElementById("feature-groups");
const analyzeButton = document.getElementById("analyze-button");
const formError = document.getElementById("form-error");
const resultPlaceholder = document.getElementById("result-placeholder");
const resultContent = document.getElementById("result-content");
const resultState = document.getElementById("result-state");
const riskVisual = document.getElementById("risk-visual");
const randomSampleButton = document.getElementById("random-sample-button");
let selectedDatasetSample = null;

function resetResult() {
  resultPlaceholder.hidden = false;
  resultContent.hidden = true;
  resultState.textContent = "Awaiting analysis";
  resultState.className = "result-state";
  riskVisual.dataset.state = "idle";
  riskVisual.setAttribute("aria-label", "Conceptual cellular risk visualization, awaiting analysis");
  document.getElementById("actual-comparison").hidden = true;
}

function markManualEntry() {
  resetResult();
  selectedDatasetSample = null;
  document.getElementById("sample-source").textContent = "Manual measurements in progress; no dataset label will be used for comparison.";
}

function createFeatureFields() {
  featureGroups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "feature-group";
    const heading = document.createElement("h3");
    heading.className = "feature-group-title";
    heading.innerHTML = `${group.title} <span>${group.subtitle}</span>`;
    const grid = document.createElement("div");
    grid.className = "feature-grid";

    group.features.forEach(([name, label]) => {
      const field = document.createElement("div");
      field.className = "field";
      const id = `feature-${name}`;
      const labelElement = document.createElement("label");
      labelElement.htmlFor = id;
      labelElement.textContent = label;
      const input = document.createElement("input");
      input.id = id;
      input.name = name;
      input.type = "number";
      input.step = "any";
      input.inputMode = "decimal";
      input.placeholder = "Enter value";
      input.required = true;
      input.setAttribute("aria-label", `${group.title}: ${label}`);
      input.autocomplete = "off";
      input.addEventListener("input", () => {
        input.removeAttribute("aria-invalid");
        markManualEntry();
      });
      field.append(labelElement, input);
      grid.append(field);
    });

    section.append(heading, grid);
    featureGroupsContainer.append(section);
  });
}

function createVisualizationDots() {
  const grid = document.getElementById("cell-grid");
  for (let index = 0; index < 42; index += 1) {
    const dot = document.createElement("span");
    dot.className = "cell-dot";
    grid.append(dot);
  }
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = false;
}

function clearError() {
  formError.textContent = "";
  formError.hidden = true;
}

function collectMeasurements() {
  const sample = {};
  const inputs = [...form.querySelectorAll("input")];
  let firstInvalid = null;

  inputs.forEach((input) => {
    const value = input.value.trim();
    const numericValue = Number(value);
    if (value === "" || !Number.isFinite(numericValue)) {
      input.setAttribute("aria-invalid", "true");
      firstInvalid ||= input;
    } else {
      input.removeAttribute("aria-invalid");
      sample[input.name] = numericValue;
    }
  });

  if (firstInvalid) {
    firstInvalid.focus();
    throw new Error("Enter a valid number for each of the 30 measurements.");
  }
  return sample;
}

function displayResult(result, datasetSample) {
  if (!result || !["Benign", "Malignant"].includes(result.prediction)) {
    throw new Error("The API returned an unexpected classification response.");
  }
  const predictedClassScore = Number(result.confidence);
  if (!Number.isFinite(predictedClassScore) || predictedClassScore < 0 || predictedClassScore > 100) {
    throw new Error("The API returned an invalid model score.");
  }

  const isMalignant = result.prediction === "Malignant";
  // The existing API returns the score for the predicted class. For its binary
  // classes, the other class score is the complement (the two scores sum to 100).
  const malignantScore = isMalignant ? predictedClassScore : 100 - predictedClassScore;
  const benignScore = 100 - malignantScore;
  resultPlaceholder.hidden = true;
  resultContent.hidden = false;
  document.getElementById("prediction-label").textContent = result.prediction;
  document.getElementById("prediction-label").classList.toggle("malignant", isMalignant);
  document.getElementById("prediction-caption").textContent = isMalignant
    ? "Predicted class: Malignant"
    : "Predicted class: Benign";
  document.getElementById("malignant-score").textContent = `${malignantScore.toFixed(2)}%`;
  document.getElementById("benign-score").textContent = `Benign: ${benignScore.toFixed(2)}%`;
  document.getElementById("malignant-class-score").textContent = `Malignant: ${malignantScore.toFixed(2)}%`;
  const scoreBar = document.getElementById("score-bar");
  scoreBar.style.width = `${malignantScore}%`;
  scoreBar.classList.toggle("malignant", isMalignant);
  const scoreMeter = document.getElementById("score-meter");
  scoreMeter.setAttribute("aria-valuenow", malignantScore.toFixed(2));
  scoreMeter.setAttribute("aria-valuetext", `${malignantScore.toFixed(2)} percent malignant-class score`);
  resultState.textContent = isMalignant ? "Malignant class" : "Benign class";
  resultState.className = `result-state ${isMalignant ? "malignant" : "benign"}`;
  riskVisual.dataset.state = isMalignant ? "malignant" : "benign";
  riskVisual.setAttribute(
    "aria-label",
    `Conceptual cellular risk visualization in a mostly ${isMalignant ? "red" : "green"} ${result.prediction} state. It is an abstract representation of the model classification and does not show or predict anatomical tumor location.`
  );

  if (datasetSample) {
    const correct = result.prediction === datasetSample.actualLabel;
    document.getElementById("comparison-prediction").textContent = result.prediction;
    document.getElementById("comparison-actual").textContent = datasetSample.actualLabel;
    const verdict = document.getElementById("comparison-verdict");
    verdict.textContent = correct ? "\u2713 Correct prediction" : "\u2715 Incorrect prediction";
    verdict.className = `comparison-verdict ${correct ? "correct" : "incorrect"}`;
    document.getElementById("actual-comparison").hidden = false;
    document.getElementById("sample-source").textContent = `Random dataset sample analyzed | Sample ID: ${datasetSample.id} | Actual label revealed below`;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  let sample;
  try {
    sample = collectMeasurements();
  } catch (error) {
    showError(error.message);
    return;
  }
  const evaluatedDatasetSample = selectedDatasetSample;
  analyzeButton.disabled = true;
  randomSampleButton.disabled = true;
  form.querySelectorAll("input").forEach((input) => { input.disabled = true; });
  analyzeButton.querySelector(".button-label").textContent = "Analyzing...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sample)
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("The API response was not valid JSON. Check that the Flask API is running.");
    }
    if (!response.ok) {
      throw new Error(result.error || `The API returned HTTP ${response.status}.`);
    }
    displayResult(result, evaluatedDatasetSample);
  } catch (error) {
    showError(error instanceof TypeError
      ? "Could not reach the API. Check that the Flask application is available and try again."
      : error.message);
  } finally {
    analyzeButton.disabled = false;
    randomSampleButton.disabled = false;
    form.querySelectorAll("input").forEach((input) => { input.disabled = false; });
    analyzeButton.querySelector(".button-label").textContent = "Analyze measurements";
  }
});

randomSampleButton.addEventListener("click", async () => {
  clearError();
  resetResult();
  selectedDatasetSample = null;
  randomSampleButton.disabled = true;
  analyzeButton.disabled = true;
  form.querySelectorAll("input").forEach((input) => { input.disabled = true; });
  randomSampleButton.innerHTML = '<span aria-hidden="true">&#127922;</span> Selecting sample...';
  document.getElementById("sample-source").textContent = "Selecting a real row from the Wisconsin Breast Cancer Diagnostic dataset...";

  try {
    const response = await fetch("/random-sample");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `The API returned HTTP ${response.status}.`);
    if (!data.features || !data.sample_id || !["Benign", "Malignant"].includes(data.actual_label)) {
      throw new Error("The dataset endpoint returned an invalid sample.");
    }
    const featureKeys = Object.keys(data.features);
    if (featureNames.length !== 30 || featureNames.some((name) => !featureKeys.includes(name))) {
      throw new Error("The dataset sample does not contain all 30 model features.");
    }
    featureNames.forEach((name) => {
      const input = form.elements.namedItem(name);
      input.value = data.features[name];
      input.removeAttribute("aria-invalid");
    });
    selectedDatasetSample = { id: String(data.sample_id), actualLabel: data.actual_label };
    document.getElementById("sample-source").textContent = `Random dataset sample loaded | Sample ID: ${selectedDatasetSample.id} | Actual label: Hidden until analysis`;
  } catch (error) {
    document.getElementById("sample-source").textContent = "No random sample loaded.";
    showError(error instanceof TypeError
      ? "Could not load a dataset sample. Make sure the Flask server is running."
      : error.message);
  } finally {
    randomSampleButton.disabled = false;
    analyzeButton.disabled = false;
    form.querySelectorAll("input").forEach((input) => { input.disabled = false; });
    randomSampleButton.innerHTML = '<span aria-hidden="true">&#127922;</span> Load Random Sample';
  }
});

createFeatureFields();
createVisualizationDots();
