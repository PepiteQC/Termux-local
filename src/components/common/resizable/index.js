import React from 'react';

export default class Resizable extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            width: props.defaultWidth || null,
            height: props.defaultHeight || null,
            isResizing: false
        };
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseDown = (event) => {
        event.preventDefault();

        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startWidth = this.containerRef ? this.containerRef.offsetWidth : 0;
        this.startHeight = this.containerRef ? this.containerRef.offsetHeight : 0;

        this.setState({ isResizing: true });

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    };

    handleMouseMove = (event) => {
        const { minWidth = 150, minHeight = 100, maxWidth, maxHeight } = this.props;

        let width = this.startWidth + (event.clientX - this.startX);
        let height = this.startHeight + (event.clientY - this.startY);

        width = Math.max(minWidth, width);
        height = Math.max(minHeight, height);

        if (typeof maxWidth === 'number') {
            width = Math.min(maxWidth, width);
        }

        if (typeof maxHeight === 'number') {
            height = Math.min(maxHeight, height);
        }

        this.setState({ width, height });

        if (typeof this.props.onResize === 'function') {
            this.props.onResize({ width, height });
        }
    };

    handleMouseUp = () => {
        this.setState({ isResizing: false });

        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    };

    render() {
        const { width, height } = this.state;

        return (
            <div
                ref={(ref) => { this.containerRef = ref; }}
                className={"resizable" + (this.props.className ? ` ${this.props.className}` : '')}
                style={{
                    position: 'relative',
                    width: width || this.props.width || '100%',
                    height: height || this.props.height || '100%'
                }}
            >
                <div className="resizable-content" style={{ width: '100%', height: '100%' }}>
                    {this.props.children}
                </div>

                <button
                    type="button"
                    className="resizable-handle"
                    onMouseDown={this.handleMouseDown}
                    aria-label="Resize"
                />
            </div>
        );
    }
}
