import React from 'react';
import TabHeader from './tabHeader';
import TabContent from './tabContent';

export default class Tab extends React.PureComponent {
    constructor(props) {
        super(props);

        const tabs = React.Children.toArray(this.props.children)
            .filter(child => React.isValidElement(child));

        const defaultIndex = typeof this.props.defaultIndex === 'number'
            ? this.props.defaultIndex
            : 0;

        this.state = {
            activeIndex: Math.max(0, Math.min(defaultIndex, tabs.length - 1))
        };
    }

    handleTabChange = (index) => {
        this.setState({ activeIndex: index });

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(index);
        }
    };

    getTabs() {
        return React.Children.toArray(this.props.children)
            .filter(child => React.isValidElement(child));
    }

    render() {
        const tabs = this.getTabs();
        const { activeIndex } = this.state;
        const activeTab = tabs[activeIndex] || null;

        const items = tabs.map((tab, index) => ({
            index,
            label: tab.props.label || `Tab ${index + 1}`,
            disabled: !!tab.props.disabled
        }));

        return (
            <div className={"tab-system" + (this.props.className ? ` ${this.props.className}` : '')}>
                <TabHeader
                    items={items}
                    activeIndex={activeIndex}
                    onChange={this.handleTabChange}
                />

                <div className="tab-body">
                    {activeTab}
                </div>
            </div>
        );
    }
}
