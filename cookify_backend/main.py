import os
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from services.ai_vision import VisionService, FridgeContent, Ingredient
from services.recipe_generator import RecipeService, Recipe

load_dotenv()

app = FastAPI(title="Cookify Core API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_vision_service() -> VisionService:
    api_key = os.getenv("GROQ_KOLVO")
    if not api_key:
        raise RuntimeError("CRITICAL: GROQ_KOLVO environment variable is missing.")
    return VisionService(api_key=api_key)

def get_recipe_service() -> RecipeService:
    api_key = os.getenv("GROQ_RECIPE")
    if not api_key:
        raise RuntimeError("CRITICAL: GROQ_RECIPE environment variable is missing.")
    return RecipeService(api_key=api_key)

@app.post("/api/v1/scan-fridge", response_model=FridgeContent)
async def scan_fridge(
    file: UploadFile = File(...),
    vision_service: VisionService = Depends(get_vision_service)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        image_bytes = await file.read()
        if len(image_bytes) > 3 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image too large (max 3MB).")

        result = await vision_service.analyze_fridge_image(
            image_bytes=image_bytes, 
            mime_type=file.content_type
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")

# Обрати внимание на Body(...)
@app.post("/api/v1/generate-recipe", response_model=Recipe)
async def generate_recipe(
    ingredients: List[Ingredient] = Body(...),
    recipe_service: RecipeService = Depends(get_recipe_service)
):
    if not ingredients:
        raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")
    
    try:
        recipe = await recipe_service.generate_recipe(ingredients)
        return recipe
    except Exception as e:
        import traceback
        traceback.print_exc() # Выведет полный стек вызовов (красный текст) прямо в терминал Uvicorn
        raise HTTPException(status_code=500, detail=f"Recipe generation error: {str(e)}")