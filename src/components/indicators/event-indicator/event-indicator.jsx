import React from 'react';
import PropTypes from 'prop-types';
import chroma from 'chroma-js';
import GSAP from 'react-gsap-enhancer';
import { TimelineLite, SlowMo } from 'gsap';
import EventIndicatorRenderer from './event-indicator-renderer';

import './event-indicator.css';

let colorScale = null;

/**
 * Returns the color for a given index.
 * @param {number} colorIndex
 * @return {string} matching color
 */
const _getColor = (colorIndex, colorsCount) => {
  if (colorScale === null) {
    const colors = [
      'rgb(24, 117, 240)',
      'rgb(34, 153, 153)',
      'rgb(255, 173, 19)',
      'rgb(68, 136, 17)',
      'rgb(153, 34, 136)'
    ];

    colorScale = chroma.scale(colors)
      .domain([0, colorsCount - 1]);
  }

  return colorScale.colors(colorsCount)[colorIndex];
};

/**
 * Event Indicator is an interactive circle created for each callback prefixed with 'on';
 * a number inside the circle indicates the number of times it was called.
 */
class EventIndicator extends React.Component {
  /**
   * Create new EventIndicator component
   * @param  {Object} props for component
   */
  constructor(props) {
    super(props);

    this.displayName = 'EventIndicator';

    this._createAnimation = this._createAnimation.bind(this);
  }

  /**
   * React lifecycle method
   * Adds the animation via GSAP-enhancer to the component.
   * {@link https://facebook.github.io/react/docs/react-component.html#componentDidMount}
   * @return {object} JSX for this component
   */
  componentDidMount() {
    this._anim = this.addAnimation(this._createAnimation);
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#componentDidUpdate}
   * @return {object} JSX for this component
   */
  componentDidUpdate(nextProps) {
    if (nextProps.count !== this.props.count && this._anim) {
      this._anim.restart();
    }
  }

  /**
   * React lifecycle method
   * Removes the animation created with GSAP-enhancer from the component.
   * {@link https://facebook.github.io/react/docs/react-component.html#componentWillUnmount}
   * @return {object} JSX for this component
   */
  componentWillUnmount() {
    this._anim.kill();
  }

  /**
   * Animation wrapper made with GSAP.
   * @return {GSAP}
   */
  _createAnimation() {
    const circle = this._indicator.querySelector(`[name='${this.props.name}-circle']`);
    // animation timeline for the circle - animations will be sequenced after the previous one
    const circleTimeline = new TimelineLite();
    circleTimeline
      // start position of the circle
      .to(circle, 0.1, { scale: 1, opacity: 1, transformOrigin: '50% 50%' })
      // scale the circle
      .to(circle, 0.2, { scale: 1.5, opacity: 1, transformOrigin: '50% 50%' })
      // reset the circle to the start position
      .to(circle, 0.1, { scale: 1, opacity: 1, transformOrigin: '50% 50%' });

    const border = this._indicator.querySelector(`[name='${this.props.name}-border']`);
    // animation timeline for the border - animations will be sequenced after the previous one
    const borderTimeline = new TimelineLite();
    borderTimeline
      // start position of the border
      .to(border, 0.1, { scale: 1, opacity: 1, transformOrigin: '50% 50%' })
      // slow motion scale of the border
      .to(border, 0.7, { scale: 5, opacity: 0, ease: SlowMo.ease.config(0.5, 0.4, false), transformOrigin: '50% 50%' })
      // reset the border to the start position
      .to(border, 0.1, { scale: 1, opacity: 0, transformOrigin: '50% 50%' });

    // add the two animations into one animation timeline and let them both start at 0 second
    const animationTimeline = new TimelineLite();
    animationTimeline.add(circleTimeline, 0);
    animationTimeline.add(borderTimeline, 0);

    return animationTimeline;
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#render}
   * @return {object} JSX for this component
   */
  render() {
    return (
      <div
        className='cbn-sg-playground__event-wrapper'
        ref={indicator => { this._indicator = indicator; }}>
        <EventIndicatorRenderer
          color={_getColor(this.props.colorIndex, this.props.colorsCount)}
          count={this.props.count}
          name={this.props.name}
          theme={this.props.theme} />
      </div>
    );
  }
}

EventIndicator.defaultProps = {
  colorsCount: 5,
  theme: 'dark'
};

EventIndicator.propTypes = {
  /**
   * Index of color to fetch
   */
  colorIndex: PropTypes.number.isRequired,
  /**
   * Number of colors
   */
  colorsCount: PropTypes.number,
  /**
   * Current count on indicator
   */
  count: PropTypes.number.isRequired,
  /**
   * Name of indicator
   */
  name: PropTypes.string.isRequired,
  /**
   * Current component theme
   */
  theme: PropTypes.oneOf(['dark', 'light'])
};

export default GSAP()(EventIndicator);