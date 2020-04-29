/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import FileProgress from './FileProgress';
import MediaCaption from './MediaCaption';
import { getAnimationData, getMediaFile, getMediaMiniPreview, getMediaPreviewFile, getSrc } from '../../Utils/File';
import { getText, isAnimationMessage, isLottieMessage, isVideoMessage } from '../../Utils/Message';
import { isBlurredThumbnail } from '../../Utils/Media';
import FileStore from '../../Stores/FileStore';
import MessageStore from '../../Stores/MessageStore';
import PlayerStore from '../../Stores/PlayerStore';
import TdLibController from '../../Controllers/TdLibController';
import './MediaViewerContent.css';

// const Lottie = React.lazy(() => import('./Lottie'));

class MediaViewerContent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.videoRef = React.createRef();
        this.lottieRef = React.createRef();

        this.updateAnimationData();
    }

    static getDerivedStateFromProps(props, state) {
        const { chatId, messageId, size, t } = props;

        if (chatId !== state.prevChatId || messageId !== state.prevMessageId) {
            let [width, height, file, mimeType] = getMediaFile(chatId, messageId, size);
            file = FileStore.get(file.id) || file;

            let [thumbnailWidth, thumbnailHeight, thumbnail] = getMediaPreviewFile(chatId, messageId);
            thumbnail = FileStore.get(thumbnail.id) || thumbnail;

            const [minithumbnailWidth, minithumbnailHeight, minithumbnail] = getMediaMiniPreview(chatId, messageId);

            const message = MessageStore.get(chatId, messageId);
            const text = getText(message, null, t);

            return {
                prevChatId: chatId,
                prevMessageId: messageId,

                speed: 1,
                isPlaying: false,
                width,
                height,
                file,
                src: getSrc(file),
                mimeType,
                text,
                thumbnailWidth,
                thumbnailHeight,
                thumbnail,
                minithumbnailWidth,
                minithumbnailHeight,
                minithumbnail
            };
        }

        return null;
    }

    componentDidMount() {
        FileStore.on('clientUpdateDocumentBlob', this.onClientUpdateDocumentBlob);
        FileStore.on('clientUpdatePhotoBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateVideoBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateAnimationBlob', this.onClientUpdateMediaBlob);
        FileStore.on('clientUpdateVideoThumbnailBlob', this.onClientUpdateMediaThumbnailBlob);
        FileStore.on('clientUpdateAnimationThumbnailBlob', this.onClientUpdateMediaThumbnailBlob);
        MessageStore.on('updateMessageContent', this.onUpdateMessageContent);
    }

    componentWillUnmount() {
        FileStore.off('clientUpdateDocumentBlob', this.onClientUpdateDocumentBlob);
        FileStore.off('clientUpdatePhotoBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateVideoBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateAnimationBlob', this.onClientUpdateMediaBlob);
        FileStore.off('clientUpdateVideoThumbnailBlob', this.onClientUpdateMediaThumbnailBlob);
        FileStore.off('clientUpdateAnimationThumbnailBlob', this.onClientUpdateMediaThumbnailBlob);
        MessageStore.off('updateMessageContent', this.onUpdateMessageContent);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { chatId, messageId } = this.props;
        const { src } = this.state;

        if (prevProps.chatId !== chatId || prevProps.messageId !== messageId) {
            this.updateAnimationData();
        }

        if (prevState.src !== src) {
            const player = this.videoRef.current;
            if (!player) return;

            player.load();
        }
    }

    onClientUpdateDocumentBlob = update => {
        const { chatId, messageId } = this.props;

        if (chatId === update.chatId && messageId === update.messageId) {
            this.updateAnimationData();
        }
    };

    updateAnimationData = async () => {
        const { chatId, messageId } = this.props;

        if (!isLottieMessage(chatId, messageId)) {
            return;
        }

        const { file } = this.state;
        const animationData = await getAnimationData(file);

        this.setState({ animationData });
    };

    onClientUpdateMediaBlob = update => {
        const { chatId, messageId, size } = this.props;

        if (chatId === update.chatId && messageId === update.messageId) {
            const [width, height, file, mimeType] = getMediaFile(chatId, messageId, size);

            this.setState({
                width,
                height,
                file,
                src: getSrc(file),
                mimeType
            });
        }
    };

    onClientUpdateMediaThumbnailBlob = update => {
        const { chatId, messageId } = this.props;

        if (chatId === update.chatId && messageId === update.messageId) {
            const [width, height, file] = getMediaPreviewFile(chatId, messageId);
            this.setState({
                thumbnailWidth: width,
                thumbnailHeight: height,
                thumbnail: file
            });
        }
    };

    onUpdateMessageContent = update => {
        const { chatId, messageId, size, t } = this.props;
        const { chat_id, message_id } = update;

        if (chatId === chat_id && messageId === message_id) {
            const [width, height, file, mimeType] = getMediaFile(chatId, messageId, size);
            const message = MessageStore.get(chatId, messageId);
            const text = getText(message, null, t);
            this.setState({
                width,
                height,
                file,
                src: getSrc(file),
                mimeType,
                text
            });
        }
    };

    handleContentClick = event => {
        if (event) event.stopPropagation();
    };

    changeSpeed = speed => {
        this.setState({
            speed
        });
    };

    render() {
        const { chatId, messageId } = this.props;
        const {
            // animationData,
            width,
            height,
            file,
            src,
            mimeType,
            text,
            thumbnailWidth,
            thumbnailHeight,
            minithumbnail,
            thumbnail,
            isPlaying
        } = this.state;

        if (!file) return null;

        const miniSrc = minithumbnail ? 'data:image/jpeg;base64, ' + minithumbnail.data : null;
        const thumbnailSrc = getSrc(thumbnail);
        const isBlurred = thumbnailSrc ? isBlurredThumbnail({ width: thumbnailWidth, height: thumbnailHeight }) : Boolean(miniSrc);

        const isVideo = isVideoMessage(chatId, messageId);
        const isAnimation = isAnimationMessage(chatId, messageId);
        const isLottie = isLottieMessage(chatId, messageId);

        let videoWidth = width;
        let videoHeight = height;
        if (Math.max(videoWidth, videoHeight) > 640) {
            const scale = 640 / Math.max(videoWidth, videoHeight);
            videoWidth = videoWidth > videoHeight ? 640 : Math.floor(videoWidth * scale);
            videoHeight = videoHeight > videoWidth ? 640 : Math.floor(videoHeight * scale);
        }

        let content = null;
        const source = src ? <source src={src} type={mimeType}/> : null;
        if (isVideo) {
            content = (
                <div className='media-viewer-content-wrapper'>
                    <video
                        ref={this.videoRef}
                        className='media-viewer-content-video-player'
                        onClick={this.handleContentClick}
                        controls
                        autoPlay
                        width={videoWidth}
                        height={videoHeight}
                        onPlay={() => {
                            this.setState({ isPlaying: true });
                            TdLibController.clientUpdate({
                                '@type': 'clientUpdateMediaViewerPlay'
                            });
                        }}
                        onCanPlay={() => {
                            const player = this.videoRef.current;
                            if (player) {
                                player.volume = PlayerStore.volume;
                            }
                        }}
                        onPause={() => {
                            TdLibController.clientUpdate({
                                '@type': 'clientUpdateMediaViewerPause'
                            });
                        }}
                        onEnded={() => {
                            TdLibController.clientUpdate({
                                '@type': 'clientUpdateMediaViewerEnded'
                            });
                        }}
                        onVolumeChange={() => {
                            const player = this.videoRef.current;
                            if (player) {
                                TdLibController.clientUpdate({
                                    '@type': 'clientUpdateMediaVolume',
                                    volume: player.volume
                                });
                            }
                        }}
                    >
                        {source}
                    </video>
                    {!isPlaying &&
                        ((thumbnailSrc || miniSrc) ? (
                            <img
                                className={classNames('media-viewer-content-video-thumbnail', {
                                    'media-blurred': isBlurred
                                })}
                                src={thumbnailSrc || miniSrc}
                                alt=''
                                width={videoWidth}
                                height={videoHeight}
                            />
                        ) : (
                            <div
                                className='media-viewer-content-video-thumbnail'
                                style={{
                                    width: videoWidth,
                                    height: videoHeight
                                }}
                            />
                        ))}
                </div>
            );
        } else if (isAnimation) {
            content = (
                <div className='media-viewer-content-wrapper'>
                    <video
                        ref={this.videoRef}
                        className='media-viewer-content-video-player'
                        onClick={this.handleContentClick}
                        loop
                        autoPlay
                        width={videoWidth}
                        height={videoHeight}
                        onPlay={() => {
                            this.setState({ isPlaying: true });
                        }}
                    >
                        {source}
                    </video>
                    {!isPlaying &&
                        ((thumbnailSrc || miniSrc) ? (
                            <img
                                className={classNames('media-viewer-content-video-thumbnail', {
                                    'media-blurred': isBlurred
                                })}
                                src={thumbnailSrc || miniSrc}
                                alt=''
                                width={videoWidth}
                                height={videoHeight}
                            />
                        ) : (
                            <div
                                className='media-viewer-content-video-thumbnail'
                                style={{
                                    width: videoWidth,
                                    height: videoHeight
                                }}
                            />
                        ))}
                </div>
            );
        } else if (isLottie) {
            // const defaultOptions = {
            //     loop: true,
            //     autoplay: true,
            //     //path: src,
            //     animationData: animationData,
            //     rendererSettings: {
            //         preserveAspectRatio: 'xMidYMid slice'
            //     }
            // };
            // const { speed } = this.state;
            //
            // content = null;
            // content = (
            //     <Lottie
            //         ref={this.lottieRef}
            //         speed={speed}
            //         options={defaultOptions}
            //         height='auto'
            //         width={400}
            //         isStopped={false}
            //         isPaused={false}
            //     />
            // );
        } else {
            content = (
                <>
                    <img className='media-viewer-content-image' src={src} alt='' onClick={this.handleContentClick} />
                    {/*<img className='media-viewer-content-image-preview' src={previewSrc} alt='' />*/}
                </>
            );
        }

        return (
            <div className='media-viewer-content'>
                {content}
                <FileProgress file={file} zIndex={2} />
                {text && text.length > 0 && <MediaCaption text={text} />}
            </div>
        );
    }
}

MediaViewerContent.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired
};

export default withTranslation()(MediaViewerContent);
