import base64
import json
from typing import List
from pydantic import BaseModel, Field
from groq import AsyncGroq

class Ingredient(BaseModel):
    name: str = Field(description="Название продукта")
    estimated_quantity: str = Field(description="Примерное количество (например, '2 шт', '500 г')")
    category: str = Field(description="Категория: овощи, мясо, молочное и т.д.")

class FridgeContent(BaseModel):
    ingredients: List[Ingredient]
    confidence_score: float = Field(description="Уверенность модели от 0.0 до 1.0")

class VisionService:
    def __init__(self, api_key: str):
        # Инициализация асинхронного клиента Groq
        self.client = AsyncGroq(api_key=api_key)
        self.model_name = "meta-llama/llama-4-scout-17b-16e-instruct"

    async def analyze_fridge_image(self, image_bytes: bytes, mime_type: str) -> FridgeContent:
        # Сложность O(N) на кодирование
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        system_prompt = """
        Ты — высокоточный кулинарный AI. Проанализируй фотографию холодильника и верни список продуктов.
        Твой ответ должен быть СТРОГО в формате JSON.
        Пример требуемой структуры:
        {
            "ingredients": [
                {"name": "Яблоки", "estimated_quantity": "3 шт", "category": "фрукты"}
            ],
            "confidence_score": 0.95
        }
        """

        # Формируем payload по спецификации OpenAI/Groq для Vision-моделей
        messages = [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": "Проанализируй это изображение и выдай JSON."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}"
                        }
                    }
                ]
            }
        ]

        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            temperature=0.0,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )

        raw_json = response.choices[0].message.content
        data = json.loads(raw_json)
        
        return FridgeContent(**data)