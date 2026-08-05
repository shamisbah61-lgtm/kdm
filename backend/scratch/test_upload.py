import requests
import os
from PIL import Image

login_url = "http://127.0.0.1:8000/api/auth/login/"
profile_url = "http://127.0.0.1:8000/api/auth/profile/"

# 1. Login
login_data = {
    "email": "admin@maramcraft.com",
    "password": "admin1234"
}
r = requests.post(login_url, json=login_data)
if not r.ok:
    print("Login failed:", r.text)
    exit(1)

res_json = r.json()
token = res_json['data']['tokens']['access']

# 2. Generate a real PNG image using Pillow
img = Image.new('RGB', (100, 100), color = 'red')
img.save('temp_avatar.png')

# 3. Try PUT with the real image file
headers = {
    "Authorization": f"Bearer {token}"
}

with open('temp_avatar.png', 'rb') as f:
    files = {
        'profile_image': ('temp_avatar.png', f, 'image/png')
    }
    data = {
        'first_name': 'Admin_Updated',
        'last_name': 'MaramCraft',
        'phone': '9876543210'
    }

    print("Attempting PUT request with real PNG from disk...")
    r_put = requests.put(profile_url, headers=headers, data=data, files=files)
    print("PUT Status Code:", r_put.status_code)
    print("PUT Response:", r_put.text)

# Cleanup
if os.path.exists('temp_avatar.png'):
    os.remove('temp_avatar.png')
