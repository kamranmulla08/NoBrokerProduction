import os

import requests

url = "http://127.0.0.1:8000/api/properties/2/images/"
token = os.getenv("NOBROKER_ACCESS_TOKEN")

if not token:
    raise RuntimeError(
        "Set NOBROKER_ACCESS_TOKEN before running this upload helper."
    )

with open("test_property.png", "rb") as image_file:
    response = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        files={"image": ("test_property.png", image_file, "image/png")}
    )

print("Status:", response.status_code)
print("Response:", response.text)
