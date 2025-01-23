'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AdminPage() {
    const [stylists, setStylists] = useState([]);
    const [selectedStylist, setSelectedStylist] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [workImages, setWorkImages] = useState([]);
    const [workVideos, setWorkVideos] = useState([]);
    const [profilePreview, setProfilePreview] = useState('');
    const [workImagePreviews, setWorkImagePreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [workImageInputs, setWorkImageInputs] = useState([{ id: 0, file: null, preview: null }]);
    const [workVideoInputs, setWorkVideoInputs] = useState([{ id: 0, file: null }]);
    const [nextInputId, setNextInputId] = useState(1);

    // Fetch stylists on component mount
    useEffect(() => {
        const fetchStylists = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/stylist/getAllStylists', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ensure you have the token
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setStylists(data.stylists);
                }
            } catch (error) {
                console.error('Error fetching stylists:', error);
            }
        };

        fetchStylists();
    }, []);

    // Handle file selections
    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            const previewUrl = URL.createObjectURL(file);
            setProfilePreview(previewUrl);
        }
    };

    const handleWorkImageChange = (id, e) => {
        const file = e.target.files?.[0];
        if (file) {
            setWorkImageInputs(prev => prev.map(input => {
                if (input.id === id) {
                    return {
                        ...input,
                        file,
                        preview: URL.createObjectURL(file)
                    };
                }
                return input;
            }));
        }
    };

    const addWorkImageInput = () => {
        setWorkImageInputs(prev => [...prev, { id: nextInputId, file: null, preview: null }]);
        setNextInputId(prev => prev + 1);
    };

    const removeWorkImageInput = (id) => {
        setWorkImageInputs(prev => prev.filter(input => input.id !== id));
    };

    const handleWorkVideoChange = (id, e) => {
        const file = e.target.files?.[0];
        if (file) {
            setWorkVideoInputs(prev => prev.map(input => {
                if (input.id === id) {
                    return { ...input, file };
                }
                return input;
            }));
        }
    };

    const addWorkVideoInput = () => {
        setWorkVideoInputs(prev => [...prev, { id: nextInputId, file: null }]);
        setNextInputId(prev => prev + 1);
    };

    const removeWorkVideoInput = (id) => {
        setWorkVideoInputs(prev => prev.filter(input => input.id !== id));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStylist) return;

        setIsUploading(true);
        try {
            // Upload profile image
            if (profileImage) {
                const profileFormData = new FormData();
                profileFormData.append('media', profileImage);
                await fetch(`http://localhost:8000/api/v1/stylist/upload/${selectedStylist.id}/profile`, {
                    method: 'POST',
                    body: profileFormData,
                });
            }

            // Upload work images
            const workImagesFormData = new FormData();
            workImageInputs.forEach(input => {
                if (input.file) {
                    workImagesFormData.append('media', input.file);
                }
            });
            if (workImagesFormData.has('media')) {
                await fetch(`http://localhost:8000/api/v1/stylist/upload/${selectedStylist.id}/work-images`, {
                    method: 'POST',
                    body: workImagesFormData,
                });
            }

            // Upload work videos
            const workVideosFormData = new FormData();
            workVideoInputs.forEach(input => {
                if (input.file) {
                    workVideosFormData.append('media', input.file);
                }
            });
            if (workVideosFormData.has('media')) {
                await fetch(`http://localhost:8000/api/v1/stylist/upload/${selectedStylist.id}/work-videos`, {
                    method: 'POST',
                    body: workVideosFormData,
                });
            }

            alert('All media uploaded successfully!');
            // Reset form
            setProfileImage(null);
            setProfilePreview('');
            setWorkImageInputs([{ id: 0, file: null, preview: null }]);
            setWorkVideoInputs([{ id: 0, file: null }]);
            setNextInputId(1);
        } catch (error) {
            console.error('Error uploading media:', error);
            alert('Error uploading media. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">
                Media Upload
            </h1>

            {/* Stylist Selection */}
            <div className="mb-8">
                <label className="block text-sm font-medium mb-2 text-yellow-500">Select Stylist</label>
                <select 
                    className="w-full p-3 bg-gray-900 border border-yellow-500/30 rounded-lg focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                    onChange={(e) => {
                        const stylist = stylists.find(s => s.id === parseInt(e.target.value));
                        setSelectedStylist(stylist || null);
                    }}
                    value={selectedStylist?.id || ''}
                >
                    <option value="">Select a stylist</option>
                    {stylists.map(stylist => (
                        <option key={stylist.id} value={stylist.id}>
                            {stylist.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStylist && (
                <motion.form 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    onSubmit={handleSubmit} 
                    className="space-y-8"
                >
                    {/* Profile Image Upload */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                        <h2 className="text-xl font-semibold mb-4 text-yellow-500">Profile Image</h2>
                        <div className="relative group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageChange}
                                className="hidden"
                                id="profile-upload"
                            />
                            <label 
                                htmlFor="profile-upload"
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-yellow-500/30 rounded-lg cursor-pointer hover:border-yellow-500 transition-all"
                            >
                                {profilePreview ? (
                                    <div className="relative w-full h-full">
                                        <Image 
                                            src={profilePreview} 
                                            alt="Profile preview" 
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            className="rounded-lg p-2"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-yellow-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p className="mt-2 text-sm text-yellow-500">Click to upload profile image</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Work Images Upload */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-yellow-500">Work Images</h2>
                            <button
                                type="button"
                                onClick={addWorkImageInput}
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all font-semibold"
                            >
                                + Add Image
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {workImageInputs.map((input) => (
                                <motion.div 
                                    key={input.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleWorkImageChange(input.id, e)}
                                        className="hidden"
                                        id={`work-image-${input.id}`}
                                    />
                                    <label 
                                        htmlFor={`work-image-${input.id}`}
                                        className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-yellow-500/30 rounded-lg cursor-pointer hover:border-yellow-500 transition-all"
                                    >
                                        {input.preview ? (
                                            <div className="relative w-full h-full">
                                                <Image 
                                                    src={input.preview}
                                                    alt="Work image preview"
                                                    fill
                                                    style={{ objectFit: 'contain' }}
                                                    className="rounded-lg p-2"
                                                />
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <svg className="mx-auto h-12 w-12 text-yellow-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-2 text-sm text-yellow-500">Click to upload work image</p>
                                            </div>
                                        )}
                                    </label>
                                    {workImageInputs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWorkImageInput(input.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Work Videos Upload */}
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-yellow-500">Work Videos</h2>
                            <button
                                type="button"
                                onClick={addWorkVideoInput}
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-all font-semibold"
                            >
                                + Add Video
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {workVideoInputs.map((input) => (
                                <motion.div 
                                    key={input.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group bg-gray-800/50 p-4 rounded-lg"
                                >
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={(e) => handleWorkVideoChange(input.id, e)}
                                        className="hidden"
                                        id={`work-video-${input.id}`}
                                    />
                                    <label 
                                        htmlFor={`work-video-${input.id}`}
                                        className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-yellow-500/30 rounded-lg cursor-pointer hover:border-yellow-500 transition-all"
                                    >
                                        {input.file ? (
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="mt-2 text-sm text-yellow-500">{input.file.name}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <svg className="mx-auto h-8 w-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                <p className="mt-2 text-sm text-yellow-500">Click to upload video</p>
                                            </div>
                                        )}
                                    </label>
                                    {workVideoInputs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeWorkVideoInput(input.id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                            isUploading 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black'
                        }`}
                    >
                        {isUploading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </div>
                        ) : 'Upload All Media'}
                    </button>
                </motion.form>
            )}
        </div>
    );
}