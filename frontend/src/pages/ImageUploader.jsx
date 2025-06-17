import React, { useState } from 'react';
import axios from 'axios';

const OCRUploader = () => {
    const [file, setFile] = useState(null);
    const [ocrResult, setOcrResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setOcrResult('');
        setError('');
    };

    const handleUpload = async () => {
        if (!file) return setError('Please select an image file.');
        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:4000/upload', formData);
            setOcrResult(res.data.text);
            setError('');
        } catch (err) {
            setError('OCR failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-3xl space-y-8 border border-blue-200">
                <h1 className="text-3xl font-extrabold text-center text-blue-800 drop-shadow-sm">
                    🧠 AI-Powered OCR Text Extractor
                </h1>

                <div className="flex flex-col items-center gap-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"
                    />

                    <button
                        onClick={handleUpload}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-md transition duration-200"
                        disabled={loading}
                    >
                        {loading ? '🔄 Extracting Text...' : '🚀 Upload & Extract Text'}
                    </button>
                </div>

                {ocrResult && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">📜 Extracted Text</h2>
                        <div className="bg-gray-100 rounded-xl p-4 border text-sm leading-relaxed max-h-[300px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap break-words text-gray-800">{ocrResult}</pre>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-600 text-sm text-center font-medium">❌ {error}</p>}
            </div>
        </div>
    );
};

export default OCRUploader;