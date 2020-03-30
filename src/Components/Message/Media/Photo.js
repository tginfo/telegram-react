/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FileProgress from '../../Viewer/FileProgress';
import { getSize, getFitSize } from '../../../Utils/Common';
import { getSrc } from '../../../Utils/File';
import { isBlurredThumbnail } from '../../../Utils/Media';
import { PHOTO_SIZE, PHOTO_DISPLAY_SIZE, PHOTO_THUMBNAIL_SIZE } from '../../../Constants';
import FileStore from '../../../Stores/FileStore';
import './Photo.css';

class Photo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    static getDerivedStateFromProps(props, state) {
        const { photo, size, thumbnailSize } = props;
        if (photo !== state.prevPhoto) {
            return {
                prevPhoto: photo,
                photoSize: getSize(photo.sizes, size),
                thumbSize: getSize(photo.sizes, thumbnailSize),
                minithumbnail: photo ? photo.minithumbnail : null
            };
        }

        return null;
    }

    componentDidMount() {
        FileStore.on('clientUpdatePhotoBlob', this.onClientUpdatePhotoBlob);
    }

    componentWillUnmount() {
        FileStore.off('clientUpdatePhotoBlob', this.onClientUpdatePhotoBlob);
    }

    onClientUpdatePhotoBlob = update => {
        const { photoSize, thumbSize } = this.state;
        const { fileId } = update;

        if (photoSize && photoSize.photo && photoSize.photo.id === fileId) {
            this.forceUpdate();
        } else if (thumbSize && thumbSize.photo && thumbSize.photo.id === fileId) {
            this.forceUpdate();
        }
    };

    render() {
        const { className, displaySize, openMedia, showProgress, title, caption, type, style } = this.props;
        const { thumbSize, photoSize, minithumbnail } = this.state;

        if (!photoSize) return null;

        const miniSrc = minithumbnail ? 'data:image/jpeg;base64, ' + minithumbnail.data : null;
        const thumbSrc = getSrc(thumbSize ? thumbSize.photo : null);
        const src = getSrc(photoSize.photo);
        const isBlurred = (!thumbSrc && miniSrc) || isBlurredThumbnail(thumbSize);

        const fitPhotoSize = getFitSize(photoSize, displaySize, false);
        if (!fitPhotoSize) return null;

        // console.log('[photo] render', displaySize, fitPhotoSize);
        const photoStyle = {
            width: fitPhotoSize.width,
            height: fitPhotoSize.height,
            ...style
        };

        const hasSrc = Boolean(src || thumbSrc || miniSrc);

        return (
            <div
                className={classNames(className, 'photo', {
                    'photo-big': type === 'message',
                    'photo-title': title,
                    'photo-caption': caption,
                    pointer: openMedia
                })}
                style={photoStyle}
                onClick={openMedia}>
                {hasSrc && (
                    <img
                        className={classNames('photo-image', {
                            'media-blurred': !src && isBlurred,
                            'media-mini-blurred': !src && !thumbSrc && isBlurred
                        })}
                        draggable={false}
                        src={src || thumbSrc || miniSrc}
                        alt=''
                    />
                )}
                {showProgress && <FileProgress file={photoSize.photo} download upload cancelButton />}
            </div>
        );
    }
}

Photo.propTypes = {
    chatId: PropTypes.number,
    messageId: PropTypes.number,
    photo: PropTypes.object.isRequired,
    openMedia: PropTypes.func,
    showProgress: PropTypes.bool,

    size: PropTypes.number,
    thumbnailSize: PropTypes.number,
    displaySize: PropTypes.number,
    style: PropTypes.object
};

Photo.defaultProps = {
    size: PHOTO_SIZE,
    thumbnailSize: PHOTO_THUMBNAIL_SIZE,
    displaySize: PHOTO_DISPLAY_SIZE,
    showProgress: true
};

export default Photo;
