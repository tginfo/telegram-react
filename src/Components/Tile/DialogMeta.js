/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import { getLastMessageDate } from '../../Utils/Chat';
import ChatStore from '../../Stores/ChatStore';
import './DialogMeta.css';

const styles = theme => ({
    dialogMetaDate: {
        color: theme.palette.text.secondary
    }
});

class DialogMeta extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (nextProps.chatId !== this.props.chatId) {
            return true;
        }

        if (nextProps.theme !== this.props.theme) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        ChatStore.on('clientUpdateFastUpdatingComplete', this.onFastUpdatingComplete);
        ChatStore.on('clientUpdateClearHistory', this.onClientUpdateClearHistory);
        ChatStore.on('updateChatDraftMessage', this.onUpdate);
        ChatStore.on('updateChatLastMessage', this.onUpdate);
        ChatStore.on('updateChatReadInbox', this.onUpdate);
        ChatStore.on('updateChatUnreadMentionCount', this.onUpdate);
        ChatStore.on('updateMessageMentionRead', this.onUpdate);
    }

    componentWillUnmount() {
        ChatStore.off('clientUpdateFastUpdatingComplete', this.onFastUpdatingComplete);
        ChatStore.off('clientUpdateClearHistory', this.onClientUpdateClearHistory);
        ChatStore.off('updateChatDraftMessage', this.onUpdate);
        ChatStore.off('updateChatLastMessage', this.onUpdate);
        ChatStore.off('updateChatReadInbox', this.onUpdate);
        ChatStore.off('updateChatUnreadMentionCount', this.onUpdate);
        ChatStore.off('updateMessageMentionRead', this.onUpdate);
    }

    onClientUpdateClearHistory = update => {
        const { chatId } = this.props;

        if (chatId === update.chatId) {
            this.clearHistory = update.inProgress;
            this.forceUpdate();
        }
    };

    onFastUpdatingComplete = update => {
        this.forceUpdate();
    };

    onUpdate = update => {
        const { chatId } = this.props;

        if (chatId !== update.chat_id) return;

        this.forceUpdate();
    };

    render() {
        if (this.clearHistory) return null;

        const { chatId, classes } = this.props;

        const chat = ChatStore.get(chatId);
        const date = getLastMessageDate(chat);

        return <>{date && <div className={classNames('dialog-meta', classes.dialogMetaDate)}>{date}</div>}</>;
    }
}

export default withStyles(styles, { withTheme: true })(DialogMeta);
