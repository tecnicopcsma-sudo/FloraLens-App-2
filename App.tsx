
import React, { useState, useCallback } from 'react';
import { identifyPlant } from './services/geminiService';
import type { PlantInfo } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PlantDetails from './components/PlantDetails';
import Spinner from './components/Spinner';

export default function App(): React.ReactNode {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [plantData, setPlantData] = useState<PlantInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setPlantData(null);
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Get only the base64 part
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecciona una imagen primero.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlantData(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type;
      const data = await identifyPlant(base64Image, mimeType);
      setPlantData(data);
    } catch (err) {
      console.error(err);
      setError('No se pudo analizar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const resetApp = () => {
    setImageFile(null);
    setImageUrl(null);
    setPlantData(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div 
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10 dark:opacity-5" 
        style={{backgroundImage: `url(https://picsum.photos/1920/1080?blur=5&grayscale&random=1)`}}
      ></div>
      <div className="relative z-10">
        <Header />
        <main className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">
            {!imageUrl && (
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-700 dark:text-gray-300 mb-6">
                Descubre el mundo de tus plantas
              </h2>
            )}
            <ImageUploader onImageChange={handleImageChange} imageUrl={imageUrl} />
            
            {imageUrl && !isLoading && !plantData && (
              <div className="text-center mt-8">
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isLoading}
                  className="px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Analizar Planta
                </button>
              </div>
            )}
            
            {isLoading && <Spinner />}
            
            {error && <p className="text-center text-red-500 mt-6 font-semibold">{error}</p>}
            
            {plantData && (
              <>
                <PlantDetails data={plantData} />
                <div className="text-center mt-8">
                   <button
                    onClick={resetApp}
                    className="px-6 py-3 bg-gray-500 text-white font-bold rounded-full hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600 transition-all duration-300"
                  >
                    Analizar otra planta
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
