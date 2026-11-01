import repositories from './repositories.json';

export const githubProfile = 'https://github.com/UzimakeNarutoszx';
export function getRepository(name: string): { url: string; private: boolean } | undefined {
  return (repositories as Record<string, { url: string; private: boolean }>)[name];
}
