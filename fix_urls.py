import os
import glob
import re

src_dir = 'src'
api_url = 'https://mujerereslibre-backend.onrender.com'

files = glob.glob(src_dir + '/**/*.ts*', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace fetch('/api/...
    new_content = content.replace("fetch('/api/", f"fetch('{api_url}/api/")
    new_content = new_content.replace("fetch(`/api/", f"fetch(`{api_url}/api/")
    
    # Also replace img src='/uploads/...
    new_content = new_content.replace("src='/uploads/", f"src='{api_url}/uploads/")
    new_content = new_content.replace('src="/uploads/', f'src="{api_url}/uploads/')
    new_content = new_content.replace('src={`/uploads/', f'src={{`{api_url}/uploads/')
    
    # Same for background images using /uploads
    new_content = new_content.replace("url('/uploads/", f"url('{api_url}/uploads/")
    new_content = new_content.replace('url("/uploads/', f'url("{api_url}/uploads/')
    new_content = new_content.replace('url(`/uploads/', f'url(`{api_url}/uploads/')
    
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('Updated', file)
