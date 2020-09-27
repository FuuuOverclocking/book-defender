import { fs, path } from './node-dep';

export function checkBdrepoFolder(pathToFolder: string): boolean {
    const pathToRepo = path.resolve(pathToFolder, './.bdrepo');
    return isDirectory(pathToFolder) && isDirectory(pathToRepo);
}

export function isDirectory(path: string) {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
}
