/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import withStyles from '@material-ui/core/styles/withStyles';
import { withTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import ReplyIcon from '@material-ui/icons/Reply';
import IconButton from '@material-ui/core/IconButton';
import Reply from '../Message/Reply';
import MessageStore from '../../Stores/MessageStore';
import TdLibController from '../../Controllers/TdLibController';
import './InputBoxHeader.css';

const styles = theme => ({
    icon: {
        padding: 12,
        color: theme.palette.primary.main
    },
    closeIconButton: {
        margin: 0
    }
});

class InputBoxHeader extends React.Component {
    componentDidMount() {
        MessageStore.on('updateMessageContent', this.onUpdateMessageContent);
    }

    componentWillUnmount() {
        MessageStore.off('updateMessageContent', this.onUpdateMessageContent);
    }

    onUpdateMessageContent = update => {
        const { chatId, messageId, editMessageId } = this.props;
        const { chat_id, message_id } = update;

        if (chatId !== chat_id) return;
        if (messageId !== message_id && editMessageId !== message_id) return;

        this.forceUpdate();
    };

    handleClose = () => {
        const { chatId, editMessageId } = this.props;

        if (editMessageId) {
            TdLibController.clientUpdate({
                '@type': 'clientUpdateEditMessage',
                chatId,
                messageId: 0
            });
        } else {
            TdLibController.clientUpdate({
                '@type': 'clientUpdateReply',
                chatId,
                messageId: 0
            });
        }
    };

    render() {
        const { classes, chatId, messageId, editMessageId, t, onClick } = this.props;
        if (!chatId) return null;
        if (!messageId && !editMessageId) return null;

        return (
            <div className='inputbox-header'>
                <div className='inputbox-header-left-column'>
                    {editMessageId > 0 ? <EditIcon className={classes.icon} /> : <ReplyIcon className={classes.icon} />}
                </div>
                <div className='inputbox-header-middle-column'>
                    <Reply
                        chatId={chatId}
                        messageId={messageId || editMessageId}
                        title={editMessageId ? t('EditMessage') : null}
                        onClick={onClick}
                    />
                </div>
                <div className='inputbox-header-right-column'>
                    <IconButton className={classes.closeIconButton} aria-label='Close' onClick={this.handleClose}>
                        <CloseIcon />
                    </IconButton>
                </div>
            </div>
        );
    }
}

InputBoxHeader.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    editMessageId: PropTypes.number,
    onClick: PropTypes.func
};

const enhance = compose(
    withStyles(styles, { withTheme: true }),
    withTranslation()
);

export default enhance(InputBoxHeader);
