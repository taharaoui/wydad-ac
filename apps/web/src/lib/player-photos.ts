import fs from 'node:fs';
import path from 'node:path';

/**
 * Player photos uploaded by the club. TheStatsAPI has no player images, so photos are
 * dropped into public/assets/players/{player_id}.png|.webp|.jpg (id as in the API, e.g. pl_84592403).
 * Server-only: reads the folder and returns id → public URL for the players that have one.
 */
const DIR = path.join(process.cwd(), 'public', 'assets', 'players');
const EXTENSIONS = ['.webp', '.png', '.jpg', '.jpeg'];

export function getPlayerPhotos(playerIds: string[]): Record<string, string> {
  let files: string[];
  try {
    files = fs.readdirSync(DIR);
  } catch {
    return {};
  }
  const available = new Map<string, string>();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (EXTENSIONS.includes(ext)) available.set(path.basename(file, path.extname(file)), file);
  }
  const photos: Record<string, string> = {};
  for (const id of playerIds) {
    const file = available.get(id);
    if (file) photos[id] = `/assets/players/${file}`;
  }
  return photos;
}
