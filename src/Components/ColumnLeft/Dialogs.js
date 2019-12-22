/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withStyles from '@material-ui/core/styles/withStyles';
import Search from './Search/Search';
import DialogsHeader from './DialogsHeader';
import DialogsList from './DialogsList';
import UpdatePanel from './UpdatePanel';
import { borderStyle } from '../Theme';
import { openChat } from '../../Actions/Client';
import ApplicationStore from '../../Stores/ApplicationStore';
import './Dialogs.css';

const styles = theme => ({
    ...borderStyle(theme)
});

class Dialogs extends Component {
    constructor(props) {
        super(props);

        this.dialogsListRef = React.createRef();
        this.dialogsHeaderRef = React.createRef();

        this.state = {
            isChatDetailsVisible: ApplicationStore.isChatDetailsVisible,
            openSearch: false,
            searchChatId: 0,
            searchText: null,
            query: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (nextState.isChatDetailsVisible !== this.state.isChatDetailsVisible) {
            return true;
        }

        if (nextState.openSearch !== this.state.openSearch) {
            return true;
        }

        if (nextState.searchChatId !== this.state.searchChatId) {
            return true;
        }

        if (nextState.searchText !== this.state.searchText) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        ApplicationStore.on('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
        ApplicationStore.on('clientUpdateSearchChat', this.onClientUpdateSearchChat);
        ApplicationStore.on('clientUpdateThemeChange', this.onClientUpdateThemeChange);
    }

    componentWillUnmount() {
        ApplicationStore.off('clientUpdateChatDetailsVisibility', this.onClientUpdateChatDetailsVisibility);
        ApplicationStore.off('clientUpdateSearchChat', this.onClientUpdateSearchChat);
        ApplicationStore.off('clientUpdateThemeChange', this.onClientUpdateThemeChange);
    }

    onClientUpdateThemeChange = update => {
        this.forceUpdate();
    };

    onClientUpdateChatDetailsVisibility = update => {
        this.setState({
            isChatDetailsVisible: ApplicationStore.isChatDetailsVisible
        });
    };

    onClientUpdateSearchChat = update => {
        const { chatId, query } = update;
        const { openSearch, searchChatId, searchText } = this.state;

        if (openSearch && chatId === searchChatId && query === searchText) {
            return;
        }

        const header = this.dialogsHeaderRef.current;
        this.setState(
            {
                openSearch: true,
                searchChatId: chatId,
                searchText: null
            },
            () => {
                if (header) {
                    header.setInitQuery(query);
                }
            }
        );
    };

    handleHeaderClick = () => {
        this.dialogsListRef.current.scrollToTop();
    };

    handleSearch = visible => {
        this.setState({
            openSearch: visible,
            searchChatId: 0,
            searchText: null
        });
    };

    handleSelectMessage = (chatId, messageId, openSearch) => {
        openChat(chatId, messageId);

        const searchChatId = openSearch ? this.state.searchChatId : 0;
        const searchText = openSearch ? this.state.searchText : null;

        this.setState({
            openSearch: openSearch,
            searchChatId: searchChatId,
            searchText: searchText
        });
    };

    handleClose = () => {
        this.setState({
            openSearch: false,
            searchChatId: 0,
            searchText: null
        });
    };

    handleSearchTextChange = text => {
        this.setState({
            searchText: text,
            query: null
        });
    };

    render() {
        const { classes } = this.props;
        const { isChatDetailsVisible, openSearch, searchChatId, searchText } = this.state;

        return (
            <div
                className={classNames(classes.borderColor, 'dialogs', {
                    'dialogs-third-column': isChatDetailsVisible
                })}>
                <DialogsHeader
                    ref={this.dialogsHeaderRef}
                    openSearch={openSearch}
                    onClick={this.handleHeaderClick}
                    onSearch={this.handleSearch}
                    onSearchTextChange={this.handleSearchTextChange}
                />
                <div className='dialogs-content'>
                    <DialogsList ref={this.dialogsListRef} />
                    {openSearch && (
                        <Search
                            chatId={searchChatId}
                            text={searchText}
                            onSelectMessage={this.handleSelectMessage}
                            onClose={this.handleClose}
                        />
                    )}
                </div>
                <UpdatePanel />
            </div>
        );
    }
}

export default withStyles(styles)(Dialogs);
