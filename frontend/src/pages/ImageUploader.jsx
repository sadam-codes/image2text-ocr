import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OCRUploader = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [typedAnswer, setTypedAnswer] = useState('');
    const [filenames, setFilenames] = useState([]);
    const [selectedFilename, setSelectedFilename] = useState('');

    useEffect(() => {
        const fetchFilenames = async () => {
            try {
                const res = await axios.get('http://localhost:4000/api/ocr/results');
                const uniqueFilenames = [...new Set(res.data.map(chunk => chunk.filename))];
                setFilenames(uniqueFilenames);
            } catch (err) {
                toast.error('Failed to fetch filenames');
            }
        };
        fetchFilenames();
    }, []);

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
            setFile(null);
            setQuery('');
            setSelectedFilename('');
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

        if (!selectedFilename) {
            toast.error('Please select a file from dropdown.');
            return;
        }

        try {
            const res = await axios.get('http://localhost:4000/api/ocr/query', {
                params: { q: query, filename: selectedFilename },
            });

            const fullAnswer = res.data.answer || '';

            if (
                fullAnswer.toLowerCase().includes(`no matching results found for file`) ||
                fullAnswer.toLowerCase().includes("sorry! i couldn't find")
            ) {
                toast.error('No relevant results found in the selected file.');
                setTypedAnswer('');
                return;
            }

            setAnswer(fullAnswer);
            setTypedAnswer(fullAnswer.charAt(0) || '');
            setQuery('');
            let i = 0;
            const interval = setInterval(() => {
                setTypedAnswer(prev => prev + fullAnswer.charAt(i));
                i++;
                if (i >= fullAnswer.length) clearInterval(interval);
            }, 20);

            setQuery('');
        } catch (err) {
            console.error('Search failed:', err);
            toast.error('Search failed.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white py-12 px-4 flex flex-col items-center space-y-10">
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-800">OCR Image Upload</h1>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full border border-gray-300 text-gray-800 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                />
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full py-2 rounded-md font-semibold text-white transition duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                        }`}
                >
                    {loading ? 'Processing...' : 'Upload Image'}
                </button>
            </div>
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8 space-y-6">
                <h2 className="text-2xl font-bold text-center text-gray-800">Search OCR Chunks</h2>

                <select
                    value={selectedFilename}
                    onChange={(e) => setSelectedFilename(e.target.value)}
                    className="w-full border border-gray-300 p-2 rounded-md bg-white text-black"
                >
                    <option value="">Select a file</option>
                    {filenames.map((name, index) => (
                        <option key={index} value={name}>{name}</option>
                    ))}
                </select>

                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search your query..."
                        className="w-full sm:flex-1 border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <button
                        onClick={handleSearch}
                        className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
                    >
                        Search
                    </button>
                </div>

                {typedAnswer && (
                    <div className="bg-gray-100 border border-gray-300 p-4 rounded-md text-gray-800">
                        <h3 className="font-semibold text-lg mb-2">Answer:</h3>
                        <p className="whitespace-pre-wrap">{typedAnswer}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OCRUploader;
