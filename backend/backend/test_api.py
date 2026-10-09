import json
import urllib.request

# A real sample from the Wisconsin Breast Cancer dataset
sample = {
    "radius_mean": 17.99,
    "texture_mean": 10.38,
    "perimeter_mean": 122.80,
    "area_mean": 1001.0,
    "smoothness_mean": 0.11840,
    "compactness_mean": 0.27760,
    "concavity_mean": 0.30010,
    "concave_points_mean": 0.14710,
    "symmetry_mean": 0.24190,
    "fractal_dimension_mean": 0.07871,

    "radius_se": 1.095,
    "texture_se": 0.9053,
    "perimeter_se": 8.589,
    "area_se": 153.40,
    "smoothness_se": 0.006399,
    "compactness_se": 0.04904,
    "concavity_se": 0.05373,
    "concave_points_se": 0.01587,
    "symmetry_se": 0.03003,
    "fractal_dimension_se": 0.006193,

    "radius_worst": 25.38,
    "texture_worst": 17.33,
    "perimeter_worst": 184.60,
    "area_worst": 2019.0,
    "smoothness_worst": 0.16220,
    "compactness_worst": 0.66560,
    "concavity_worst": 0.71190,
    "concave_points_worst": 0.26540,
    "symmetry_worst": 0.46010,
    "fractal_dimension_worst": 0.11890
}

data = json.dumps(sample).encode("utf-8")

request = urllib.request.Request(
    "http://127.0.0.1:5000/predict",
    data=data,
    headers={
        "Content-Type": "application/json"
    },
    method="POST"
)

try:
    with urllib.request.urlopen(request) as response:
        status_code = response.status
        result = json.loads(response.read().decode("utf-8"))

    print("HTTP status code:", status_code)
    print("JSON response:", json.dumps(result, indent=2))

except urllib.error.HTTPError as e:
    result = json.loads(e.read().decode("utf-8"))
    print("HTTP status code:", e.code)
    print("JSON response:", json.dumps(result, indent=2))

except Exception as e:
    print("Request failed:", e)
