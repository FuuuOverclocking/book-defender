/** repo: repository Abbr. */

import { fs, path, app } from './node-dep';
import { env } from './env';
import { store } from './store';
import { checkBdrepoFolder } from './util';

export interface Config {
    pica: {
        server: string;
        user: string;
        password: string;
        imageQuality: 'original' | 'high' | 'medium' | 'low';
        useProxy: 'none' | 'http' | 'https' | 'socks5';
        proxyHost: string;
        proxyPort: string;
    };
    picaToken: {
        server: string;
        user: string;
        token: string;
    };
}

export function createEmptyRepo(repoRoot: string): void {
    const bdrepoDir = path.resolve(repoRoot, './.bdrepo');
    const configPath = path.resolve(bdrepoDir, './config.json');
    const cfg = getDefaultConfig();

    fs.mkdirSync(bdrepoDir);
    fs.writeJSONSync(configPath, cfg, { spaces: 4 });
}

export function resolveRepoToBeOpened(): string | undefined {
    const { argv, isDev } = env;

    if (Array.isArray(argv)) {
        let repoRoot: string | undefined;

        if (isDev && argv.length >= 3) repoRoot = argv[2];
        else if (!isDev && argv.length >= 2) repoRoot = argv[1];

        if (repoRoot && checkBdrepoFolder(repoRoot)) {
            return repoRoot;
        }
    }

    const lastOpenedRepo = store.get('lastOpenedRepo') as string | undefined;
    if (lastOpenedRepo && checkBdrepoFolder(lastOpenedRepo)) {
        return lastOpenedRepo;
    }

    return undefined;
}

function getDefaultConfig(): Config {
    return {
        pica: {
            server: 'https://picaapi.picacomic.com',
            user: '',
            password: '',
            imageQuality: 'original',
            useProxy: 'none',
            proxyHost: '',
            proxyPort: '',
        },
        picaToken: {
            server: '',
            user: '',
            token: '',
        },
    };
}

export function openAnotherRepo(repoRoot: string): void {
    const args = env.isDev ? [env.appRootDir, repoRoot] : [repoRoot];
    app.relaunch({ args });
    app.exit(0);
}

export const repo = {
    isRepoOpened: false,
    repoRoot: '',
    bdrepoDir: '',
    configPath: '',
    config: undefined as Config | undefined,
    token: undefined as undefined,

    load(repo: string): void {
        this.isRepoOpened = true;
        this.repoRoot = repo;
        this.bdrepoDir = path.resolve(repo, './.bdrepo');
        this.configPath = path.resolve(this.bdrepoDir, './config.json');
        store.set('lastOpenedRepo', repo);

        this.readConfigFromFile();
    },

    readConfigFromFile(): void {
        this.config = fs.readJSONSync(this.configPath);
    },

    updateConfig(fn: (cfg: Config) => void | Promise<void>): void {
        if (!this.config) {
            throw new Error('access config when it is still undefined');
        }
        const result = fn(this.config);
        if (result) {
            result.then(() => {
                fs.writeJSONSync(this.configPath, this.config, {
                    spaces: 4,
                });
            });
        } else {
            fs.writeJSONSync(this.configPath, this.config, {
                spaces: 4,
            });
        }
    },
};
