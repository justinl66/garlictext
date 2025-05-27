import os
import base64
import io
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from PIL import Image
import numpy as np

from diffusion_model import ImageTextToImageModel
from utils import save_images
from caption_overlay import overlay_caption, load_image_from_path, save_captioned_image_to_db

app = FastAPI(
    title="Image+Text to Image API",
    description="API for generating images using stable diffusion with image and text inputs",
    version="1.0.0",
)

model = None

class GenerationSettings(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    strength: float = 0.75
    guidance_scale: float = 7.5
    num_images: int = 1
    seed: Optional[int] = None


class GenerationResponse(BaseModel):
    images: List[str]
    paths: List[str]


class StatusResponse(BaseModel):
    status: str
    enhanced_image: Optional[str] = None


class CaptionRequest(BaseModel):
    image_path: Optional[str] = None
    image_data: Optional[str] = None
    caption: str
    user_id: Optional[str] = None
    strength: float = 0.75
    guidance_scale: float = 7.5
    num_images: int = 1
    seed: Optional[int] = None


@app.on_event("startup")
async def startup_event():
    global model
    model = ImageTextToImageModel()


@app.post("/generate/", response_model=GenerationResponse)
async def generate_images(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    negative_prompt: Optional[str] = Form(None),
    strength: float = Form(0.75),
    guidance_scale: float = Form(7.5),
    num_images: int = Form(1),
    seed: Optional[int] = Form(None),
):
    if not model:
        raise HTTPException(status_code=500, detail="Model not initialized")
    
    try:
        contents = await image.read()
        input_image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        generated_images = model.generate(
            input_image=input_image,
            prompt=prompt,
            negative_prompt=negative_prompt,
            strength=strength,
            guidance_scale=guidance_scale,
            num_images=num_images,
            seed=seed
        )
        
        saved_paths = save_images(generated_images)
        
        base64_images = []
        for img in generated_images:
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            base64_string = base64.b64encode(buffered.getvalue()).decode("utf-8")
            base64_images.append(f"data:image/png;base64,{base64_string}")
        
        return GenerationResponse(
            images=base64_images,
            paths=saved_paths
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating images: {str(e)}")


# Add caption to image endpoint
@app.post("/api/caption")
async def add_caption(caption_request: CaptionRequest):
    try:
        image = None
        
        if caption_request.image_path:
            image = load_image_from_path(caption_request.image_path)
            if not image:
                raise HTTPException(status_code=400, detail="Failed to load image from path")
                
        elif caption_request.image_data:
            try:
                image_data = caption_request.image_data
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                    
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to decode image data: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Either image_path or image_data must be provided")
        
        user_info = None
        if caption_request.user_id:
            user_info = {"user_id": caption_request.user_id}
        
        result = overlay_caption(
            image=image,
            caption=caption_request.caption,
            user_info=user_info,
            output_dir="captioned_images"
        )
        
        if caption_request.user_id:
            result = save_captioned_image_to_db(result, caption_request.user_id)
        
        with open(result['path'], 'rb') as f:
            image_bytes = f.read()
        
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        result['image_data'] = f"data:image/png;base64,{base64_image}"
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding caption: {str(e)}")


# Add caption to drawing endpoint
@app.post("/api/drawings/{drawing_id}/caption")
async def add_caption_to_drawing(drawing_id: str, caption: str = Form(...), user_id: Optional[str] = Form(None)):
    
    db = {"drawings": {}}
    
    if drawing_id not in db["drawings"]:
        db["drawings"][drawing_id] = {
            "status": "completed",
            "enhanced_image": None  # HAVE TO PUT ENHANCED IMAGE HERE
        }
    
    drawing = db["drawings"][drawing_id]
    
    if "sample_image.jpg" not in os.listdir():
        img = Image.new('RGB', (500, 500), color='white')
        img.save("sample_image.jpg")
    
    try:
        image = load_image_from_path("sample_image.jpg")
        
        user_info = None
        if user_id:
            user_info = {"user_id": user_id}
        
        result = overlay_caption(
            image=image,
            caption=caption,
            user_info=user_info,
            output_dir="captioned_drawings"
        )
        
        drawing["caption"] = caption
        drawing["captioned_path"] = result["path"]
        
        with open(result['path'], 'rb') as f:
            image_bytes = f.read()
        
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        result['image_data'] = f"data:image/png;base64,{base64_image}"
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding caption to drawing: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}


if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)