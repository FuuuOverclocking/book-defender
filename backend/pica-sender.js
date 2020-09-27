const { ipcMain, net, session, app } = require('electron');
const { URL } = require('url');
const fetch = require('electron-fetch').default;
const qs = require('qs');
const { v1: uuidv1 } = require('uuid');
const fs = require('fs');
const { sign } = require('./pica-sign');

function sess() {
    return session.defaultSession;
}

let cfg = {
    server: '',
    useProxy: '',
    proxyHost: '',
    proxyPort: '',
    imageQuality: '',
    token: '',
};

ipcMain.handle('picasender-set-cfg', (e, newConfig) => {
    const oldCfg = cfg;
    cfg = newConfig;
    if (
        oldCfg.useProxy !== newConfig.useProxy ||
        oldCfg.proxyHost !== newConfig.proxyHost ||
        oldCfg.proxyPort !== newConfig.proxyPort
    ) {
        resetProxy();
    }
});

ipcMain.handle('picasender-send', (e, method, options) => {
    switch (method) {
        case 'get':
            return sender.get(options);
        case 'post':
            return sender.post(options);
        case 'downloadImage':
            return sender.downloadImage(options);
        default:
            return false;
    }
});

function resetProxy() {
    const { useProxy, proxyHost, proxyPort } = cfg;
    switch (useProxy) {
        case 'none':
            sess().setProxy({
                proxyRules: 'direct://',
            });
            console.log('Current proxy rules = direct://');
            break;
        case 'http':
        case 'https':
        case 'socks5':
            sess().setProxy({
                proxyRules: `${useProxy}://${proxyHost}:${proxyPort},direct://`,
            });
            console.log(
                'Current proxy rules = ' +
                    `${useProxy}://${proxyHost}:${proxyPort},direct://`,
            );

            break;
        default:
            throw new Error('resetProxy invalid cfg.');
    }
}

const sender = {
    getHeaders(path, method, needAuth) {
        method = method.toLowerCase();
        path = path.startsWith('/') ? path.substr(1) : path;

        const time = '' + Math.floor(Date.now() / 1000);
        const nonce = uuidv1().replace(/-/g, '');
        const signature = sign(path, method, time, nonce);

        return {
            'api-key': 'C69BAF41DA5ABD1FFEDC6D2FEA56B',
            accept: 'application/vnd.picacomic.com.v1+json',
            'app-channel': '1',
            time,
            nonce,
            signature,
            'app-version': '2.2.1.3.3.4',
            'app-uuid': 'cb69a7aa-b9a8-3320-8cf1-74347e9ee970',
            'image-quality': cfg.imageQuality,
            'app-platform': 'android',
            'app-build-version': '45',
            ...(method === 'post'
                ? { 'Content-Type': 'application/json; charset=UTF-8' }
                : {}),
            'User-Agent': 'okhttp/3.8.1',
            ...(needAuth ? { authorization: cfg.token } : {}),
        };
    },

    /**
     * ```
     * options: {
     *    query?: object;
     *    needAuth?: boolean;
     *    path: string;
     * }
     * ```
     */
    get(options) {
        const url = new URL(options.path, cfg.server);
        url.search = qs.stringify(options.query);

        const headers = this.getHeaders(
            options.path,
            'get',
            !!options.needAuth,
        );

        console.log('');
        console.log('GET');
        console.log(`URL: ${url}`);
        console.log(`query: ${JSON.stringify(options.query, undefined, 4)}`);

        return fetch(url.toString(), {
            method: 'GET',
            headers,
            timeout: 15000,
            session: sess(),
            useElectronNet: true,
            useSessionCookies: false,
        })
            .then((res) => res.json())
            .catch((e) => ({
                isError: true,
                reason: String(e),
            }));
    },
    /**
     * ```
     * options: {
     *    query?: object;
     *    needAuth?: boolean;
     *    path: string;
     * }
     * ```
     */
    post(options) {
        const url = new URL(options.path, cfg.server);

        const headers = this.getHeaders(
            options.path,
            'post',
            !!options.needAuth,
        );

        console.log('');
        console.log('POST');
        console.log(`URL: ${url}`);
        console.log(`query: ${JSON.stringify(options.query, undefined, 4)}`);

        return fetch(url.toString(), {
            method: 'POST',
            headers,
            body: JSON.stringify(options.query),
            timeout: 15000,
            session: sess(),
            useElectronNet: true,
            useSessionCookies: false,
        })
            .then((res) => res.json())
            .catch((e) => ({
                isError: true,
                reason: String(e),
            }));
    },
    /**
     * ```
     * options: {
     *    needAuth?: boolean;
     *    fullURL: string;
     *    filepath: string; // e.g. "D:\path\to\file.ext"
     * }
     * ```
     */
    downloadImage(options) {
        const url = new URL(options.fullURL);

        const headers = this.getHeaders(url, 'img', !!options.needAuth);

        console.log('');
        console.log('GET image');
        console.log(`URL: ${url}`);

        return fetch(url.toString(), {
            method: 'GET',
            headers,
            timeout: 90000,
            session: sess(),
            useElectronNet: true,
            useSessionCookies: false,
        }).then(
            (res) =>
                new Promise((resolve) => {
                    res.body.pipe(fs.createWriteStream(options.filepath));
                    res.body.on('error', (e) => {
                        resolve({
                            isError: true,
                            reason: String(e),
                        });
                    });
                    res.body.on('end', () => {
                        resolve({
                            isError: false,
                            done: true,
                        });
                    });
                    setTimeout(() => {
                        resolve({
                            isError: true,
                            reason: '90s timeout',
                        });
                    }, 90000);
                }),
        );
    },
};
