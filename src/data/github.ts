import repositories from './repositories.json';

export const githubProfile = 'https://github.com/UzimakeNarutoszx';
const packagedProjects = new Set(['jianwen', 'Zhuozheng', 'personal-home-archive', 'robotics-competitions', 'soulx-singer-desktop', 'spaceship-battle', 'xunyue-studio']);
export function getRepository(name: string): { url: string; private: boolean; archive?: boolean } | undefined {
  const repository = (repositories as Record<string, { url: string; private: boolean }>)[name];
  if (repository) return repository;
  const project = name.endsWith('-oss') ? name.slice(0, -4) : name;
  if (packagedProjects.has(project)) return { url: `${githubProfile}/personal-website-oss/releases/download/public-editions-2026-11-01/${project}-public-source.zip`, private: false, archive: true };
}
