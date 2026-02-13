import { useState, useCallback } from 'react';
import { analyzeCropQuality } from '../services/qualityService';

export const useQualityCheck = () => {
    const [targetCrop, setTargetCrop] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleImageUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                setError(null);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const reset = useCallback(() => {
        setSelectedImage(null);
        setResult(null);
        setError(null);
    }, []);

    const runAnalysis = useCallback(async () => {
        if (!targetCrop) {
            setError("Please select the crop you are uploading first.");
            return;
        }

        if (!selectedImage) {
            setError("Please upload an image first.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        const { data, error: apiError } = await analyzeCropQuality(targetCrop, selectedImage);

        if (apiError) {
            setError(apiError);
        } else {
            setResult(data);
        }

        setIsAnalyzing(false);
    }, [targetCrop, selectedImage]);

    return {
        targetCrop,
        setTargetCrop,
        selectedImage,
        setSelectedImage,
        isAnalyzing,
        result,
        error,
        handleImageUpload,
        runAnalysis,
        reset
    };
};
