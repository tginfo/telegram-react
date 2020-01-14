/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { compose } from 'recompose';
import withStyles from '@material-ui/core/styles/withStyles';
import { withTranslation } from 'react-i18next';
import CloseIcon from '../../Assets/Icons/Close';
import Article from './Article';
import InstantViewMediaViewer from '../Viewer/InstantViewMediaViewer';
import IVContext from './IVContext';
import MediaViewerButton from '../Viewer/MediaViewerButton';
import NavigateBeforeIcon from '../../Assets/Icons/Left';
import { itemsInView, throttle } from '../../Utils/Common';
import { getInnerBlocks } from '../../Utils/InstantView';
import { openInstantView } from '../../Actions/InstantView';
import { setInstantViewContent, setInstantViewViewerContent } from '../../Actions/Client';
import { IV_PHOTO_SIZE } from '../../Constants';
import InstantViewStore from '../../Stores/InstantViewStore';
import TdLibController from '../../Controllers/TdLibController';
import './InstantViewer.css';

const styles = theme => ({
    instantViewer: {
        background: theme.palette.type === 'dark' ? theme.palette.background.default : '#FFFFFF',
        color: theme.palette.text.primary
    },
    leftButton: {
        color: theme.palette.text.secondary,
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0
    },
    closeButton: {
        color: theme.palette.text.secondary,
        position: 'fixed',
        top: 0,
        right: 0
    }
});

class InstantViewer extends React.Component {
    constructor(props) {
        super(props);

        this.articleRef = React.createRef();
        this.instantViewerRef = React.createRef();

        this.state = {};

        this.updateItemsInView = throttle(this.updateItemsInView, 500);
    }

    static getDerivedStateFromProps(props, state) {
        if (props.instantView !== state.prevInstantView) {
            return {
                prevInstantView: props.instantView,
                hasPrev: InstantViewStore.hasPrev(),
                hasScroll: false,
                media: null,
                caption: null,
                url: null
            };
        }

        return null;
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        const { instantView } = this.props;
        const { hasScroll, hasPrev, media, caption, url } = this.state;

        if (instantView !== nextProps.instantView) {
            return true;
        }

        if (hasScroll !== nextState.hasScroll) {
            return true;
        }

        if (hasPrev !== nextState.hasPrev) {
            return true;
        }

        if (media !== nextState.media) {
            return true;
        }

        if (caption !== nextState.caption) {
            return true;
        }

        if (url !== nextState.url) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        this.mounted = true;
        this.handleScroll();

        document.addEventListener('keydown', this.onKeyDown, false);
        InstantViewStore.on('clientUpdateInstantViewUrl', this.onClientUpdateInstantViewUrl);
        InstantViewStore.on('clientUpdateInstantViewViewerContent', this.onClientUpdateInstantViewViewerContent);
    }

    componentWillUnmount() {
        this.mounted = false;
        document.removeEventListener('keydown', this.onKeyDown, false);
        InstantViewStore.off('clientUpdateInstantViewUrl', this.onClientUpdateInstantViewUrl);
        InstantViewStore.off('clientUpdateInstantViewViewerContent', this.onClientUpdateInstantViewViewerContent);
    }

    onClientUpdateInstantViewViewerContent = update => {
        const { content } = update;
        if (!content) {
            this.setState({ media: null, caption: null, url: null });
            return;
        }

        const { media, caption, url, instantView } = content;

        if (this.props.instantView !== instantView) return;

        this.setState({ media, caption, url });
    };

    onClientUpdateInstantViewUrl = async update => {
        console.log('[IV] clientUpdateInstantViewUrl', update);
        const { url } = update;
        const active = InstantViewStore.getCurrent();
        const { instantView } = this.props;

        if (active !== instantView) return;

        if (instantView && url.startsWith(instantView.url)) {
            const hash = new URL(url).hash;
            if (url.indexOf('#') === url.length - 1) {
                this.scrollTop('smooth');

                return;
            } else if (hash && this.scrollToHash(hash, 'smooth')) {
                return;
            }
        }

        openInstantView(url);
    };

    scrollToHash(hash, behavior) {
        if (!hash) return false;

        const hiddenElement = document.getElementById(hash.substr(1));
        if (hiddenElement) {
            const details = [];
            let finished = false;
            let currentElement = hiddenElement;
            do {
                currentElement = currentElement.parentNode;
                if (currentElement) {
                    if (currentElement.nodeName === 'DETAILS') {
                        details.push(currentElement);
                    } else if (currentElement.nodeName === 'ARTICLE') {
                        finished = true;
                    }
                } else {
                    finished = true;
                }
            } while (!finished);

            details.forEach(x => (x.open = true));

            hiddenElement.scrollIntoView({
                block: 'center',
                behavior
            });

            return true;
        }

        return false;
    }

    scrollTop(behavior) {
        const element = this.instantViewerRef.current;

        switch (behavior) {
            case 'smooth': {
                element.scrollTop = Math.min(element.scrollTop, 100);
                setTimeout(() => {
                    element.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 50);
                break;
            }
            default: {
                element.scrollTo({
                    top: 0,
                    behavior
                });
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { instantView, url } = this.props;
        console.log('[IV] componentDidUpdate', instantView.url, instantView.url === prevProps.instantView.url);

        const hash = new URL(instantView.url).hash;
        if (prevProps.instantView !== instantView) {
            if (prevProps.instantView.url !== instantView.url) {
                if (instantView.url.indexOf('#') === instantView.url.length - 1) {
                    console.log('[IV] componentDidUpdate scrollTop auto');
                    this.scrollTop('auto');
                } else if (hash) {
                    console.log('[IV] componentDidUpdate scrollToHash', hash);
                    this.scrollToHash(hash, 'auto');
                } else {
                    console.log('[IV] componentDidUpdate scrollTop auto');
                    this.scrollTop('auto');
                }
            } else {
                if (hash) {
                    console.log('[IV] componentDidUpdate scrollToHash', hash);
                    this.scrollToHash(hash, 'auto');
                } else {
                    console.log('[IV] componentDidUpdate scrollTop smooth');
                    this.scrollTop('smooth');
                }
            }

            this.handleScroll();
        }
    }

    onKeyDown = event => {
        if (event.keyCode === 27) {
            const { media } = this.state;

            if (media) {
                setInstantViewViewerContent(null);
                return;
            }

            this.handleClose();
        }
    };

    handleClose() {
        setInstantViewContent(null);
    }

    handleBack = () => {
        const { hasPrev, hasScroll } = this.state;
        if (hasScroll) {
            this.scrollTop('smooth');
            return;
        }

        if (hasPrev) {
            TdLibController.clientUpdate({
                '@type': 'clientUpdatePrevInstantView'
            });
            return;
        }

        this.handleClose();
    };

    handleScroll = () => {
        const element = this.instantViewerRef.current;
        this.setState({
            hasScroll: element.scrollTop > 50
        });

        this.updateItemsInView();
    };

    updateItemsInView() {
        if (!this.mounted) return;

        const { instantView } = this.props;
        if (!instantView) return;

        const { page_blocks } = instantView;

        const blocks = new Map();
        const items = itemsInView(this.instantViewerRef, this.articleRef);

        for (let i = 0; i < items.length; i++) {
            const block = page_blocks[items[i]];
            blocks.set(block, block);

            const innerBlocks = getInnerBlocks(block);
            innerBlocks.forEach(x => blocks.set(x, x));
        }

        TdLibController.clientUpdate({
            '@type': 'clientUpdateBlocksInView',
            blocks
        });
    }

    render() {
        const { classes, instantView } = this.props;
        const { hasPrev, hasScroll, media, caption, url } = this.state;
        if (!instantView) return null;

        return (
            <IVContext.Provider value={instantView}>
                <div
                    ref={this.instantViewerRef}
                    className={classNames('instant-viewer', classes.instantViewer)}
                    onScroll={this.handleScroll}>
                    <div className='instant-viewer-left-column' onClick={this.handleBack}>
                        <MediaViewerButton
                            className={classes.leftButton}
                            style={{ alignItems: 'flex-start' }}
                            onClick={this.handleBack}>
                            <NavigateBeforeIcon
                                style={{
                                    transition: 'transform 0.25s ease-out',
                                    transform: hasScroll ? 'rotate(90deg)' : 'rotate(0deg)'
                                }}
                            />
                        </MediaViewerButton>
                    </div>
                    <div className='instant-viewer-content-column'>
                        <div>
                            <Article ref={this.articleRef} />
                        </div>
                    </div>
                    <div className='instant-viewer-right-column'>
                        <MediaViewerButton className={classes.closeButton} onClick={this.handleClose}>
                            <CloseIcon />
                        </MediaViewerButton>
                    </div>
                </div>
                {media && <InstantViewMediaViewer media={media} size={IV_PHOTO_SIZE} caption={caption} url={url} />}
            </IVContext.Provider>
        );
    }
}

InstantViewer.propTypes = {
    instantView: PropTypes.object.isRequired
};

const enhance = compose(
    withStyles(styles),
    withTranslation()
);

export default enhance(InstantViewer);
