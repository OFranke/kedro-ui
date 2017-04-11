import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import noop from 'lodash/noop';
import _ from 'lodash';
import { transform } from 'buble';
import PlaygroundError from 'rsg-components/PlaygroundError';
import Wrapper from 'rsg-components/Wrapper';

const compileCode = code => transform(code, {
	objectAssign: 'Object.assign',
}).code;

export default class Preview extends Component {
	propTypes: {
		code: PropTypes.string.isRequired,
		evalInContext: PropTypes.func.isRequired,
	};

  constructor(props) {
    super(props);
    this.state = {error: null,};
  }

	componentDidMount() {
		this.executeCode();
	}

	componentDidUpdate(prevProps) {
		if (this.props.code !== prevProps.code) {
			this.executeCode();
		}
	}

	executeCode() {
		ReactDOM.unmountComponentAtNode(this.mountNode);

		this.setState({
			error: null,
		});

		const { code } = this.props;
		if (!code) {
			return;
		}

		try {
      // const andy = this.props.onCallbackFired;
      // this.debugCallback = this.props.onCallbackFired;
      // const replacedCode = this.props.code.replace(/debugCallback/g, 'debugCallback');
      // console.log('replacedCode', replacedCode);
			const compiledCode = compileCode(this.props.code);

			// 1. Use setter/with to call our callback function when user write `initialState = {...}`
			// 2. Wrap code in JSON.stringify/eval to catch the component and return it
			const exampleComponentCode = `
				var stateWrapper = {
					set initialState(value) {
						__setInitialState(value)
					}
				}
				with (stateWrapper) {
					return eval(${JSON.stringify(compiledCode)})
				}
			`;

			const exampleComponent = this.props.evalInContext(exampleComponentCode);
      const onDebugCallback = this.props.onCallbackFired;

			// Wrap everything in a React component to leverage the state management of this component
			class PreviewComponent extends Component { // eslint-disable-line react/no-multi-comp
				constructor(props) {
					super(props);
					this.state = {};
					this.setState = this.setState.bind(this);
					this.setInitialState = this.setInitialState.bind(this);
				}

				// Synchronously set initial state, so it will be ready before first render
				// Ignore all consequent calls
				setInitialState(initialState) {
					Object.assign(this.state, initialState);
					this.setInitialState = noop;
				}

        // create a callback function which will call this class' props.onCallbackFired
        // which is used to visually show when a callback is firing!
        createCallback(cb, details, originalCb) {
          return e => {
            cb({ e, ...details });
            typeof originalCb === 'function' && originalCb(e);
          }
        }

				render() {
					const one = exampleComponent(this.state, this.setState, this.setInitialState);

          // extend props by overriding any null callbacks with our fancy callback indicators
          let newProps = {};
          for (var key in one.props) {
            newProps[key] = /^on[A-Z]/.test(key)
              ? this.createCallback(this.props.onCallbackFired, { name: key }, one.props[key])
              : one.props[key];
          }

          return React.cloneElement(one, newProps);
				}
			}

			const wrappedComponent = (
				<Wrapper>
					<PreviewComponent onCallbackFired={ onDebugCallback } />
				</Wrapper>
			);

			ReactDOM.render(wrappedComponent, this.mountNode);
		}
		catch (err) {
			ReactDOM.unmountComponentAtNode(this.mountNode);
			this.setState({
				error: err.toString(),
			}, () => console.error(err));
		}
	}

	render() {
		const { error } = this.state;
		return (
			<div>
				<div ref={ref => (this.mountNode = ref)}></div>
				{error && <PlaygroundError message={error} />}
			</div>
		);
	}
}
