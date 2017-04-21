import React, { PropTypes } from 'react';
import cx from 'classnames';
import pkg from 'package';

import 'styles/app.css';
import 'styles/react-styleguidist.css';

import './styles.css';

const StyleGuideRenderer = ({
  classes,
	title,
	homepageUrl,
	children,
	toc,
	hasSidebar
}) =>  (
	<div className={cx('cbn-sg-root', hasSidebar && 'cbn-sg-root--sidebar-open')}>
    <header className='cbn-sg-header'>
      <div>
        <h1><span className='cbn-sg-header__logo'>C / UI</span>Carbon UI Design System - Release {pkg.version}</h1>
      </div>
    </header>
		<main className='cbn-sg-content'>
			<div className='cbn-sg-components'>
				{children}
			</div>
		</main>
		{hasSidebar &&
			<div className='cbn-sg-sidebar'>
				{toc}
			</div>
		}
	</div>
);

StyleGuideRenderer.propTypes = {
  classes: PropTypes.object,
	title: PropTypes.string.isRequired,
	homepageUrl: PropTypes.string.isRequired,
	children: PropTypes.node.isRequired,
	toc: PropTypes.node.isRequired,
	hasSidebar: PropTypes.bool
};

export default StyleGuideRenderer;
