import sys
import os
import base64
import io
from PIL import Image, ImageDraw

# Add python_backend directory to path
sys.path.append(os.path.dirname(__file__))

from tryon_dl_engine import TryOnDLEngine

def create_synthetic_person():
    img = Image.new("RGB", (400, 600), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    # Head / Face
    draw.ellipse((160, 60, 240, 160), fill=(245, 205, 180))
    # Eyes & Mouth
    draw.ellipse((180, 95, 190, 105), fill=(40, 40, 40))
    # Body / Torso
    draw.rectangle((120, 160, 280, 420), fill=(200, 210, 230))
    # Legs
    draw.rectangle((130, 420, 180, 580), fill=(60, 70, 90))
    draw.rectangle((220, 420, 270, 580), fill=(60, 70, 90))
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()

def create_synthetic_dress():
    img = Image.new("RGBA", (300, 400), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Red Dress shape
    points = [(70, 20), (230, 20), (280, 380), (20, 380)]
    draw.polygon(points, fill=(220, 40, 80, 255))
    # Neck outline
    draw.ellipse((100, 0, 200, 50), fill=(0, 0, 0, 0))
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()

def test_engine():
    print("[Test] Initializing TryOnDLEngine...")
    engine = TryOnDLEngine()
    person_b64 = create_synthetic_person()
    dress_b64 = create_synthetic_dress()
    
    print("[Test] Running try-on process...")
    result_b64 = engine.process_tryon(person_b64, dress_b64)
    assert result_b64.startswith("data:image/"), "Result must be a valid base64 data URL"
    print(f"[Test] Success! Generated result image data URL (length: {len(result_b64)})")

if __name__ == "__main__":
    test_engine()
