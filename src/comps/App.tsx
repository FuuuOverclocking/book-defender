import React from 'react';
import './App.scss';

import Header from './Header';
import TabSetting from './TabSetting';
import { repo } from '../repo';
import TabAdd from './TabAdd';

interface IAppState {
    tab: 'add' | 'look' | 'setting';
}

export default class App extends React.Component<{}, IAppState> {
    state: IAppState = {
        tab: repo.isRepoOpened ? 'look' : 'setting',
    };
    changeTab = (newTab: 'add' | 'look' | 'setting') => {
        this.setState({
            tab: newTab,
        });
    };
    render() {
        const { tab } = this.state;
        return (
            <div className="app">
                <Header tab={tab} changeTab={this.changeTab} />
                <div className="body">
                    <div className="body-top-placeholder"></div>
                    <div className="body-inner-1">
                        <div className="body-inner-2">
                            <TabAdd hide={tab !== 'add'} />
                            <TabSetting hide={tab !== 'setting'} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
