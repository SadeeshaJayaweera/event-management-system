'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { eventService } from '../../../services/eventService';
import { CreateEventRequest, EventCategory } from '../../../types';
import { getErrorMessage } from '../../../lib/api';
import Link from 'next/link';

export default function CreateEventPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        location: '',
        price: 0,
        category: 'TECHNOLOGY' as EventCategory,
        imageUrl: '',
        capacity: 100,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login?redirect=/events/create');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, create a local preview. In production, you'd upload to a server
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageAreaClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);

        if (!user) {
            setFormError('You must be logged in to create an event.');
            setIsSubmitting(false);
            return;
        }

        // Validation
        if (!formData.title.trim()) {
            setFormError('Event title is required.');
            setIsSubmitting(false);
            return;
        }

        if (!formData.eventDate) {
            setFormError('Event date is required.');
            setIsSubmitting(false);
            return;
        }

        if (!formData.startTime) {
            setFormError('Start time is required.');
            setIsSubmitting(false);
            return;
        }

        if (!formData.location.trim()) {
            setFormError('Location is required.');
            setIsSubmitting(false);
            return;
        }

        try {
            // Format time to HH:mm:ss
            const startTimeFormatted = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
            // Default end time to 2 hours after start if not specified
            const endTimeFormatted = startTimeFormatted;

            const payload: CreateEventRequest = {
                title: formData.title,
                description: formData.description || 'No description provided.',
                eventDate: formData.eventDate,
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                location: formData.location,
                address: formData.location,
                capacity: formData.capacity || 100,
                price: formData.price || 0,
                category: formData.category,
                organizerId: user.id,
                organizerName: `${user.firstName} ${user.lastName}`,
                imageUrls: imagePreview ? [imagePreview] : formData.imageUrl ? [formData.imageUrl] : [],
                thumbnailUrl: imagePreview || formData.imageUrl || '',
                featured: false,
            };

            await eventService.createEvent(payload);

            // Redirect to organizer events page
            router.push('/dashboard/organizer/events');
        } catch (err) {
            console.error('Failed to create event:', err);
            setFormError(getErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories: { value: EventCategory; label: string }[] = [
        { value: 'TECHNOLOGY', label: 'Technology' },
        { value: 'CONFERENCE', label: 'Conference' },
        { value: 'WORKSHOP', label: 'Workshop' },
        { value: 'SEMINAR', label: 'Seminar' },
        { value: 'CONCERT', label: 'Concert' },
        { value: 'SPORTS', label: 'Sports' },
        { value: 'EXHIBITION', label: 'Exhibition' },
        { value: 'NETWORKING', label: 'Networking' },
        { value: 'PARTY', label: 'Party' },
        { value: 'CHARITY', label: 'Charity' },
        { value: 'EDUCATION', label: 'Education' },
        { value: 'BUSINESS', label: 'Business' },
        { value: 'ARTS', label: 'Arts' },
        { value: 'FOOD', label: 'Food' },
        { value: 'HEALTH', label: 'Health' },
        { value: 'OTHER', label: 'Other' },
    ];

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
                        <p className="text-gray-500 text-sm">Fill in the details to publish your event.</p>
                    </div>
                </div>

                {/* Error Message */}
                {formError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{formError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Event Media Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-gray-900">Event Media</h2>
                        </div>

                        <div
                            onClick={handleImageAreaClick}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-gray-50 transition-colors"
                        >
                            {imagePreview ? (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Event cover"
                                        className="max-h-48 mx-auto rounded-lg object-cover"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">Click to change image</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-900 font-medium mb-1">Click to upload cover image</p>
                                    <p className="text-sm text-gray-500">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>

                    {/* Basic Info and Date & Time Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Basic Info Section */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                <h2 className="text-lg font-semibold text-gray-900">Basic Info</h2>
                            </div>

                            <div className="space-y-5">
                                {/* Event Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Annual Tech Summit 2026"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 appearance-none bg-white"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe your event, agenda, and what attendees can expect..."
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date & Time and Ticketing Column */}
                        <div className="space-y-6">
                            {/* Date & Time Section */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-gray-900">Date & Time</h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="eventDate"
                                            value={formData.eventDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ticketing Section */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2 mb-6">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h2 className="text-lg font-semibold text-gray-900">Ticketing</h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price per Ticket ($)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Enter 0 for free events.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <h2 className="text-lg font-semibold text-gray-900">Location</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Venue or Online Link
                            </label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. Moscone Center, San Francisco"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity (Hidden but still needed for backend) */}
                    <input type="hidden" name="capacity" value={formData.capacity} />

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Publish Event
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
