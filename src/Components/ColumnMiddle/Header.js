/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '../../Assets/Icons/Search';
import MainMenuButton from './MainMenuButton';
import HeaderChat from '../Tile/HeaderChat';
import HeaderCommand from './HeaderCommand';
import HeaderProgress from './HeaderProgress';
import PinnedMessage from './PinnedMessage';
import { changeChatDetailsVisibility } from '../../Actions/Chat';
import {
    getChatSubtitle,
    getChatTitle,
    isAccentChatSubtitle
} from '../../Utils/Chat';
import { openChat, searchChat } from '../../Actions/Client';
import AppStore from '../../Stores/ApplicationStore';
import ChatStore from '../../Stores/ChatStore';
import MessageStore from '../../Stores/MessageStore';
import './Header.css';

class Header extends Component {
    state = {
        authorizationState: AppStore.getAuthorizationState(),
        connectionState: AppStore.getConnectionState()
    };

    componentDidMount() {
        AppStore.on('clientUpdateChatId', this.onClientUpdateChatId);
        AppStore.on('updateAuthorizationState', this.onUpdateAuthorizationState);
        AppStore.on('updateConnectionState', this.onUpdateConnectionState);

        MessageStore.on('clientUpdateClearSelection', this.onClientUpdateMessageSelected);
        MessageStore.on('clientUpdateMessageSelected', this.onClientUpdateMessageSelected);
    }

    componentWillUnmount() {
        AppStore.off('clientUpdateChatId', this.onClientUpdateChatId);
        AppStore.off('updateAuthorizationState', this.onUpdateAuthorizationState);
        AppStore.off('updateConnectionState', this.onUpdateConnectionState);

        MessageStore.off('clientUpdateClearSelection', this.onClientUpdateMessageSelected);
        MessageStore.off('clientUpdateMessageSelected', this.onClientUpdateMessageSelected);
    }

    onClientUpdateMessageSelected = update => {
        this.setState({ selectionCount: MessageStore.selectedItems.size });
    };

    onClientUpdateChatId = update => {
        this.forceUpdate();
    };

    onUpdateConnectionState = update => {
        this.setState({ connectionState: update.state });
    };

    onUpdateAuthorizationState = update => {
        this.setState({ authorizationState: update.authorization_state });
    };

    openChatDetails = () => {
        const chatId = AppStore.getChatId();
        const chat = ChatStore.get(chatId);
        if (!chat) return;

        const { isSmallWidth } = AppStore;

        if (isSmallWidth) {
            openChat(chatId, null, true);
        } else {
            changeChatDetailsVisibility(true);
        }
    };

    handleSearchChat = () => {
        const chatId = AppStore.getChatId();
        const chat = ChatStore.get(chatId);
        if (!chat) return;

        searchChat(chatId);
    };

    localize = str => {
        const { t } = this.props;

        return t(str)
            .replace('...', '')
            .replace('…', '');
    };

    render() {
        const { t } = this.props;
        const {
            authorizationState,
            connectionState,
            selectionCount,
        } = this.state;

        let control = null;
        if (selectionCount) {
            control = <HeaderCommand count={selectionCount} />;
        }

        const chatId = AppStore.getChatId();
        const chat = ChatStore.get(chatId);

        const isAccentSubtitle = isAccentChatSubtitle(chatId);
        let title = getChatTitle(chatId, true, t);
        let subtitle = getChatSubtitle(chatId, true);
        let showProgressAnimation = false;

        if (connectionState) {
            switch (connectionState['@type']) {
                case 'connectionStateConnecting':
                    title = this.localize('Connecting');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
                case 'connectionStateConnectingToProxy':
                    title = this.localize('Connecting to proxy');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
                case 'connectionStateReady':
                    break;
                case 'connectionStateUpdating':
                    title = this.localize('Updating');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
                case 'connectionStateWaitingForNetwork':
                    title = this.localize('Waiting for network');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
            }
        } else if (authorizationState) {
            switch (authorizationState['@type']) {
                case 'authorizationStateClosed':
                    break;
                case ' authorizationStateClosing':
                    break;
                case 'authorizationStateLoggingOut':
                    title = this.localize('Logging out');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
                case 'authorizationStateReady':
                    break;
                case 'authorizationStateWaitCode':
                    break;
                case 'authorizationStateWaitEncryptionKey':
                    title = this.localize('Loading');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
                case 'authorizationStateWaitPassword':
                    break;
                case 'authorizationStateWaitPhoneNumber':
                    break;
                case 'authorizationStateWaitTdlibParameters':
                    title = this.localize('Loading');
                    subtitle = '';
                    showProgressAnimation = true;
                    break;
            }
        } else {
            title = this.localize('Loading');
            subtitle = '';
            showProgressAnimation = true;
        }

        control = control || (
            <div className='header-details'>
                {showProgressAnimation ? (
                    <div
                        className={classNames('header-status', 'grow', chat ? 'cursor-pointer' : 'cursor-default')}
                        onClick={this.openChatDetails}>
                        <span className='header-status-content'>{title}</span>
                        <HeaderProgress />
                        <span
                            className={classNames('header-status-title', { 'header-status-accent': isAccentSubtitle })}>
                            {subtitle}
                        </span>
                        <span className='header-status-tail' />
                    </div>
                ) : (
                    <HeaderChat
                        className={classNames('grow', 'cursor-pointer')}
                        chatId={chatId}
                        onClick={this.openChatDetails}
                    />
                )}
                <PinnedMessage chatId={chatId} />
                {chat && (
                    <>
                        <IconButton
                            className='header-right-second-button'
                            aria-label='Search'
                            onClick={this.handleSearchChat}>
                            <SearchIcon />
                        </IconButton>
                        <MainMenuButton openChatDetails={this.openChatDetails} />
                    </>
                )}
            </div>
        );

        return control;
    }
}

export default withTranslation()(Header);
