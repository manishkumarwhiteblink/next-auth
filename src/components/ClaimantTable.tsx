'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

import { getClaimantsClient } from '@/lib/claimant-client';
import { ClaimantFilterRequest, ClaimantPageResponse, getDefaultClaimantFilters } from "@/lib/types";

interface ClaimantTableProps {
    initialData?: ClaimantPageResponse;
}

export default function ClaimantTable({ initialData }: ClaimantTableProps) {
    const [data, setData] = useState<ClaimantPageResponse | null>(initialData || null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<ClaimantFilterRequest>({
        ...getDefaultClaimantFilters(),
        page: 0,
        size: 10
    });
    const [searchInput, setSearchInput] = useState('');

    const fetchData = async (newFilters?: Partial<ClaimantFilterRequest>) => {
        setLoading(true);
        setError(null);

        try {
            const updatedFilters: ClaimantFilterRequest = {
                ...filters,
                page: filters.page ?? 0,
                size: filters.size ?? 10,
                ...newFilters,
                page: newFilters?.page ?? filters.page ?? 0,
                size: newFilters?.size ?? filters.size ?? 10
            };

            const response = await getClaimantsClient(updatedFilters);
            setData(response);
            setFilters(updatedFilters);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to load claimants');
            console.error('Error fetching claimants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialData) {
            fetchData();
        }
    }, []);

    const handleSearch = () => {
        fetchData({ searchString: searchInput, page: 0 });
    };

    const handlePageChange = (newPage: number) => {
        fetchData({ page: newPage });
    };

    const handleSort = (field: string) => {
        const newOrder = filters.sortingField === field && filters.sortingOrder === 'asc'
            ? 'desc'
            : 'asc';
        fetchData({ sortingField: field, sortingOrder: newOrder, page: 0 });
    };

    if (loading && !data) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading claimants...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error && !data) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <p className="text-destructive mb-4">Error: {error}</p>
                        <Button onClick={() => fetchData()} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center space-x-2">
                            <span>Claimants</span>
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data ? `${data.totalElements} total claimants` : 'Loading...'}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <Input
                                placeholder="Search claimants..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-64"
                            />
                            <Button onClick={handleSearch} size="sm" variant="outline">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button onClick={() => fetchData()} size="sm" variant="outline">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                {data && data.claimantResponseDto2List.length > 0 ? (
                    <>
                        {/* Table */}
                        <div className="border rounded-lg overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="text-left p-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleSort('claimantId')}
                                            className="h-auto p-0 font-semibold hover:bg-transparent"
                                        >
                                            Claimant ID
                                            <ArrowUpDown className="h-3 w-3 ml-1" />
                                        </Button>
                                    </th>
                                    <th className="text-left p-3">Requester Name</th>
                                    <th className="text-left p-3">Requester Company</th>
                                    <th className="text-left p-3">Matter ID / Case ID / Unique ID</th>
                                    <th className="text-left p-3">First Name</th>
                                    <th className="text-left p-3">Last Name</th>
                                    <th className="text-left p-3">Email ID</th>
                                    <th className="text-left p-3">Phone Number</th>
                                    <th className="text-left p-3">Expand</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.claimantResponseDto2List.map((claimant) => (
                                    <tr key={claimant.claimantId} className="border-b hover:bg-muted/25">
                                        <td className="p-3 font-mono text-sm">{claimant.claimantId}</td>
                                        <td className="p-3 font-medium">{claimant.requesterName}</td>
                                        <td className="p-3">{claimant.requesterCompany}</td>
                                        <td className="p-3">{claimant.matterId || claimant.caseId || claimant.uniqueId}</td>
                                        <td className="p-3">{claimant.firstName}</td>
                                        <td className="p-3">{claimant.lastName}</td>
                                        <td className="p-3 text-sm text-muted-foreground">{claimant.emailId}</td>
                                        <td className="p-3">{claimant.phoneNumber}</td>
                                        <td className="p-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => console.log('Expand clicked', claimant)}
                                            >
                                                Expand
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <span>
                                    Showing {data.numberOfElements} of {data.totalElements} results
                                </span>
                                <span>•</span>
                                <span>
                                    Page {(data?.number ?? 0) + 1} of {data?.totalPages ?? 1}
                                </span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange((data?.number ?? 0) - 1)}
                                    disabled={data?.first || loading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange((data?.number ?? 0) + 1)}
                                    disabled={data?.last || loading}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No claimants found</p>
                        {filters.searchString && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchData({ searchString: '', page: 0 })}
                                className="mt-2"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
