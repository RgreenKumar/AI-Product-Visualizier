import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from tryon_dl_engine import TryOnDLEngine

app = FastAPI(
    title="AI Visualizer - Python DL Try-On Backend",
    version="1.0.0",
    description="FastAPI service for Deep Learning based Virtual Try-On and Garment Overlapping."
)

# Enable CORS for local Vite development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = TryOnDLEngine()

class TryOnRequest(BaseModel):
    personImage: str
    productImage: str
    productId: Optional[str] = None
    productName: Optional[str] = None
    productBrand: Optional[str] = None
    productCategory: Optional[str] = None

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Visualizer Python DL Try-On Engine",
        "device": str(engine.device),
        "version": "1.0.0"
    }

@app.post("/api/tryon")
def run_tryon(payload: TryOnRequest):
    try:
        if not payload.personImage or not payload.productImage:
            raise HTTPException(status_code=400, detail="Both personImage and productImage are required base64 strings.")
        
        result_base64 = engine.process_tryon(payload.personImage, payload.productImage)
        return {
            "success": True,
            "image": result_base64,
            "engine": "Python Deep Learning Model (PyTorch/OpenCV TPS Blend)"
        }
    except Exception as e:
        print(f"[Error] TryOn execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Python DL model processing error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
