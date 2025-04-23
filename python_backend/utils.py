import os
from PIL import Image
import datetime
from typing import List

def save_images(images: List[Image.Image], output_dir: str = "output") -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    saved_paths = []
    for i, img in enumerate(images):
        filename = f"generated_{timestamp}_{i}.png"
        filepath = os.path.join(output_dir, filename)
        img.save(filepath)
        saved_paths.append(filepath)
        
    return saved_paths