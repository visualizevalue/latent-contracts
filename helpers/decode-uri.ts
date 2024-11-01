export const decodeBase64URI = (uri: string) => {
  const json = Buffer.from(uri.substring(29), 'base64').toString()
  return JSON.parse(json)
}

/**
 * Extracts the original SVG string from a base64-encoded data URI
 * @param dataUri - The data URI to decode
 * @returns The original SVG string or null if invalid
 */
export function decodeSvgDataUri(dataUri: string): string | null {
  const base64Content = dataUri.split(',')[1];

  try {
    return typeof window === 'undefined'
      ? Buffer.from(base64Content, 'base64').toString('utf-8')  // Node.js environment
      : atob(base64Content);                                    // Browser environment
  } catch {
    return null;
  }
}
