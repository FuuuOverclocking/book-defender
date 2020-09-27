import { Config } from '../repo';
import { ipcRenderer } from '../node-dep';

type PicaConfig = Config['pica'];
type PicaToken = Config['picaToken'];

export class Pica {
    loginState: 'not logged in' | 'logging in' | 'logged in' = 'not logged in';
    cfg!: PicaConfig;
    token = '';

    async init(picaConfig: PicaConfig, picaToken: PicaToken) {
        this.cfg = {
            server: picaToken.server,
            user: picaToken.user,
            password: picaConfig.password,
            imageQuality: picaConfig.imageQuality,
            useProxy: picaConfig.useProxy,
            proxyHost: picaConfig.proxyHost,
            proxyPort: picaConfig.proxyPort,
        };
        this.token = picaToken.token;
        this.loginState = this.token === '' ? 'not logged in' : 'logged in';

        await this.setSender();
    }

    async setSender() {
        const cfg = this.cfg;
        await ipcRenderer.invoke('picasender-set-cfg', {
            server: cfg.server,
            useProxy: cfg.useProxy,
            proxyHost: cfg.proxyHost,
            proxyPort: cfg.proxyPort,
            imageQuality: cfg.imageQuality,
            token: this.token,
        });
    }

    async relogin(picaConfig: PicaConfig): Promise<string> {
        if (this.loginState === 'logging in') {
            throw new Error('Cannot relogin as pica is already logging in.');
        }
        this.loginState = 'logging in';

        this.cfg = Object.assign({}, picaConfig);
        await this.setSender();

        try {
            const data = await ipcRenderer.invoke('picasender-send', 'post', {
                path: '/auth/sign-in',
                query: {
                    email: this.cfg.user,
                    password: this.cfg.password,
                },
            });

            if (
                data.message === 'success' &&
                typeof data.data?.token === 'string'
            ) {
                this.loginState = 'logged in';
                this.token = data.data.token;
                return this.token;
            } else {
                if (data.message === 'invalid email or password') {
                    throw new Error('Picacg 用户名密码错误');
                }
                throw new Error('Picacg 登录时发生未知错误');
            }
        } catch (e) {
            this.loginState = 'not logged in';
            this.token = '';
            throw e;
        }
    }
}

export const pica = new Pica();
