import { z } from 'zod';

export const PositionEnum = z.enum(['goalkeeper', 'defender', 'midfielder', 'forward']);
export type Position = z.infer<typeof PositionEnum>;

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  short_name: z.string(),
  number: z.number().nullable(),
  position: PositionEnum,
  nationality: z.string(),
  date_of_birth: z.string(), // YYYY-MM-DD
  height_cm: z.number().optional(),
  photo_url: z.string().optional(),
  stats: z.object({
    appearances: z.number(),
    goals: z.number(),
    assists: z.number(),
    yellow_cards: z.number(),
    red_cards: z.number(),
    minutes_played: z.number(),
    clean_sheets: z.number().optional(), // goalkeepers only
  }).optional(),
});
export type Player = z.infer<typeof PlayerSchema>;
