import React from 'react';
import './Header.scss';

interface IHeaderItemProps {
    tab: 'add' | 'look' | 'setting';
    changeTab: (newTab: 'add' | 'look' | 'setting') => void;
}
export default class Header extends React.Component<IHeaderItemProps> {
    render() {
        const { tab, changeTab } = this.props;
        return (
            <div className="header">
                <div className="header-inner">
                    <div className="header-items">
                        <HeaderItem
                            tabId="add"
                            content="添加 &amp; 同步"
                            currentTab={tab}
                            changeTab={changeTab}
                        />
                        <HeaderItem
                            tabId="look"
                            content="浏览 &amp; 管理"
                            currentTab={tab}
                            changeTab={changeTab}
                        />
                        <HeaderItem
                            tabId="setting"
                            content="配置"
                            currentTab={tab}
                            changeTab={changeTab}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

function className(isSelected: boolean) {
    return isSelected ? 'selected' : '';
}

function HeaderItem(props: {
    tabId: 'add' | 'look' | 'setting';
    content: string;
    currentTab: 'add' | 'look' | 'setting';
    changeTab: (newTab: 'add' | 'look' | 'setting') => void;
}) {
    const { tabId, content, currentTab, changeTab } = props;
    return (
        <div
            className={className(tabId === currentTab)}
            onMouseDown={() => changeTab(tabId)}
        >
            {content}
        </div>
    );
}
