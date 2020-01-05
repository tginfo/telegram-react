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
import { withTranslation } from 'react-i18next';
import withStyles from '@material-ui/core/styles/withStyles';
import ReplyTile from '../Tile/ReplyTile';
import { getContent, getTitle, isDeletedMessage, getReplyPhotoSize, getReplyMinithumbnail } from '../../Utils/Message';
import { accentStyles } from '../Theme';
import { openChat } from '../../Actions/Client';
import MessageStore from '../../Stores/MessageStore';
import './Reply.css';

const styles = theme => ({
    ...accentStyles(theme)
});

class Reply extends React.Component {
    componentDidMount() {
        MessageStore.on('getMessageResult', this.onGetMessageResult);
    }

    componentWillUnmount() {
        MessageStore.off('getMessageResult', this.onGetMessageResult);
    }

    onGetMessageResult = result => {
        const { chatId, messageId } = this.props;

        if (chatId === result.chat_id && messageId === result.id) {
            this.forceUpdate();
        }
    };

    handleClick = event => {
        event.stopPropagation();
    };

    handleOpen = event => {
        if (event.button !== 0) return;

        event.stopPropagation();

        const { chatId, messageId, onClick } = this.props;

        const message = MessageStore.get(chatId, messageId);
        if (!message) return null;
        if (isDeletedMessage(message)) return null;

        openChat(chatId, messageId, false);
        if (onClick) onClick();
    };

    render() {
        const { classes, t, chatId, messageId } = this.props;
        let { title } = this.props;

        const message = MessageStore.get(chatId, messageId);

        title = title || getTitle(message);
        let content = !message ? t('Loading') : getContent(message, t);
        const photoSize = getReplyPhotoSize(chatId, messageId);
        const minithumbnail = getReplyMinithumbnail(chatId, messageId);

        if (isDeletedMessage(message)) {
            title = null;
            content = t('DeletedMessage');
        }

        return (
            <div className='reply' onMouseDown={this.handleOpen} onClick={this.handleClick}>
                <div className='reply-wrapper'>
                    <div className={classNames('reply-border', classes.accentBackgroundLight)} />
                    {photoSize && (
                        <ReplyTile
                            chatId={chatId}
                            messageId={messageId}
                            photoSize={photoSize}
                            minithumbnail={minithumbnail}
                        />
                    )}
                    <div className='reply-content'>
                        {title && (
                            <div className={classNames('reply-content-title', classes.accentColorMain)}>{title}</div>
                        )}
                        <div className={classNames('reply-content-subtitle')}>{content}</div>
                    </div>
                </div>
            </div>
        );
    }
}

Reply.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    title: PropTypes.string,
    onClick: PropTypes.func
};

const enhance = compose(
    withStyles(styles, { withTheme: true }),
    withTranslation()
);

export default enhance(Reply);
