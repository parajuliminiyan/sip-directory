import axios, { AxiosRequestConfig } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';

// Create slug from name
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Rate limiter
const lastRequestTime: Record<string, number> = {};

export async function rateLimitedRequest<T>(
  url: string,
  config?: AxiosRequestConfig,
  delayMs: number = 500
): Promise<T> {
  const domain = new URL(url).hostname;
  const now = Date.now();
  const lastTime = lastRequestTime[domain] || 0;
  const elapsed = now - lastTime;

  if (elapsed < delayMs) {
    await sleep(delayMs - elapsed);
  }

  lastRequestTime[domain] = Date.now();
  const response = await axios.get<T>(url, config);
  return response.data;
}

// Retry logic with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Max retry attempts reached');
}

// Fetch and parse HTML
export async function fetchHTML(url: string): Promise<cheerio.CheerioAPI> {
  const html = await rateLimitedRequest<string>(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SIPDirectory/1.0; +https://github.com/academic-project)',
    },
  });
  return cheerio.load(html);
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ensure logs directory exists
export async function ensureLogsDir(): Promise<string> {
  const logsDir = path.join(process.cwd(), 'logs');
  await fs.mkdir(logsDir, { recursive: true });
  return logsDir;
}

// Create timestamped log file
export async function createLogFile(): Promise<string> {
  const logsDir = await ensureLogsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join(logsDir, `etl-${timestamp}.log`);
  return logPath;
}

// Append to log file
export async function appendLog(logPath: string, message: string): Promise<void> {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  await fs.appendFile(logPath, logMessage);
}

// Extract version from GitHub releases
export interface GitHubRelease {
  tag_name: string;
  published_at: string;
  body: string;
}

export async function fetchGitHubReleases(
  owner: string,
  repo: string,
  limit: number = 5
): Promise<GitHubRelease[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases`;

  try {
    const releases = await rateLimitedRequest<GitHubRelease[]>(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'SIPDirectory-ETL',
      },
    });

    return releases.slice(0, limit);
  } catch (error) {
    console.warn(`Failed to fetch releases for ${owner}/${repo}:`, error);
    return [];
  }
}

// Check robots.txt before scraping
export async function checkRobotsTxt(url: string, userAgent: string = '*'): Promise<boolean> {
  try {
    const baseUrl = new URL(url);
    const robotsUrl = `${baseUrl.protocol}//${baseUrl.host}/robots.txt`;

    const robotsTxt = await rateLimitedRequest<string>(robotsUrl);

    // Simple robots.txt parser - in production, use a proper library
    const lines = robotsTxt.split('\n');
    let currentAgent = '';
    let disallowedPaths: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();

      if (trimmed.startsWith('user-agent:')) {
        currentAgent = trimmed.split(':')[1].trim();
      } else if (trimmed.startsWith('disallow:') && (currentAgent === '*' || currentAgent === userAgent.toLowerCase())) {
        const path = trimmed.split(':')[1].trim();
        if (path) disallowedPaths.push(path);
      }
    }

    // Check if URL path is disallowed
    const urlPath = baseUrl.pathname;
    return !disallowedPaths.some(path => urlPath.startsWith(path));
  } catch (error) {
    // If robots.txt doesn't exist or can't be fetched, allow by default
    console.warn(`Could not check robots.txt for ${url}, proceeding with caution`);
    return true;
  }
}
