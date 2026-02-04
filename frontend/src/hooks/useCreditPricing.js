import { useState, useEffect } from 'react';
import api from '@/api/axios';

// Default values (used before API response)
const DEFAULT_PRICING = {
    podcast: 3,
    youtubeSummary: 2,
    webSummary: 2,
    audioGeneration: 2,
};

/**
 * Hook to fetch and cache credit pricing from the backend.
 * @returns {{ pricing: object, loading: boolean, error: string | null }}
 */
export function useCreditPricing() {
    const [pricing, setPricing] = useState(DEFAULT_PRICING);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                const res = await api.get('/auth/pricing');
                if (res.data.success) {
                    setPricing(res.data.pricing);
                }
            } catch (err) {
                console.error('Failed to fetch credit pricing:', err);
                setError(err.message);
                // Keep using default values
            } finally {
                setLoading(false);
            }
        };

        fetchPricing();
    }, []);

    return { pricing, loading, error };
}

/**
 * Get credit cost for a given activity type
 * @param {object} pricing - The pricing object from useCreditPricing
 * @param {string} activityType - 'podcast', 'summary', etc.
 * @param {string} summaryType - 'youtube' or 'web' (only for summaries)
 * @returns {number}
 */
export function getCreditCost(pricing, activityType, summaryType = 'youtube') {
    if (activityType === 'podcast') {
        return pricing.podcast;
    }
    if (activityType === 'summary') {
        return summaryType === 'web' ? pricing.webSummary : pricing.youtubeSummary;
    }
    return pricing.youtubeSummary; // fallback
}

export default useCreditPricing;
