import os
from PIL import Image, ImageDraw, ImageFont
import datetime
from typing import List, Dict, Any, Optional, Tuple

def overlay_caption(image: Image.Image, caption: str, user_info: Optional[Dict[str, Any]] = None, 
                   font_path: Optional[str] = None, max_font_size: int = 48, min_font_size: int = 24, 
                   text_color: Tuple[int, int, int] = (255, 255, 255), 
                   bar_color: Tuple[int, int, int] = (0, 0, 0),
                   bar_opacity: int = 255,  # Fully opaque by default
                   output_dir: str = "captioned_output") -> Dict[str, Any]:

    # Create a copy of the image to avoid modifying the original
    original_img = image.copy()
    img_width, img_height = original_img.size
    
    # Always use the default font as requested
    font = ImageFont.load_default()
    
    # Dynamically adjust font size based on caption length
    # Start with the max font size and reduce if needed
    caption_length = len(caption)
    font_size = max_font_size
    
    # Reduce font size for longer captions
    if caption_length > 30:
        # Linear reduction: longer text = smaller font
        # Calculate a scaling factor with lower bound at min_font_size
        font_size = max(min_font_size, max_font_size - int((caption_length - 30) / 2))
    
    # Continue using font directly
    
    # Determine the black bar height based on font size and if we need multiple lines
    test_draw = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    
    # Calculate how many lines we need and where to break them
    words = caption.split()
    lines = []
    current_line = []
    
    for word in words:
        test_line = ' '.join(current_line + [word])
        # Estimate text width
        text_width = test_draw.textlength(test_line, font=font) if hasattr(test_draw, 'textlength') else font.getsize(test_line)[0]
        
        if text_width < img_width - 40 or not current_line:  # Use more padding (40px)
            current_line.append(word)
        else:
            lines.append(' '.join(current_line))
            current_line = [word]
    
    if current_line:
        lines.append(' '.join(current_line))
    
    # Calculate bar height based on number of lines and font size
    line_height = int(font_size * 1.3)  # Add some extra space between lines
    bar_height = (len(lines) * line_height) + 40  # 20px padding top and bottom
    
    # Create a new image with the bar at the bottom
    # The new image will be taller to accommodate the bar
    new_height = img_height + bar_height
    new_img = Image.new('RGB', (img_width, new_height), bar_color)
    
    # Paste the original image at the top
    new_img.paste(original_img, (0, 0))
    
    # Create a draw object for the new image
    draw = ImageDraw.Draw(new_img)
    
    # Draw each line of text centered in the bar
    for i, line in enumerate(lines):
        # Calculate center position for this line
        text_width = draw.textlength(line, font=font) if hasattr(draw, 'textlength') else font.getsize(line)[0]
        text_x = (img_width - text_width) // 2
        
        # Position from the bottom of the original image
        y_position = img_height + 20 + (i * line_height)
        
        # Draw the text in the specified color
        draw.text((text_x, y_position), line, font=font, fill=text_color)
    
    # Save the image
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"captioned_{timestamp}.png"
    filepath = os.path.join(output_dir, filename)
    
    # Save the new image with the black bar
    new_img.save(filepath)
    
    result = {
        'path': filepath,
        'filename': filename,
        'timestamp': timestamp,
        'caption': caption,
    }
    
    if user_info:
        result['user_info'] = user_info
    
    return result


def save_captioned_image_to_db(captioned_image_data: Dict[str, Any], 
                             user_id: str) -> Dict[str, Any]:
    result = captioned_image_data.copy()
    result['user_id'] = user_id
    
    return result


def load_image_from_path(image_path: str) -> Optional[Image.Image]:
    try:
        return Image.open(image_path).convert("RGB")
    except Exception as e:
        print(f"Error loading image: {e}")
        return None
