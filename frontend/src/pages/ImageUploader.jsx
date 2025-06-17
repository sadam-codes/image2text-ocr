import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OCRUploader = () => {
    const [file, setFile] = useState(null);
    const [ocrResult, setOcrResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            toast.error('No file selected');
            return;
        }
        setFile(selectedFile);
        setOcrResult('');
        toast.success('Image selected');
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select an image file before uploading.');
            return;
        }

        setLoading(true);
        toast.loading('Extracting text...');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:4000/api/ocr/upload', formData);

            setOcrResult(res.data.text);
            toast.dismiss();
            toast.success('OCR Successful!');
        } catch (err) {
            toast.dismiss();
            toast.error('OCR failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-black text-center mb-5">
                    OCR Text Extractor
                </h1>

                <div className="space-y-4">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <button
                        onClick={handleUpload}
                        className="w-full bg-black text-white py-2 px-4 rounded-md font-medium transition"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Upload & Extract Text'}
                    </button>

                    {ocrResult && (
                        <div>
                            <h2 className="text-lg font-semibold text-black mb-2">Extracted Text</h2>
                            <textarea
                                value={ocrResult}
                                readOnly
                                rows={10}
                                className="w-full p-3 border border-black rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OCRUploader;
