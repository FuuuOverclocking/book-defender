import React from 'react';
import './TabAdd.scss';

export default class TabAdd extends React.Component<
    {
        hide: boolean;
    },
    {}
> {
    render() {
        // const {} = this.state;
        const { hide } = this.props;
        return (
            <div className="" style={{ display: hide ? 'none' : 'block' }}>
                12345
            </div>
        );
    }
}
