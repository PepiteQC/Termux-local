import React from 'react';

export default class TabHeader extends React.PureComponent {
    handleClick = (item) => {
        if (item.disabled) return;

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(item.index);
        }
    };

    render() {
        const { items = [], activeIndex = 0 } = this.props;

        return (
            <ul className="tab-header">
                {items.map((item) => (
                    <li
                        key={item.index}
                        className={
                            "tab-header-item" +
                            (item.index === activeIndex ? " is-active" : "") +
                            (item.disabled ? " is-disabled" : "")
                        }
                        onClick={() => this.handleClick(item)}
                    >
                        {item.label}
                    </li>
                ))}
            </ul>
        );
    }
}
