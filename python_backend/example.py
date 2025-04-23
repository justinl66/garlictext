import argparse
from diffusion_model import ImageTextToImageModel
from utils import save_images
import os

def main():
    parser = argparse.ArgumentParser(description="Generate images using an image and text prompt")
    parser.add_argument(
        "--input_image", 
        type=str, 
        required=True, 
        help="Path to the input image"
    )
    parser.add_argument(
        "--prompt", 
        type=str, 
        required=True, 
        help="Text prompt describing the desired output"
    )
    parser.add_argument(
        "--negative_prompt", 
        type=str, 
        default=None, 
        help="Text describing what to avoid in the generation"
    )
    parser.add_argument(
        "--strength", 
        type=float, 
        default=0.75, 
        help="How much to transform the input image (0-1)"
    )
    parser.add_argument(
        "--guidance_scale", 
        type=float, 
        default=7.5, 
        help="How closely to follow the text prompt"
    )
    parser.add_argument(
        "--num_images", 
        type=int, 
        default=1, 
        help="Number of images to generate"
    )
    parser.add_argument(
        "--seed", 
        type=int, 
        default=None, 
        help="Random seed for reproducibility"
    )
    parser.add_argument(
        "--output_dir", 
        type=str, 
        default="output", 
        help="Directory to save output images"
    )
    parser.add_argument(
        "--model_id", 
        type=str, 
        default="runwayml/stable-diffusion-v1-5", 
        help="Hugging Face model ID to use"
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.input_image):
        raise FileNotFoundError(f"Input image not found: {args.input_image}")
    
    model = ImageTextToImageModel(model_id=args.model_id)
    
    print(f"Generating images with prompt: '{args.prompt}'")
    images = model.generate(
        input_image=args.input_image,
        prompt=args.prompt,
        negative_prompt=args.negative_prompt,
        strength=args.strength,
        guidance_scale=args.guidance_scale,
        num_images=args.num_images,
        seed=args.seed
    )
    
    saved_paths = save_images(images, output_dir=args.output_dir)
    
    print(f"Generated {len(saved_paths)} images:")
    for path in saved_paths:
        print(f" - {path}")
        
if __name__ == "__main__":
    main()