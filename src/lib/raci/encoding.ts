/**
 * RACI Chart Encoding & Decoding
 * Handles base64 encoding/decoding for public links with optional compression
 */

import { RaciChart } from "@/types/raci";
import pako from "pako";

/**
 * Browser-compatible base64 encoding
 */
function toBase64(data: Uint8Array | string): string {
  if (typeof data === "string") {
    return btoa(unescape(encodeURIComponent(data)));
  }
  // Convert Uint8Array to string
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

/**
 * Browser-compatible base64 decoding
 */
function fromBase64(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encoded payload structure with metadata
 */
export interface EncodedPayload {
  version: "1.0.0";
  timestamp: string; // ISO 8601 UTC
  compressed: boolean;
  data: string; // Base64 encoded JSON or gzip data
}

/**
 * Errors that can occur during encoding/decoding
 */
export class EncodingError extends Error {
  constructor(
    public code:
      | "INVALID_CHART"
      | "ENCODE_FAILED"
      | "DECODE_FAILED"
      | "INVALID_PAYLOAD"
      | "CORRUPT_DATA"
      | "UNSUPPORTED_VERSION",
    message: string
  ) {
    super(message);
    this.name = "EncodingError";
  }
}

/**
 * Maximum URL length (most browsers support ~2000 chars, being conservative)
 */
const MAX_URL_LENGTH = 2000;

/**
 * Maximum payload size before enforcing compression (50KB)
 */
const COMPRESSION_THRESHOLD = 50 * 1024;

/**
 * Validates a RACI chart before encoding
 * Ensures required fields are present and valid
 */
function validateChart(chart: unknown): asserts chart is RaciChart {
  if (!chart || typeof chart !== "object") {
    throw new EncodingError("INVALID_CHART", "Chart must be a valid object");
  }

  const c = chart as Record<string, unknown>;

  if (typeof c.id !== "string" || !c.id) {
    throw new EncodingError("INVALID_CHART", "Chart must have a valid ID");
  }

  if (c.version !== "1.0.0") {
    throw new EncodingError(
      "INVALID_CHART",
      `Unsupported chart version: ${c.version}`
    );
  }

  if (typeof c.title !== "string") {
    throw new EncodingError("INVALID_CHART", "Chart must have a title");
  }

  if (!Array.isArray(c.roles) || !Array.isArray(c.tasks)) {
    throw new EncodingError(
      "INVALID_CHART",
      "Chart must have roles and tasks arrays"
    );
  }

  if (typeof c.matrix !== "object" || c.matrix === null) {
    throw new EncodingError("INVALID_CHART", "Chart must have a matrix object");
  }
}

/**
 * Converts a chart to JSON with controlled whitespace for compression
 */
function chartToJson(chart: RaciChart): string {
  try {
    return JSON.stringify(chart);
  } catch (error) {
    throw new EncodingError(
      "ENCODE_FAILED",
      `Failed to serialize chart: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Converts JSON back to a chart object with validation
 */
function jsonToChart(json: string): RaciChart {
  try {
    const parsed = JSON.parse(json);
    validateChart(parsed);
    return parsed;
  } catch (error) {
    if (error instanceof EncodingError) {
      throw error;
    }
    throw new EncodingError(
      "DECODE_FAILED",
      `Failed to parse chart JSON: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Encodes a RACI chart into a URL-safe base64 string
 * with optional gzip compression for large charts
 *
 * @param chart The RACI chart to encode
 * @returns Base64 encoded payload string suitable for URLs
 * @throws EncodingError if encoding fails
 */
export function encodeChart(chart: RaciChart): string {
  try {
    // Validate chart
    validateChart(chart);

    // Convert to JSON
    const json = chartToJson(chart);

    // Determine if compression is needed
    const jsonBytes = new TextEncoder().encode(json);
    const shouldCompress = jsonBytes.length > COMPRESSION_THRESHOLD;

    let dataBuffer: Uint8Array;
    let compressed = false;

    if (shouldCompress) {
      try {
        dataBuffer = pako.deflate(jsonBytes);
        compressed = true;
      } catch (error) {
        // If compression fails, fall back to uncompressed
        console.warn(
          "Compression failed, falling back to uncompressed:",
          error
        );
        dataBuffer = jsonBytes;
        compressed = false;
      }
    } else {
      dataBuffer = jsonBytes;
    }

    // Create payload with metadata
    const payload: EncodedPayload = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      compressed,
      data: toBase64(dataBuffer),
    };

    // Encode payload
    const payloadJson = JSON.stringify(payload);
    const base64 = toBase64(payloadJson);

    // URL-safe encoding: replace +, /, = with -, _, ""
    const urlSafe = base64
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    // Warn if URL might be too long
    if (urlSafe.length > MAX_URL_LENGTH) {
      console.warn(
        `Encoded URL is ${urlSafe.length} chars, may exceed browser limits`
      );
    }

    return urlSafe;
  } catch (error) {
    if (error instanceof EncodingError) {
      throw error;
    }
    throw new EncodingError(
      "ENCODE_FAILED",
      `Unexpected encoding error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Decodes a URL-safe base64 string back into a RACI chart
 *
 * @param encoded The encoded payload from a public link
 * @returns The decoded and validated RACI chart
 * @throws EncodingError if decoding or validation fails
 */
export function decodeChart(encoded: string): RaciChart {
  try {
    if (!encoded || typeof encoded !== "string") {
      throw new EncodingError(
        "INVALID_PAYLOAD",
        "Encoded payload must be a non-empty string"
      );
    }

    // Reverse URL-safe encoding
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    const padding = encoded.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    // Decode base64 to payload JSON
    let payloadJson: string;
    try {
      const payloadBuffer = fromBase64(base64);
      payloadJson = new TextDecoder().decode(payloadBuffer);
    } catch (error) {
      throw new EncodingError(
        "CORRUPT_DATA",
        "Failed to decode base64 payload"
      );
    }

    // Parse payload metadata
    let payload: EncodedPayload;
    try {
      payload = JSON.parse(payloadJson) as unknown as EncodedPayload;
    } catch (error) {
      throw new EncodingError(
        "INVALID_PAYLOAD",
        "Failed to parse payload metadata"
      );
    }

    // Validate version
    if (payload.version !== "1.0.0") {
      throw new EncodingError(
        "UNSUPPORTED_VERSION",
        `Unsupported payload version: ${payload.version}`
      );
    }

    // Decode data
    let json: string;
    try {
      const dataBuffer = fromBase64(payload.data);

      if (payload.compressed) {
        // Decompress using pako
        const decompressed = pako.inflate(dataBuffer);
        json = new TextDecoder().decode(decompressed);
      } else {
        json = new TextDecoder().decode(dataBuffer);
      }
    } catch (error) {
      throw new EncodingError(
        "CORRUPT_DATA",
        `Failed to decode/decompress data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Parse and validate chart
    const chart = jsonToChart(json);

    return chart;
  } catch (error) {
    if (error instanceof EncodingError) {
      throw error;
    }
    throw new EncodingError(
      "DECODE_FAILED",
      `Unexpected decoding error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Generates a public URL for a RACI chart
 * Can be used as a share link or import link
 *
 * @param chart The chart to encode
 * @param baseUrl The base URL (e.g., 'https://example.com')
 * @returns The full public URL
 */
export function generatePublicLink(
  chart: RaciChart,
  baseUrl: string = window.location.origin
): string {
  const encoded = encodeChart(chart);
  const url = new URL(baseUrl);
  url.pathname = "/tools/raci-generator";
  url.searchParams.set("importData", encoded);
  return url.toString();
}

/**
 * Extracts and decodes chart from URL search parameters
 *
 * @param searchParams URL search parameters (e.g., from useSearch() or URLSearchParams)
 * @returns The decoded chart or null if not found
 * @throws EncodingError if decoding fails
 */
export function decodeChartFromUrl(
  searchParams: URLSearchParams | Record<string, string>
): RaciChart | null {
  let encoded: string | null = null;

  if (searchParams instanceof URLSearchParams) {
    encoded = searchParams.get("data");
  } else {
    encoded = searchParams.data || null;
  }

  if (!encoded) {
    return null;
  }

  return decodeChart(encoded);
}

/**
 * Gets payload metadata (version, timestamp, compressed flag)
 * without fully decoding the chart - useful for diagnostics
 *
 * @param encoded The encoded payload
 * @returns Payload metadata
 * @throws EncodingError if metadata extraction fails
 */
export function getPayloadMetadata(
  encoded: string
): Omit<EncodedPayload, "data"> {
  try {
    // Reverse URL-safe encoding
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if needed
    const padding = encoded.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    // Decode base64 to payload JSON
    const payloadBuffer = fromBase64(base64);
    const payloadJson = new TextDecoder().decode(payloadBuffer);
    const payload = JSON.parse(payloadJson) as unknown as EncodedPayload;

    const { version, timestamp, compressed } = payload;
    return { version, timestamp, compressed };
  } catch (error) {
    throw new EncodingError(
      "INVALID_PAYLOAD",
      `Failed to extract metadata: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
