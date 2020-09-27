import { remote } from './node-dep';
const sharedObject: {
    rootDir: string;
    argv: string;
    isDev: boolean;
} = remote.getGlobal('sharedObject');

export const env: {
    appRootDir: string;
    argv: string[];
    isDev: boolean;
} = {
    appRootDir: sharedObject.rootDir,
    argv: JSON.parse(sharedObject.argv),
    isDev: sharedObject.isDev,
};
