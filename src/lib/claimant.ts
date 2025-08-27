import { authenticatedFetch, serverAuthenticatedFetch } from '@/lib/jwt-utils';
import {ClaimantFilterRequest, ClaimantPageResponse} from "@/lib/types";



// Client-side API call
export async function getClaimantsClient(filters: ClaimantFilterRequest): Promise<ClaimantPageResponse> {
    const response = await authenticatedFetch('/claimant/getAllFilteredPageable', {
        method: 'POST',
        body: JSON.stringify(filters),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch claimants');
    }

    return response.json();
}

// Server-side API call
export async function getClaimantsServer(filters: ClaimantFilterRequest): Promise<ClaimantPageResponse> {
    const response = await serverAuthenticatedFetch('/claimant/getAllFilteredPageable', {
        method: 'POST',
        body: JSON.stringify(filters),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch claimants');
    }

    return response.json();
}

// Default filter for initial load
