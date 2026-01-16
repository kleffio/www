import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a GitHub repository URL to show just the repo name with GitHub icon
 * @param url Full GitHub URL
 * @returns Object with display text and link URL
 */
export function formatRepoUrl(url: string | null | undefined) {
  if (!url) return { display: "—", link: null };

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'github.com') {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2) {
        const repoName = `${pathParts[0]}/${pathParts[1]}`;
        return { display: repoName, link: url };
      }
    }
  } catch (e) {
    // Invalid URL, return as-is
  }

  return { display: url, link: url };
}

/**
 * Format a timestamp to human-readable format
 * @param timestamp ISO timestamp string
 * @returns Human-readable time string
 */
export function formatTimeAgo(timestamp: string) {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (e) {
    return timestamp;
  }
}

/**
 * Format port number with label
 * @param port Port number as string
 * @returns Formatted port display
 */
export function formatPort(port: string) {
  return `Port: ${port}`;
}
