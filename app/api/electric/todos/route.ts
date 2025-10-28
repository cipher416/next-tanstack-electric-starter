import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { NextResponse } from "next/server";

const ELECTRIC_URL = process.env.ELECTRIC_URL;

if (!ELECTRIC_URL) {
  throw new Error("ELECTRIC_URL environment variable is required");
}

export async function GET(request: Request) {
  const incomingUrl = new URL(request.url);
  const upstream = new URL("/v1/shape", ELECTRIC_URL);

  incomingUrl.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      upstream.searchParams.set(key, value);
    }
  });

  upstream.searchParams.set("table", "todos");

  const response = await fetch(upstream, {
    headers: request.headers,
  });

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
