export interface ClaimantFilterRequest {
    requestStatus?: string | null;
    nextActionDate?: string;
    page: number;
    size: number;
    backOfficeAssigneeEmail?: string;
    hideResellerClaimant?: boolean;
    sortingField?: string;
    sortingOrder?: 'asc' | 'desc';
    searchString?: string;
}

export interface Claimant {
    claimantId: string;                 // Claimant ID
    requesterName: string;              // Requester Name
    requesterCompany: string;           // Requester Company
    matterId?: string;                   // Matter ID
    caseId?: string;                     // Case ID
    uniqueId?: string;                   // Unique ID
    firstName: string;                   // First Name
    lastName: string;                    // Last Name
    emailId: string;                     // Email ID
    phoneNumber: string;                 // Phone Number
    // Optional: Add extra fields if your backend sends them
    createdDate?: string;                // Record creation date
    updatedDate?: string;                // Record last updated date
}

export interface ClaimantPageResponse {
    claimantResponseDto2List: Claimant[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
}

export const getDefaultClaimantFilters = (): ClaimantFilterRequest => ({
    requestStatus: null,
    nextActionDate: new Date().toISOString(),
    page: 0,
    size: 10,
    backOfficeAssigneeEmail: "",
    hideResellerClaimant: false,
    sortingField: "id",
    sortingOrder: "asc",
    searchString: ""
});