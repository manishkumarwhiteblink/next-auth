import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function proxyRequest(req: NextRequest, path: string[]) {
    const session = await getSession();

    if (!session.isAuthenticated || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = `${API_BASE_URL}/${path.join("/")}${req.nextUrl.search}`;
    console.log(`[Proxy] → ${req.method} ${backendUrl}`);

    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
        if (key.toLowerCase() === "host" || key.toLowerCase() === "content-length") return;
        headers[key] = value;
    });
    headers["Authorization"] = `Bearer ${session.accessToken}`;

    const contentType = req.headers.get("content-type") || "";
    const isMultipart = contentType.startsWith("multipart/form-data");

    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
        body = isMultipart ? req.body : await req.text();
    }

    try {
        const response = await fetch(backendUrl, {
            method: req.method,
            headers,
            body,
            redirect: "manual",
        });

        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
        });

        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error: any) {
        console.error("[Proxy Error]", error);
        return NextResponse.json(
            { error: "Proxy error", details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params;
    return proxyRequest(req, path);
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
