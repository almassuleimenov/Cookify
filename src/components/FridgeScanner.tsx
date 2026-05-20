'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  UploadCloud, AlertCircle, CheckCircle2, 
  Apple, Beef, Milk, Carrot, Camera, ImagePlus, ChefHat, Clock, Flame, Sparkles
} from 'lucide-react';

interface Ingredient {
  name: string;
  estimated_quantity: string;
  category: string;
}

interface ScanResult {
  ingredients: Ingredient[];
  confidence_score: number;
}

interface RecipeStep {
  step_number: number;
  instruction: string;
}

interface Recipe {
  title: string;
  description: string;
  prep_time: string;
  difficulty: string;
  steps: RecipeStep[];
}

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

export default function FridgeScanner() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoadingScan, setIsLoadingScan] = useState<boolean>(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState<boolean>(false);
  
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image (JPEG/PNG).');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 3MB for fast analysis.');
      return;
    }

    setIsLoadingScan(true);
    setError(null);
    setScanResult(null);
    setRecipe(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://cookify-qo0u.onrender.com/api/v1/scan-fridge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Our AI could not read this image. Try another one.');
      }

      const data: ScanResult = await response.json();
      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoadingScan(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    if (e.target) e.target.value = '';
  };

  const generateRecipe = async () => {
    if (!scanResult || scanResult.ingredients.length === 0) return;

    setIsLoadingRecipe(true);
    setError(null);

    try {
      const response = await fetch('https://cookify-qo0u.onrender.com/api/v1/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanResult.ingredients),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Could not generate a recipe at this moment.');
      }

      const data: Recipe = await response.json();
      setRecipe(data);
    } catch (err: any) {
      setError(err.message || 'Recipe generation failed.');
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const resetAll = () => {
    setScanResult(null);
    setRecipe(null);
    setError(null);
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('veg') || cat.includes('овощ') || cat.includes('фрукт')) return <Carrot className="w-5 h-5 text-orange-500" />;
    if (cat.includes('meat') || cat.includes('мяс') || cat.includes('птиц')) return <Beef className="w-5 h-5 text-rose-500" />;
    if (cat.includes('dairy') || cat.includes('молоч') || cat.includes('сыр')) return <Milk className="w-5 h-5 text-blue-500" />;
    return <Apple className="w-5 h-5 text-emerald-500" />;
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-10 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-white/50 relative overflow-hidden">
      
      {/* Soft glowing ambient background elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/50 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-50/50 rounded-full blur-[80px] pointer-events-none" />

      {!recipe && (
        <header className="relative z-10 text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl mb-5 text-emerald-600 shadow-sm border border-emerald-50">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            What's in your fridge?
          </h2>
          <p className="text-base text-gray-500 font-medium max-w-md mx-auto">
            Snap a photo of your ingredients, and our AI will craft the perfect recipe for you in seconds.
          </p>
        </header>
      )}
      
      <main className="relative z-10">
        {!isLoadingScan && !scanResult && !recipe && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="group flex flex-col items-center justify-center py-12 bg-white hover:bg-emerald-50/50 border border-gray-100 hover:border-emerald-200 rounded-[2rem] transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <div className="p-4 bg-gray-50 group-hover:bg-white rounded-2xl mb-4 transition-all duration-300">
                  <Camera className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-800">Take a Photo</span>
              </button>
              
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="group flex flex-col items-center justify-center py-12 bg-white hover:bg-emerald-50/50 border border-gray-100 hover:border-emerald-200 rounded-[2rem] transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                <div className="p-4 bg-gray-50 group-hover:bg-white rounded-2xl mb-4 transition-all duration-300">
                  <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-800">Choose Gallery</span>
              </button>
            </div>

            <div className="hidden sm:block mt-6">
              <div 
                className={`relative flex flex-col items-center justify-center w-full h-40 rounded-[2rem] transition-all duration-300 group ${
                  isDragging 
                    ? 'bg-emerald-50 border-2 border-emerald-400 scale-[1.02] shadow-emerald-100/50' 
                    : 'bg-white/50 border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-white'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <UploadCloud className={`w-8 h-8 mb-3 transition-colors duration-300 ${isDragging ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-400'}`} />
                <p className="text-sm text-gray-500 font-semibold">Or drag & drop your photo here</p>
              </div>
            </div>
          </div>
        )}

        <input type="file" accept="image/jpeg, image/png, image/webp" capture="environment" onChange={handleFileInput} ref={cameraInputRef} className="hidden" />
        <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileInput} ref={galleryInputRef} className="hidden" />

        {/* Scanning Loader */}
        {isLoadingScan && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 bg-emerald-100 rounded-full animate-ping opacity-60"></div>
              <div className="relative w-20 h-20 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200/50">
                <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Cookify AI is looking...</h3>
              <p className="text-sm font-medium text-gray-500">Identifying ingredients and freshness</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-bottom-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800 font-semibold">{error}</p>
          </div>
        )}

        {/* Scan Results */}
        {scanResult && !isLoadingScan && !recipe && !isLoadingRecipe && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100/50">
              <h3 className="text-lg font-extrabold text-emerald-950 flex items-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3" />
                Found {scanResult.ingredients.length} fresh items!
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {scanResult.ingredients.map((ing, idx) => (
                <div 
                  key={`${ing.name}-${idx}`} 
                  className="flex items-center justify-between p-4.5 bg-white border border-gray-100/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in"
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl">
                      {getCategoryIcon(ing.category)}
                    </div>
                    <span className="text-sm font-bold text-gray-800 capitalize">{ing.name}</span>
                  </div>
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg border border-gray-100">
                    {ing.estimated_quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={resetAll}
                className="w-full sm:w-1/3 py-4 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-bold rounded-2xl transition-all active:scale-[0.98]"
              >
                Scan Again
              </button>
              <button 
                onClick={generateRecipe}
                className="w-full sm:w-2/3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center active:scale-[0.98]"
              >
                <ChefHat className="w-5 h-5 mr-2" />
                Generate Recipe
              </button>
            </div>
          </div>
        )}

        {/* Recipe Generation Loader */}
        {isLoadingRecipe && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white shadow-xl shadow-emerald-100 border border-emerald-50 rounded-full flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Brewing culinary magic...</h3>
              <p className="text-sm font-medium text-gray-500">Finding the perfect flavor combinations</p>
            </div>
          </div>
        )}

        {/* Recipe Display */}
        {recipe && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-white border border-gray-100 shadow-2xl shadow-gray-200/40 rounded-[2rem] p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full opacity-60" />
              
              <div className="relative z-10 mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                  {recipe.title}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed font-medium">
                  {recipe.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-gray-100">
                <div className="flex items-center text-sm font-bold text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-100/50">
                  <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                  {recipe.prep_time}
                </div>
                <div className="flex items-center text-sm font-bold text-orange-800 bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-100/50">
                  <Flame className="w-4 h-4 mr-2 text-orange-600" />
                  {recipe.difficulty}
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center">
                  <ChefHat className="w-6 h-6 mr-3 text-emerald-500" />
                  Instructions
                </h3>
                {recipe.steps.map((step) => (
                  <div key={step.step_number} className="flex items-start group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg mr-5 border border-emerald-100/50 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                      {step.step_number}
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed pt-1.5 font-medium">
                      {step.instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={resetAll}
              className="w-full mt-6 py-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-2xl transition-all shadow-xl shadow-gray-900/20 active:scale-[0.98]"
            >
              Start New Scan
            </button>
          </div>
        )}
      </main>
    </div>
  );
}