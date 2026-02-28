import {promises as fs} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {MOCK_HEADLINES, MOCK_GENERATED_CONTENT} from '../src/lib/mock-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../tmp');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'mock-seed.json');

type SerializableContent = Omit<(typeof MOCK_GENERATED_CONTENT)[number], 'date'> & {date: string};

type SeedPayload = {
  generatedAt: string;
  headlines: typeof MOCK_HEADLINES;
  contentPacks: SerializableContent[];
};

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, {recursive: true});
}

function buildPayload(): SeedPayload {
  const contentPacks: SerializableContent[] = MOCK_GENERATED_CONTENT.map(item => ({
    ...item,
    date: item.date.toISOString(),
  }));

  return {
    generatedAt: new Date().toISOString(),
    headlines: MOCK_HEADLINES,
    contentPacks,
  };
}

async function writeSeedFile(payload: SeedPayload) {
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
}

async function main() {
  await ensureOutputDir();
  const payload = buildPayload();
  await writeSeedFile(payload);
  console.log(`Mock data exported to ${OUTPUT_FILE}`);
  console.log('Import the JSON into Supabase via the dashboard or CLI to seed your tables.');
}

main().catch(err => {
  console.error('Failed to generate seed data:', err);
  process.exit(1);
});
