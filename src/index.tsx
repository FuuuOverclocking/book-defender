import './css/reset.scss';
import './css/global.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/react';

import './use-dark-theme';

import { repo, resolveRepoToBeOpened } from './repo';

import App from './comps/App';
import { pica } from './pica';

main();
async function main() {
    initializeIcons();

    const repoRoot = resolveRepoToBeOpened();
    if (repoRoot) {
        repo.load(repoRoot);
        await pica.init(repo.config!.pica, repo.config!.picaToken);
    }

    ReactDOM.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
        document.getElementById('root'),
    );
}
