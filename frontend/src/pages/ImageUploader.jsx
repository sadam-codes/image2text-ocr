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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold text-center text-gray-700">OCR Text Extractor</h1>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />

                <button
                    onClick={handleUpload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Upload and Extract Text'}
                </button>

                {ocrResult && (
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">📜 Extracted Text</h2>
                        <textarea
                            value={ocrResult}
                            readOnly
                            rows={10}
                            className="w-full p-3 border rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </div>
        </div>
    );
};

export default OCRUploader;
