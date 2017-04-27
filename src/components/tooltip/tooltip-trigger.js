// Imports

import React, { PropTypes } from 'react';

/**
 * Create a component with tooltip triggering abilities
 */
const TooltipTriggerHOC = WrapperComponent => {
  const component = React.Component;

  /**
   * TooltipTrigger class will wrap the supplied component and allow it to
   * show / hide a tooltip
   * @param  {type} props description
   */
  class TooltipTrigger extends component {
    /**
     * constructor - create new TooltipTrigger
     * @param  {Object} props
     */
    constructor(props) {
      super(props);

      this.showTooltip = false;
      this.tooltip = null;

      this._handleEvent = this._handleEvent.bind(this);
      this._showTooltip = this._showTooltip.bind(this);
      this._hideTooltip = this._hideTooltip.bind(this);
      this._getEventHandlers = this._getEventHandlers.bind(this);
    }

    /**
     * React lifecycle method
     * Grabs the tooltip and adds window scroll events
     * {@link https://facebook.github.io/react/docs/react-component.html#componentDidMount}
     * @return {object} JSX for this component
     */
    componentDidMount() {
      this.tooltip = document.querySelector(`.cbn-tooltip[data-tooltip-id="${this.props.tooltipId}"]`);
      this.tooltip.classList.add('cbn-tooltip--fixed');

      window.addEventListener('scroll', this._hideTooltip);
    }

    /**
     * React lifecycle method
     * Adds the animation via GSAP-enhancer to the component.
     * {@link https://facebook.github.io/react/docs/react-component.html#componentDidMount}
     * @return {object} JSX for this component
     */
    componentWillUnmount() {
      window.removeEventListener('scroll', this._hideTooltip);
    }

    /**
     * Convenience method, hide the tooltip, used when scrolling
     */
    _hideTooltip() {
      if (this.tooltip) {
        this.tooltip.style.opacity = 0;
      }
    }

    /**
     * _showTooltip allows you to toggle a tooltip tip into view, based on the
     * tooltipId prop and display direction prop
     * @param  {Object} opts { show, position, tooltips }
     */
    _showTooltip(opts) {
      this.tooltip.style.opacity = +opts.show;

      Object.keys(opts.position)
            .forEach(key => {
              this.tooltip.style[key] = `${opts.position[key]}px`;
              this.tooltip.classList.add(`cbn-tooltip--${this.props.displayDirection}`);
            });
    }

    /**
     * _handleEvent - used to handle the provided action type e.g onClick
     * will display the tooltip with the same ID as provided in props
     */
    _handleEvent() {
      const box = this._wrapper.getBoundingClientRect();
      const tbox = this.tooltip.getBoundingClientRect();
      const position = {};

      // no tooltips found, bail out
      if (!this.tooltip) {
        return;
      }

      // position the tooltip, always centering
      switch (this.props.displayDirection) {
        case 'top':
          position.top = box.top - this.props.spacer;
          position.left = box.left + ((box.width / 2) - (tbox.width / 2));
          break;
        case 'bottom':
          position.top = box.bottom + this.props.spacer;
          position.left = box.left + ((box.width / 2) - (tbox.width / 2));
          break;
        case 'left':
          position.top = box.top + ((box.height / 2) - (tbox.height / 2));
          position.left = box.left - this.props.spacer;
          break;
        case 'right':
          position.top = box.top + ((box.height / 2) - (tbox.height / 2));
          position.left = box.right + this.props.spacer;
          break;
        default:
          throw new Error('Unknown display direction for tooltip');
      }

      this._showTooltip({
        show: this.showTooltip = !this.showTooltip,
        position
      });
    }

    /**
     * _getEventHandlers returns an object of event handlers to control when
     * the tooltip is displayed / removed
     * @return {object} event handlers object
     */
    _getEventHandlers() {
      // support only mouse over / out events for now
      return {
        onMouseOver: this._handleEvent,
        onMouseOut: this._handleEvent
      };
    }

    /**
     * React lifecycle method
     * {@link https://facebook.github.io/react/docs/react-component.html#render}
     * @return {object} JSX for this component
     */
    render() {
      return (
        <div
          ref={c => { this._wrapper = c; }}
          className='cbn-tooltip-trigger'
          {...this._getEventHandlers()}>
          <WrapperComponent {...this.props} />
        </div>);
    }
  }

  TooltipTrigger.defaultProps = {
    displayDirection: 'top',
    spacer: 10
  };

  TooltipTrigger.propTypes = {
    /**
     * What direction you want to display the tooltip from
     */
    displayDirection: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
    /**
     * How far away (px) the tooltip will display from the wrapped component
     */
    spacer: PropTypes.number,
    /**
     * The ID of the tooltip to display
     */
    tooltipId: PropTypes.string.isRequired
  };

  return TooltipTrigger;
};

export default TooltipTriggerHOC;
