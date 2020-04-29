/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Popover from '@material-ui/core/Popover';
import CopyIcon from '../../Assets/Icons/Copy';
import DeleteIcon from '../../Assets/Icons/Delete';
import FrameCheckIcon from '../../Assets/Icons/FrameCheck';
import EditIcon from '../../Assets/Icons/Edit';
import RemoveCheckIcon from '../../Assets/Icons/RemoveCheck';
import ShareIcon from '../../Assets/Icons/Share';
import StopIcon from '../../Assets/Icons/Stop';
import PinIcon from '../../Assets/Icons/Pin2';
import UnpinIcon from '../../Assets/Icons/Pin2';
import { canMessageBeClosed, canMessageBeDeleted, canMessageBeEdited, canMessageBeForwarded, canMessageBeUnvoted, isMessagePinned } from '../../Utils/Message';
import { canPinMessages, canSendMessages } from '../../Utils/Chat';
import { cancelPollAnswer, stopPoll } from '../../Actions/Poll';
import { copy } from '../../Utils/Text';
import { clearSelection, deleteMessages, editMessage, forwardMessages, replyMessage, selectMessage } from '../../Actions/Client';
import { pinMessage, unpinMessage } from '../../Actions/Message';
import MessageStore from '../../Stores/MessageStore';
import TdLibController from '../../Controllers/TdLibController';
import './MessageMenu.css';

class MessageMenu extends React.PureComponent {
    state = {
        confirmStopPoll: false
    };

    handleConfirmStopPoll = event => {
        const { dialog } = this.state;
        if (dialog) return;

        this.setState({
            confirmStopPoll: true,
            contextMenu: false
        });
    };

    handleCloseConfirm = event => {
        if (event) {
            event.stopPropagation();
        }

        this.setState({ confirmStopPoll: false });
    };

    handleStopPoll = event => {
        event.stopPropagation();

        const { chatId, messageId } = this.props;
        const { confirmStopPoll } = this.state;

        if (confirmStopPoll) {
            this.setState({ confirmStopPoll: false });
        }

        stopPoll(chatId, messageId);
    };

    handleUnvote = event => {
        if (event) {
            event.stopPropagation();
        }

        const { chatId, messageId, onClose } = this.props;

        onClose(event);
        cancelPollAnswer(chatId, messageId);
    };

    handleCopyLink = event => {
        const { onClose, copyLink } = this.props;

        onClose(event);

        if (!copyLink) return;
        copy(copyLink);
    };

    handleReply = event => {
        const { chatId, messageId, onClose } = this.props;

        clearSelection();
        onClose(event);
        replyMessage(chatId, messageId);
    };

    handlePin = event => {
        const { chatId, messageId, onClose } = this.props;

        clearSelection();
        onClose(event);

        if (isMessagePinned(chatId, messageId)) {
            unpinMessage(chatId);
        } else {
            pinMessage(chatId, messageId);
        }
    };

    handleForward = event => {
        const { chatId, messageId, onClose } = this.props;

        onClose(event);
        forwardMessages(chatId, [messageId]);
    };

    handleEdit = event => {
        const { chatId, messageId, onClose } = this.props;

        clearSelection();
        onClose(event);
        editMessage(chatId, messageId);
    };

    handleSelect = event => {
        const { chatId, messageId, onClose } = this.props;

        onClose(event);
        selectMessage(chatId, messageId, true);
    };

    handleDelete = event => {
        const { chatId, messageId, onClose } = this.props;

        onClose(event);
        deleteMessages(chatId, [messageId]);
    };

    handleDownload = async event => {
        const { chatId, messageId, onClose } = this.props;

        onClose(event);

        const message = MessageStore.get(chatId, messageId);
        if (!message) return;

        const { content } = message;
        if (!content) return;

        const { audio } = content;
        if (!audio) return;

        const { audio: file } = audio;
        if (!file) return;

        const { id: file_id } = file;

        const result = await TdLibController.send({
            '@type': 'downloadFile',
            file_id,
            priority: 1,
            offset: 10 * 1024,
            limit: 1024,
            synchronous: true
        });

        const blob = await TdLibController.send({
            '@type': 'readFilePart',
            file_id,
            offset: 10 * 1024,
            count: 1024
        });

        console.log('[file] result', result, blob);
    };

    render() {
        const { t, chatId, messageId, anchorPosition, copyLink, open, onClose } = this.props;
        const { confirmStopPoll } = this.state;

        const isPinned = isMessagePinned(chatId, messageId);
        const canBeUnvoted = canMessageBeUnvoted(chatId, messageId);
        const canBeClosed = canMessageBeClosed(chatId, messageId);
        const canBeReplied = canSendMessages(chatId);
        const canBePinned = canPinMessages(chatId);
        const canBeForwarded = canMessageBeForwarded(chatId, messageId);
        const canBeDeleted = canMessageBeDeleted(chatId, messageId);
        const canBeEdited = canMessageBeEdited(chatId, messageId);
        const canBeSelected = !MessageStore.hasSelectedMessage(chatId, messageId);
        const canCopyLink = Boolean(copyLink);

        return (
            <>
                <Popover
                    open={open}
                    onClose={onClose}
                    anchorReference='anchorPosition'
                    anchorPosition={anchorPosition}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                    }}
                    onMouseDown={e => e.stopPropagation()}>
                    <MenuList onClick={e => e.stopPropagation()}>
                        {/*<MenuItem onClick={this.handleDownload}>{t('Download')}</MenuItem>*/}
                        {canCopyLink && (
                            <MenuItem onClick={this.handleCopyLink}>
                                <ListItemIcon>
                                    <CopyIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('CopyLink')} />
                            </MenuItem>
                        )}
                        {canBeReplied && (
                            <MenuItem onClick={this.handleReply}>
                                <ListItemIcon>
                                    <ShareIcon style={{transform: 'scaleX(-1)'}}/>
                                </ListItemIcon>
                                <ListItemText primary={t('Reply')} />
                            </MenuItem>
                        )}
                        {canBePinned && (
                            <MenuItem onClick={this.handlePin}>
                                {isPinned ? (
                                    <>
                                        <ListItemIcon>
                                            <UnpinIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={t('UnpinFromTop')} />
                                    </>
                                ) : (
                                    <>
                                        <ListItemIcon>
                                            <PinIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={t('PinToTop')} />
                                    </>
                                )}
                            </MenuItem>
                        )}
                        {canBeSelected && (
                            <MenuItem onClick={this.handleSelect}>
                                <ListItemIcon>
                                    <FrameCheckIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('Select')} />
                            </MenuItem>
                        )}
                        {canBeForwarded && (
                            <MenuItem onClick={this.handleForward}>
                                <ListItemIcon>
                                    <ShareIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('Forward')} />
                            </MenuItem>
                        )}
                        {canBeEdited && (
                            <MenuItem onClick={this.handleEdit}>
                                <ListItemIcon>
                                    <EditIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('Edit')} />
                            </MenuItem>
                        )}
                        {canBeDeleted && (
                            <MenuItem color='secondary' onClick={this.handleDelete}>
                                <ListItemIcon>
                                    <DeleteIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('Delete')} />
                            </MenuItem>
                        )}
                        {canBeUnvoted && (
                            <MenuItem onClick={this.handleUnvote}>
                                <ListItemIcon>
                                    <RemoveCheckIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('Unvote')} />
                            </MenuItem>
                        )}
                        {canBeClosed && (
                            <MenuItem onClick={this.handleConfirmStopPoll}>
                                <ListItemIcon>
                                    <StopIcon />
                                </ListItemIcon>
                                <ListItemText primary={t('StopPoll')} />
                            </MenuItem>
                        )}
                    </MenuList>
                </Popover>
                <Dialog
                    transitionDuration={0}
                    open={confirmStopPoll}
                    onClose={this.handleCloseConfirm}
                    aria-labelledby='form-dialog-title'>
                    <DialogTitle id='form-dialog-title'>{t('StopPollAlertTitle')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{t('StopPollAlertText')}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseConfirm} color='primary'>
                            {t('Cancel')}
                        </Button>
                        <Button onClick={this.handleStopPoll} color='primary'>
                            {t('Stop')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

}

MessageMenu.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    anchorPosition: PropTypes.object,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    copyLink: PropTypes.string
};

export default withTranslation()(MessageMenu);