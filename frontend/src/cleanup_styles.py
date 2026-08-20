import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

frontend_dir = r"d:\tegrand\maramcraft\frontend\src"

replacements = [
    ("border-[rgba(255,255,255,0.05)]", "border-[var(--border-color)]"),
    ("bg-[rgba(204,12,57,0.1)]", "bg-[var(--bg-card-hover)]"),
    ("bg-[rgba(21,128,61,0.1)]", "bg-[var(--bg-card-hover)]"),
    ("shadow-[0_10px_30px_rgba(220,38,38,0.3)]", "shadow-[0_4px_20px_rgba(0,0,0,0.05)]"),
    ("shadow-[0_0_30px_rgba(220,38,38,0.15)]", "shadow-[0_4px_20px_rgba(0,0,0,0.05)]"),
    ("shadow-[0_0_20px_rgba(220,38,38,0.3)]", "shadow-[0_4px_20px_rgba(0,0,0,0.05)]"),
    ("shadow-[0_4px_15px_rgba(220,38,38,0.5)]", "shadow-[0_4px_10px_rgba(0,0,0,0.1)]"),
    ("shadow-[0_0_15px_rgba(220,38,38,0.3)]", "shadow-[0_2px_10px_rgba(0,0,0,0.1)]"),
    ("border-[#ff3333]", "border-[var(--color-primary)]"),
]

for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.jsx', '.css')):
            replace_in_file(os.path.join(root, file), replacements)

print("Replacement done.")
