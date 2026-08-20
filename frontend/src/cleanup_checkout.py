import os

filepath = r"d:\tegrand\maramcraft\frontend\src\pages\Checkout.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    ("rgba(22, 16, 13, 0.3)", "var(--bg-card-hover)"),
    ("rgba(22,16,13,0.2)", "var(--bg-card-hover)"),
    ("rgba(212,175,55,0.05)", "transparent"),
    ("rgba(212,175,55,0.1)", "transparent"),
    ("rgba(212,175,55,0.15)", "var(--border-color)"),
    ("rgba(212, 175, 55, 0.05)", "transparent"),
    ("rgba(212, 175, 55, 0.15)", "var(--border-color)"),
    ("rgba(212,175,55,0.02)", "transparent"),
    ("rgba(0, 0, 0, 0.85)", "var(--glass-bg)"),
    ("rgba(212, 175, 55, 0.25)", "rgba(0,0,0,0.05)"),
    ("box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);", "box-shadow: var(--glass-shadow);")
]

new_content = content
for old, new in replacements:
    new_content = new_content.replace(old, new)
    
if new_content != content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated Checkout.jsx")
else:
    print("No changes in Checkout.jsx")
