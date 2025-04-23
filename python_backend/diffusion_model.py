import torch
from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image
import numpy as np
from typing import Union, List, Optional

class ImageTextToImageModel:
    
    def __init__(self, model_id: str = "runwayml/stable-diffusion-v1-5", device: str = None):
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Loading model on {self.device}...")
        self.pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            safety_checker=None
        )
        self.pipe = self.pipe.to(self.device)
        print("Model loaded successfully!")
        
    def generate(
        self, 
        input_image: Union[Image.Image, np.ndarray, str],
        prompt: str,
        strength: float = 0.75,
        guidance_scale: float = 7.5,
        negative_prompt: str = None,
        num_images: int = 1,
        seed: Optional[int] = None,
    ) -> List[Image.Image]:
        if isinstance(input_image, str):
            input_image = Image.open(input_image).convert("RGB")
        elif isinstance(input_image, np.ndarray):
            input_image = Image.fromarray(np.uint8(input_image)).convert("RGB")
        
        generator = None
        if seed is not None:
            generator = torch.Generator(device=self.device).manual_seed(seed)
            
        output = self.pipe(
            prompt=prompt,
            image=input_image,
            strength=strength,
            guidance_scale=guidance_scale,
            negative_prompt=negative_prompt,
            num_images_per_prompt=num_images,
            generator=generator
        )
        
        return output.images