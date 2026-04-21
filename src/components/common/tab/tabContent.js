import React from 'react';

export default class TabContent extends React.PureComponent {
    render() {
        return (
            <div className={"tab-content" + (this.props.className ? ` ${this.props.className}` : '')}>
                {this.props.children}
            </div>
        );
    }
}
