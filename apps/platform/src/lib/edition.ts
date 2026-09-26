const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
export const EDITION = (
  [2, 3, 4].includes(Number(env.VITE_EDITION)) ? Number(env.VITE_EDITION) : 2
) as 2 | 3 | 4;
export const EDITION_LINKS: Record<number, string> = {
  2: 'https://architect2.darshdave.com',
  3: 'https://architect3.darshdave.com',
  4: 'https://architect4.darshdave.com',
};
export const ASSIGNMENT_URL = 'https://lyzrassignment.darshdave.com';
export const companyAreas = [
  'company',
  'delivery',
  'revenue',
  'success',
  'finance',
  'people',
  'metrics',
  'growth',
  'botteams',
  'sync',
];
export const privateAreas = [
  'infrastructure',
  'connections',
  'runners',
  'installation',
  'governance',
  'recovery',
];
