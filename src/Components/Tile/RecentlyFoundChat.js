/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ListItem from '@material-ui/core/ListItem';
import ChatTile from './ChatTile';
import DialogTitle from './DialogTitle';
import './RecentlyFoundChat.css';

class RecentlyFoundChat extends React.PureComponent {
    render() {
        const { chatId, onClick } = this.props;

        return (
            <ListItem button className='recently-found-chat' onClick={onClick}>
                <div className='recently-found-chat-content'>
                    <div className='chat-wrapper'>
                        <ChatTile chatId={chatId} />
                        <div className='dialog-inner-wrapper'>
                            <div className='tile-first-row'>
                                <DialogTitle chatId={chatId} />
                            </div>
                        </div>
                    </div>
                </div>
            </ListItem>
        );
    }
}

RecentlyFoundChat.propTypes = {
    chatId: PropTypes.number.isRequired,
    onSelect: PropTypes.func
};

export default RecentlyFoundChat;
