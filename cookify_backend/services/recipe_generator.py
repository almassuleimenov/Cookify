import json
from typing import List
from pydantic import BaseModel, Field
from groq import AsyncGroq
from services.ai_vision import Ingredient

class RecipeStep(BaseModel):
    step_number: int = Field(description="Order of the step")
    instruction: str = Field(description="Detailed instruction for this step")

class Recipe(BaseModel):
    title: str = Field(description="Creative and appetizing name of the dish")
    description: str = Field(description="Short, appealing description of the dish")
    prep_time: str = Field(description="Estimated preparation and cooking time (e.g., '30 mins')")
    difficulty: str = Field(description="Difficulty level (e.g., 'Easy', 'Medium', 'Hard')")
    steps: List[RecipeStep] = Field(description="Sequential list of cooking steps")

class RecipeService:
    def __init__(self, api_key: str):
        self.client = AsyncGroq(api_key=api_key)
        self.model_name = "llama-3.3-70b-versatile"

    async def generate_recipe(self, ingredients: List[Ingredient]) -> Recipe:
        ingredients_list_str = ", ".join([f"{ing.name} ({ing.estimated_quantity})" for ing in ingredients])
        
        system_prompt = """
        You are a professional Michelin-star chef AI. Your task is to create a delicious, 
        practical recipe using ONLY the provided ingredients (it's okay to assume the user has 
        basic pantry staples like salt, pepper, oil, water).
        
        You MUST respond strictly in JSON format. Do not include any markdown formatting, 
        do not wrap in ```json, just output the raw JSON object matching this structure:
        {
            "title": "string",
            "description": "string",
            "prep_time": "string",
            "difficulty": "string",
            "steps": [
                {"step_number": 1, "instruction": "string"}
            ]
        }
        """

        user_prompt = f"Create a recipe using the following ingredients from my fridge: {ingredients_list_str}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=0.7, 
            max_tokens=2048,
            response_format={"type": "json_object"}
        )

        raw_json = response.choices[0].message.content.strip()
        
        # SRE Practice: Устойчивая очистка от галлюцинаций форматирования
        if raw_json.startswith("```json"):
            raw_json = raw_json[7:-3].strip()
        elif raw_json.startswith("```"):
            raw_json = raw_json[3:-3].strip()

        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to decode JSON from model. Raw output: {raw_json}") from e
        
        return Recipe(**data)