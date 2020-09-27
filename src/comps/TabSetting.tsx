import React from 'react';
import './TabSetting.scss';
import {
    ChoiceGroup,
    DefaultButton,
    Dropdown,
    PrimaryButton,
    TextField,
    Toggle,
} from '@fluentui/react';
import { Section } from './Section';

import { repo, createEmptyRepo, openAnotherRepo } from '../repo';
import { remote } from '../node-dep';
import { checkBdrepoFolder, isDirectory } from '../util';
import { pica } from '../pica';

function openOrCreateBdRepo(): void {
    let repo = remote.dialog.showOpenDialogSync({
        title: '选择 BD 库文件夹',
        properties: ['openDirectory'],
    });

    if (
        Array.isArray(repo) &&
        typeof repo[0] === 'string' &&
        isDirectory(repo[0])
    ) {
        if (!checkBdrepoFolder(repo[0])) {
            if (window.confirm('当前文件夹不是一个库，在此处创建新库？')) {
                createEmptyRepo(repo[0]);
            } else {
                return;
            }
        }
        openAnotherRepo(repo[0]);
    } else if (repo !== undefined) {
        window.alert('选择一个文件夹！');
    }
}

function checkPicaLoginSetting() {
    const pica = repo.config!.pica;
    if (pica.user.length < 1) return false;
    if (pica.password.length < 1) return false;
    if (pica.useProxy !== 'none') {
        if (pica.proxyHost.length < 5) return false;
        const port = parseInt(pica.proxyPort);
        if (isNaN(port)) return false;
    }
    return true;
}

async function picaReLogin(tabSettingInstance: TabSetting) {
    if (!checkPicaLoginSetting()) {
        alert('检查用户名、密码、代理设置');
        return;
    }

    tabSettingInstance.setState({
        loginState: 'logging in',
    });

    try {
        const picaConfigCache = Object.assign({}, repo.config!.pica);
        const token = await pica.relogin(picaConfigCache);

        repo.updateConfig((cfg) => {
            const picaToken = cfg.picaToken;
            picaToken.server = picaConfigCache.server;
            picaToken.user = picaConfigCache.user;
            picaToken.token = token;
        });
        tabSettingInstance.setState({
            loginState: 'logged in',
        });
    } catch (e) {
        tabSettingInstance.setState({
            loginState: 'not logged in',
        });
        alert(e);
    }
}

export default class TabSetting extends React.Component<
    {
        hide: boolean;
    },
    {
        canEditPassword: boolean;
        loginState: 'not logged in' | 'logging in' | 'logged in';
    }
> {
    $isSavingSpan!: HTMLSpanElement;
    state = {
        canEditPassword: !(
            repo.isRepoOpened && repo.config!.pica.password !== ''
        ),
        loginState: pica.loginState as
            | 'not logged in'
            | 'logging in'
            | 'logged in',
    };
    changeConfig = (fn: () => void) => {
        this.$isSavingSpan.innerHTML = '正在保存';
        setImmediate(() => {
            repo.updateConfig(fn);
            this.$isSavingSpan.innerHTML = '已保存';
        });
    };
    render() {
        const config = repo.config;
        const { pica, picaToken } = config! || {};
        const state = this.state;

        return (
            <div
                className="tab-setting"
                style={{ display: this.props.hide ? 'none' : 'block' }}
            >
                <Section>
                    <h1>基本</h1>
                    <div className="flex-lr">
                        <PrimaryButton
                            text="打开 BD 库..."
                            onClick={openOrCreateBdRepo}
                        />
                        <div
                            style={{
                                marginLeft: '1em',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {repo.isRepoOpened
                                ? '当前：' + repo.repoRoot
                                : '当前未打开任何库'}
                        </div>
                    </div>
                </Section>
                {repo.isRepoOpened && (
                    <Section>
                        <h1>
                            Picacg&nbsp;&nbsp;&nbsp;
                            <span
                                style={{ fontSize: '0.6em' }}
                                ref={(el) => {
                                    this.$isSavingSpan = el!;
                                }}
                            >
                                已保存
                            </span>
                        </h1>
                        {state.loginState === 'logged in' ? (
                            <>
                                <div className="flex-lr setting-two-column">
                                    <div>当前</div>
                                    <div>
                                        已验证登录 {picaToken.user}@
                                        {picaToken.server ===
                                        'https://picaapi.picacomic.com'
                                            ? '分流1'
                                            : picaToken.server === 'fl2'
                                            ? '分流2'
                                            : '分流3'}
                                    </div>
                                </div>
                                <div className="flex-lr setting-two-column">
                                    <div>&nbsp;</div>
                                    <div>
                                        <DefaultButton
                                            text="重验证登录"
                                            onClick={() => picaReLogin(this)}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : state.loginState === 'not logged in' ? (
                            <>
                                <div className="flex-lr setting-two-column">
                                    <div>当前</div>
                                    <div>未验证登录</div>
                                </div>
                                <div className="flex-lr setting-two-column">
                                    <div>&nbsp;</div>
                                    <div>
                                        <DefaultButton
                                            text="验证登录"
                                            onClick={() => picaReLogin(this)}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-lr setting-two-column">
                                    <div>当前</div>
                                    <div>正在登录..</div>
                                </div>
                                <div className="flex-lr setting-two-column">
                                    <div>&nbsp;</div>
                                    <div>
                                        <DefaultButton text="....." />
                                    </div>
                                </div>
                            </>
                        )}

                        <div
                            className="flex-lr setting-two-column"
                            style={{ alignItems: 'unset' }}
                        >
                            <div>服务器</div>
                            <ChoiceGroup
                                defaultSelectedKey={pica.server}
                                options={[
                                    {
                                        key: 'https://picaapi.picacomic.com',
                                        text: '分流1',
                                    },
                                    {
                                        key: 'fl2',
                                        text: '分流2',
                                        disabled: true,
                                    },
                                    {
                                        key: 'https://picaapi2.picacomic.com',
                                        text: '分流3',
                                    },
                                ]}
                                onChange={(e, opt) => {
                                    this.changeConfig(() => {
                                        pica.server = opt!.key;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex-lr setting-two-column">
                            <div>用户名</div>
                            <TextField
                                styles={{
                                    wrapper: {
                                        width: '100%',
                                    },
                                }}
                                defaultValue={pica.user}
                                onChange={(e, val) => {
                                    this.changeConfig(() => {
                                        pica.user = val!;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex-lr setting-two-column">
                            <div>编辑密码</div>
                            <Toggle
                                checked={this.state.canEditPassword}
                                onChange={(e, checked) => {
                                    this.setState({
                                        canEditPassword: !!checked,
                                    });
                                }}
                            />
                        </div>
                        <div className="flex-lr setting-two-column">
                            <div>密码</div>
                            {this.state.canEditPassword ? (
                                <TextField
                                    styles={{
                                        wrapper: {
                                            width: '100%',
                                        },
                                    }}
                                    defaultValue={pica.password}
                                    onChange={(e, val) => {
                                        this.changeConfig(() => {
                                            pica.password = val!;
                                        });
                                    }}
                                />
                            ) : (
                                <div>************</div>
                            )}
                        </div>
                        <div
                            className="flex-lr setting-two-column"
                            style={{ alignItems: 'unset' }}
                        >
                            <div>图片质量</div>
                            <ChoiceGroup
                                defaultSelectedKey={pica.imageQuality}
                                options={[
                                    { key: 'original', text: '原画' },
                                    { key: 'high', text: '高' },
                                    { key: 'medium', text: '中' },
                                    { key: 'low', text: '低' },
                                ]}
                                onChange={(e, opt) => {
                                    this.changeConfig(() => {
                                        pica.imageQuality = opt!.key as any;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex-lr setting-two-column">
                            <div>使用代理</div>
                            <Dropdown
                                styles={{
                                    dropdown: {
                                        width: '80px',
                                    },
                                }}
                                onChange={(e, opt) => {
                                    this.changeConfig(() => {
                                        pica.useProxy = opt!.key as any;
                                    });
                                }}
                                defaultSelectedKey={pica.useProxy}
                                options={[
                                    { key: 'none', text: '无' },
                                    { key: 'http', text: 'http' },
                                    { key: 'https', text: 'https' },
                                    { key: 'socks5', text: 'socks5' },
                                ]}
                            />
                        </div>
                        <div className="flex-lr setting-two-column">
                            <div>代理主机</div>
                            <TextField
                                styles={{
                                    wrapper: {
                                        width: '100%',
                                    },
                                }}
                                defaultValue={pica.proxyHost}
                                onChange={(e, val) => {
                                    this.changeConfig(() => {
                                        pica.proxyHost = val!;
                                    });
                                }}
                            />
                        </div>
                        <div className="flex-lr setting-two-column">
                            <div>代理端口</div>
                            <TextField
                                styles={{
                                    wrapper: {
                                        width: '80px',
                                    },
                                }}
                                defaultValue={pica.proxyPort}
                                onChange={(e, val) => {
                                    this.changeConfig(() => {
                                        pica.proxyPort = val!;
                                    });
                                }}
                            />
                        </div>
                    </Section>
                )}
            </div>
        );
    }
}
