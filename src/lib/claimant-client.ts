// src/lib/claimant-client.ts

import {ClaimantFilterRequest, ClaimantPageResponse} from "@/lib/types";

export async function getClaimantsClient(filters: ClaimantFilterRequest): Promise<ClaimantPageResponse> {
    // Get token from API route instead of session directly
    const sessionResponse = await fetch('/api/auth/jwt');
    if (!sessionResponse.ok) {
        throw new Error('Failed to get session');
    }
    const sessionData = await sessionResponse.json();
    const token = sessionData?.jwt;

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch('/api/claimant/getAllFilteredPageable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(filters)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}