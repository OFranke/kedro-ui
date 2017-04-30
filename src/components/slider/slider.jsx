import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { rangeStep, uniqueId } from 'lodash/fp';

import SliderRenderer from './slider-renderer';
import RangedSliderRenderer from './ranged-slider-renderer';

import './slider-common.css';

/**
 * Creates a slider component.
 */
class Slider extends React.Component {
  /**
   * constructor - create new component with given props.
   * @param  {object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      colors: undefined,
      ticks: this._getTicks(this.props.min, this.props.max)
    };

    this._id = uniqueId(`cbn-slider--${this.props.type}-`);

    this._handleChanged = this._handleChanged.bind(this);
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#componentdidmount}
   * @return {object} JSX for this component
   */
  componentDidMount() {
    // store the correct colors
    if (!this.state.colors) {
      this._setColors();
    }
  }

  /**
   * _setColors - store the colors in the state for usage in gradient
   */
  _setColors() {
    const fill = window.getComputedStyle(this._hiddenFill).backgroundColor;
    const background = window.getComputedStyle(this._hiddenBackground).backgroundColor;

    this.setState({
      colors: {
        fill,
        background
      }
    });
  }

  /**
   * _getTicks -
   */
  _getTicks(min, max) {
    const tickStep = this.props.tickStep ? this.props.tickStep : this.props.max;
    // create a range of values
    const tickValues = rangeStep(tickStep, this.props.min, this.props.max);
    // and add the max into the array
    tickValues.push(this.props.max);

    // create an array with all the ticks, where value and whether it should be specially coloured is stored
    return tickValues.map(tickValue => (
      {
        range: min <= tickValue && tickValue <= max,
        value: tickValue
      }
    ));
  }

  /**
   * _handleChanged -
   */
  _handleChanged(e, min, max) {
    this.setState({
      ticks: this._getTicks(min, max)
    });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(e);
    }
  }

  /**
   * _getNumberShift - calculates the shift of a tick number from the left side of the slider
   * @param {number} value the value displayed as a tick
   * @param {number} index the index number of the given value
   * @param {number} lastValueIndex index of the tick
   * @return {number} shift in pixels from the left side of the slider
   */
  _getNumberShift(value, index, lastValueIndex) {
    // get the value into percentage value and then convert to a decimal value
    const decimalValue = (value * ((this.props.max - this.props.min) / 100)) / 100;
    // TODO: how to get from styles?
    const inputWidth = 166;
    // TODO: how to get from styles?
    const numberWidth = 24;
    // by default, shift the number by half of the box's width
    let numberBoxShift = numberWidth / 2;

    if (index === 0) {
      // if the number is the first value shift by quarter of the box's width to align with the first symbol
      numberBoxShift = numberWidth / 4;
    } else if (index === lastValueIndex) {
      // if the number is the last value shift by threequarters of the box's width to align with the last symbol
      numberBoxShift = (numberWidth / 4) * 3;
    }

    return (decimalValue * inputWidth) - numberBoxShift;
  }

  /**
   * React lifecycle method
   * {@link https://facebook.github.io/react/docs/react-component.html#render}
   * @return {object} JSX for this component
   */
  render() {
    const hiddenElements = !this.state.colors && (
      <div className='cbn-slider__hidden'>
        <div
          ref={hiddenFill => { this._hiddenFill = hiddenFill; }}
          className='cbn-slider__hidden--fill' />
        <div
          ref={hiddenBackground => { this._hiddenBackground = hiddenBackground; }}
          className='cbn-slider__hidden--background' />
      </div>
    );

    const tickNumbers = this.props.showTicks && (
      <datalist
        id={this._id}
        className='cbn-slider__tick-numbers'>
        {this.state.ticks.map((tick, i) => (
          <option
            key={`tick-number-${tick.value}`}
            className={classnames(
              'cbn-slider__tick-number',
              { 'cbn-slider__tick-number--min': i === 0 },
              { 'cbn-slider__tick-number--max': i === (this.state.ticks.length - 1) })}
            value={tick.value}
            style={{ transform: `translateX(${this._getNumberShift(tick.value, i, this.state.ticks.length - 1)}px)` }}>
            {tick.value}
          </option>
        ))}
      </datalist>
    );

    const tickSymbols = this.props.showTicks && (
      <datalist
        id={this._id}
        className='cbn-slider__tick-symbols'>
        {this.state.ticks.map((tick, i) => (
          <option
            key={`tick-symbol-${tick.value}`}
            className={classnames(
              'cbn-slider__tick-symbol',
              { 'cbn-slider__tick-symbol--min': i === 0 },
              { 'cbn-slider__tick-symbol--max': i === (this.state.ticks.length - 1) },
              { 'cbn-slider__tick-symbol--range': tick.range }
            )}
            value={tick.value} />
        ))}
      </datalist>
    );

    // determine the type of correct renderer
    const RendererType = this.props.type === 'single' ? SliderRenderer : RangedSliderRenderer;

    return (
      <div
        className={classnames(
          'cbn-slider',
          `cbn-slider--${this.props.type}`,
          `cbn-theme--${this.props.theme}`)}>
        <RendererType
          backgroundColor={this.state.colors ? this.state.colors.background : 'transparent'}
          fillColor={this.state.colors ? this.state.colors.fill : 'transparent'}
          listId={this._id}
          label={this.props.label}
          min={this.props.min}
          max={this.props.max}
          name={this.props.name}
          onChange={this._handleChanged}
          step={this.props.step}
          theme={this.props.theme}
          tickNumbers={tickNumbers}
          tickSymbols={tickSymbols}
          value={this.props.value} />
        {hiddenElements}
      </div>
    );
  }
}

Slider.defaultProps = {
  label: '',
  max: 100,
  min: 0,
  name: 'slider',
  onChange: null,
  showTicks: true,
  step: 1,
  tickStep: 0,
  theme: 'light',
  type: 'single',
  value: undefined
};

Slider.propTypes = {
  /**
   * Label to be shown for the slider.
   */
  label: PropTypes.string,
  /**
   * Minimal value of the slider.
   */
  min: PropTypes.number,
  /**
   * Maximum value of the slider.
   */
  max: PropTypes.number,
  /**
   * Name of the slider.
   * NOTE: SHOULD THE NAME BE INCLUDED? OR BE REMOVED?
   * FROM MDN: "The name of the control, which is submitted with the form data."
   */
  name: PropTypes.string,
  /**
   * Event listener which will be trigerred on change of the slider.
   */
  onChange: PropTypes.func,
  /**
   * Whether the ticks indicating values of the slider should be shown.
   * By default only the min and max is shown, changing the tickStep value modifies the number of ticks.
   */
  showTicks: PropTypes.bool,
  /**
   * Step of the slider.
   */
  step: PropTypes.number,
  /**
   * Step of the ticks shown below the slider.
   * By default only the min and max is shown.
   */
  tickStep: PropTypes.number,
  /**
   * Theme of the component, either 'dark' or 'light'
   */
  theme: PropTypes.oneOf(['dark', 'light']),
  /**
   * Type of the slider - either single input slider or multiple input (ranged) slider
   */
  type: PropTypes.oneOf(['single', 'multiple']),
  /**
   * The value of the slider - either array for ranged slider or a single number for simple slider.
   */
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.number])
};

export default Slider;