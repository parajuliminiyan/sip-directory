import { z } from 'zod';

// Zod schemas for validation
export const SIPDataSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  shortSummary: z.string().optional(),
  description: z.string().optional(),
  costMinUSD: z.number().int().nonnegative().optional(),
  costMaxUSD: z.number().int().nonnegative().optional(),
  supplier: z.string().optional(),
  manufacturer: z.string().optional(),
  scrapedAt: z.date().optional(),
  dataSource: z.enum(['scraped', 'curated', 'manual']).optional(),
  categories: z.array(z.string()).default([]),
  operatingSystems: z.array(z.string()).default([]),
  versions: z.array(z.object({
    name: z.string(),
    releasedAt: z.date().optional(),
    notes: z.string().optional(),
  })).default([]),
  components: z.array(z.object({
    type: z.enum(['HARDWARE', 'SOFTWARE']),
    name: z.string(),
    spec: z.string().optional(),
    required: z.boolean().default(true),
  })).default([]),
  dependencies: z.array(z.string()).default([]),
});

export type SIPData = z.infer<typeof SIPDataSchema>;

export interface FetchResult {
  source: string;
  success: boolean;
  sipsCount: number;
  error?: string;
  duration: number;
}

export interface ETLOptions {
  dryRun?: boolean;
  sources?: string[];
  verbose?: boolean;
}

export interface SourceFetcher {
  name: string;
  fetch: () => Promise<SIPData[]>;
}
