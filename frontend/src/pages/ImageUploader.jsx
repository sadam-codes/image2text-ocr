import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OCRUploader = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [typedAnswer, setTypedAnswer] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) {
            toast.error('No file selected');
            return;
        }
        setFile(selectedFile);
        toast.success('Image selected');
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select an image file before uploading.');
            return;
        }

        setLoading(true);
        toast.loading('Uploading & processing image...');
        const formData = new FormData();
        formData.append('image', file);

        try {
            await axios.post('http://localhost:4000/api/ocr/upload', formData);
            toast.dismiss();
            toast.success('OCR & embedding successful!');
        } catch (err) {
            toast.dismiss();
            toast.error('Upload failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) {
            toast.error('Please enter a search query.');
            return;
        }

        console.log('Searching for:', query);

        try {
            const res = await axios.get('http://localhost:4000/api/ocr/query', {
                params: { q: query },
            });

            console.log('Search response:', res.data);

            const fullAnswer = res.data.answer || '';
            setAnswer(fullAnswer);

            setTypedAnswer(fullAnswer.charAt(0) || '');

            let i = 0;
            const interval = setInterval(() => {
                setTypedAnswer(prev => prev + fullAnswer.charAt(i));
                i++;
                if (i >= fullAnswer.length) clearInterval(interval);
            }, 20);

        } catch (err) {
            console.error('Search failed:', err);
            toast.error('Search failed.');
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-8 space-y-10">
            <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-2xl">
                <h1 className="text-2xl font-bold text-black text-center mb-5">
                    OCR Image Upload
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
                        {loading ? 'Processing...' : 'Upload Image'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-2xl">
                <h2 className="text-xl font-bold text-black mb-4">Search OCR Chunks</h2>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search text..."
                        className="flex-grow border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-black text-white px-4 py-2 rounded-md"
                    >
                        Search
                    </button>
                </div>

                {typedAnswer && (
                    <div className="mt-4 bg-gray-100 border border-gray-300 p-4 rounded-md text-black w-full max-w-2xl">
                        <h3 className="font-semibold text-lg mb-2">Answer:</h3>
                        <p className="whitespace-pre-wrap">{typedAnswer}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default OCRUploader;
