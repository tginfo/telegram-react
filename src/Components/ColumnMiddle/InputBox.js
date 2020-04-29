/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import emojiRegex from 'emoji-regex';
import DoneIcon from '../../Assets/Icons/Done';
import IconButton from '@material-ui/core/IconButton';
import InsertEmoticonIcon from '../../Assets/Icons/Smile';
import SendIcon from '../../Assets/Icons/Send';
import AttachButton from './../ColumnMiddle/AttachButton';
import CreatePollDialog from '../Popup/CreatePollDialog';
import EditUrlDialog from '../Popup/EditUrlDialog';
import InputBoxHeader from './InputBoxHeader';
import PasteFilesDialog from '../Popup/PasteFilesDialog';
import EditMediaDialog from '../Popup/EditMediaDialog';
import OutputTypingManager from '../../Utils/OutputTypingManager';
import { draftEquals, getChatDraft, getChatDraftReplyToMessageId, isMeChat, isPrivateChat } from '../../Utils/Chat';
import { findLastTextNode, focusInput } from '../../Utils/DOM';
import { getMediaDocumentFromFile, getMediaPhotoFromFile, isEditedMedia } from '../../Utils/Media';
import { getEntities, getNodes, isTextMessage } from '../../Utils/Message';
import { getSize, readImageSize } from '../../Utils/Common';
import { PHOTO_SIZE } from '../../Constants';
import AppStore from '../../Stores/ApplicationStore';
import ChatStore from '../../Stores/ChatStore';
import FileStore from '../../Stores/FileStore';
import MessageStore from '../../Stores/MessageStore';
import StickerStore from '../../Stores/StickerStore';
import TdLibController from '../../Controllers/TdLibController';
import './InputBox.css';
import { editMessage, replyMessage } from '../../Actions/Client';

const EmojiPickerButton = React.lazy(() => import('./../ColumnMiddle/EmojiPickerButton'));

class InputBox extends Component {
    constructor(props) {
        super(props);

        this.attachDocumentRef = React.createRef();
        this.attachPhotoRef = React.createRef();
        this.newMessageRef = React.createRef();

        const chatId = AppStore.getChatId();

        this.state = {
            chatId,
            replyToMessageId: getChatDraftReplyToMessageId(chatId),
            editMessageId: 0,
            sendFile: null
        };

        document.execCommand('defaultParagraphSeparator', false, 'br');
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { t } = this.props;
        const { chatId, newDraft, files, replyToMessageId, editMessageId, openEditMedia, openEditUrl, sendFile } = this.state;

        if (nextProps.t !== t) {
            return true;
        }

        if (nextState.chatId !== chatId) {
            return true;
        }

        if (nextState.newDraft !== newDraft) {
            return true;
        }

        if (nextState.files !== files) {
            return true;
        }

        if (nextState.replyToMessageId !== replyToMessageId) {
            return true;
        }

        if (nextState.editMessageId !== editMessageId) {
            return true;
        }

        if (nextState.sendFile !== sendFile) {
            return true;
        }

        if (nextState.openEditUrl !== openEditUrl) {
            return true;
        }

        if (nextState.openEditMedia !== openEditMedia) {
            return true;
        }

        return false;
    }

    loadDraft() {
        this.setDraft();
        this.setInputFocus();
        this.handleInput();
    }

    saveDraft() {
        const { chatId, editMessageId, replyToMessageId } = this.state;

        const element = this.newMessageRef.current;
        if (!element) return;

        let innerHTML = null;
        if (editMessageId) {
            innerHTML = this.beforeEditText ? this.beforeEditText.innerHTML : null;
        } else {
            innerHTML = element.innerHTML;
        }

        const draftMessage = this.getDraftMessage(chatId, replyToMessageId, innerHTML);
        this.setChatDraftMessage(draftMessage);
    }

    selectionChangeListener = () => {
        // console.log('[ed] selectionchange', document.activeElement);
        if (document.activeElement === this.newMessageRef.current) {
            this.saveSelection();
        }
    };

    componentDidMount() {
        document.addEventListener('selectionchange', this.selectionChangeListener, true);

        AppStore.on('clientUpdateChatId', this.onClientUpdateChatId);
        AppStore.on('clientUpdateEditMessage', this.onClientUpdateEditMessage);
        AppStore.on('clientUpdateFocusWindow', this.onClientUpdateFocusWindow);
        ChatStore.on('updateChatDraftMessage', this.onUpdateChatDraftMessage);
        FileStore.on('clientUpdateSendFiles', this.onClientUpdateSendFiles);
        MessageStore.on('clientUpdateReply', this.onClientUpdateReply);
        MessageStore.on('updateDeleteMessages', this.onUpdateDeleteMessages);
        StickerStore.on('clientUpdateStickerSend', this.onClientUpdateStickerSend);

        this.loadDraft();
    }

    componentWillUnmount() {
        this.saveDraft();

        AppStore.off('clientUpdateChatId', this.onClientUpdateChatId);
        AppStore.off('clientUpdateEditMessage', this.onClientUpdateEditMessage);
        AppStore.off('clientUpdateFocusWindow', this.onClientUpdateFocusWindow);
        ChatStore.off('updateChatDraftMessage', this.onUpdateChatDraftMessage);
        FileStore.off('clientUpdateSendFiles', this.onClientUpdateSendFiles);
        MessageStore.off('clientUpdateReply', this.onClientUpdateReply);
        MessageStore.off('updateDeleteMessages', this.onUpdateDeleteMessages);
        StickerStore.off('clientUpdateStickerSend', this.onClientUpdateStickerSend);

        document.removeEventListener('selectionchange', this.selectionChangeListener, true);
    }

    onClientUpdateSendFiles = update => {
        const { files } = update;
        if (!files) return;

        this.handleSendFiles(Array.from(files));
    };

    onUpdateDeleteMessages = update => {
        const { chatId, editMessageId } = this.state;
        const { chat_id, message_ids, is_permanent } = update;

        if (!editMessageId) return;
        if (!is_permanent) return;
        if (chatId !== chat_id) return;
        if (message_ids.indexOf(editMessageId) === -1) return;

        this.handleCancel();
    };

    onClientUpdateEditMessage = update => {
        const { chatId, messageId } = update;
        if (this.state.chatId !== chatId) return;

        if (!messageId) {
            this.restoreDraftAndSelection();
        } else {
            this.saveDraftAndSelection();
        }

        const openEditMedia = messageId !== 0 && isEditedMedia(chatId, messageId);
        this.setState(
            {
                editMessageId: messageId,
                openEditMedia
            },
            () => {
                if (!this.state.openEditMedia) {
                    this.setEditMessage();
                    this.handleInput();
                    setTimeout(() => {
                        this.focusInput();
                    }, 0);
                }
            }
        );
    };

    restoreDraftAndSelection() {
        const element = this.newMessageRef.current;
        if (!element) return;

        const { beforeEditText } = this;

        if (beforeEditText) {
            element.innerHTML = beforeEditText.innerHTML;

            if (!beforeEditText.range) {
                this.focusInput();
                return;
            }

            const selection = document.getSelection();
            selection.removeAllRanges();
            selection.addRange(beforeEditText.range);

            element.focus();
        } else {
            element.innerHTML = null;
            this.focusInput();
        }

        this.handleInput();
    }

    saveDraftAndSelection() {
        const element = this.newMessageRef.current;
        if (!element) return;

        this.beforeEditText = {
            innerHTML: element.innerHTML,
            range: this.range
        };
    }

    onClientUpdateFocusWindow = update => {
        const { focused } = update;
        if (focused) return;

        this.saveDraft();
    };

    onUpdateChatDraftMessage = update => {
        const { chat_id } = update;
        const { chatId } = this.state;

        if (chatId !== chat_id) return;

        this.loadDraft();
    };

    onClientUpdateStickerSend = update => {
        const { sticker: item } = update;
        if (!item) return;

        const { sticker, thumbnail, width, height } = item;
        if (!sticker) return;

        const element = this.newMessageRef.current;
        if (!element) return;

        element.innerText = null;

        this.restoreSelection();

        const content = {
            '@type': 'inputMessageSticker',
            sticker: {
                '@type': 'inputFileId',
                id: sticker.id
            },
            width,
            height
        };

        if (thumbnail) {
            const { width: thumbnailWidth, height: thumbnailHeight, photo } = thumbnail;

            content.thumbnail = {
                thumbnail: {
                    '@type': 'inputFileId',
                    id: photo.id
                },
                width: thumbnailWidth,
                height: thumbnailHeight
            };
        }

        this.sendMessage(content, false, result => {});

        TdLibController.clientUpdate({
            '@type': 'clientUpdateLocalStickersHint',
            hint: null
        });
    };

    onClientUpdateReply = update => {
        const { chatId: currentChatId } = this.state;
        const { chatId, messageId } = update;

        if (currentChatId !== chatId) {
            return;
        }

        this.setState({ replyToMessageId: messageId });

        if (messageId) {
            this.setInputFocus();
        }
    };

    onClientUpdateChatId = update => {
        const { chatId } = this.state;
        if (chatId === update.nextChatId) return;

        this.saveDraft();
        this.beforeEditText = null;
        this.setState(
            {
                chatId: update.nextChatId,
                replyToMessageId: getChatDraftReplyToMessageId(update.nextChatId),
                editMessageId: 0,
                openEditUrl: false
            },
            () => {
                this.loadDraft();
            }
        );
    };

    setDraft = () => {
        const { chatId } = this.state;

        const element = this.newMessageRef.current;

        const formattedText = getChatDraft(chatId);
        if (formattedText) {
            this.setFormattedText(formattedText);
            this.setState({
                replyToMessageId: getChatDraftReplyToMessageId(chatId)
            });
        } else {
            element.innerText = null;
        }
    };

    setEditMessage() {
        const { chatId, editMessageId } = this.state;

        const message = MessageStore.get(chatId, editMessageId);
        if (!message) return;

        const { content } = message;
        if (!content) return;

        const { text, caption } = content;
        if (!text && !caption) return;

        const element = this.newMessageRef.current;

        if (text) {
            this.setFormattedText(text);
        } else if (caption) {
            this.setFormattedText(caption);
        } else {
            element.innerText = null;
        }
    }

    setFormattedText(formattedText) {
        const { t } = this.props;
        const element = this.newMessageRef.current;

        if (!formattedText) {
            element.innerText = null;
            return;
        }

        const { text, entities } = formattedText;
        try {
            const nodes = getNodes(text, entities, t);
            element.innerHTML = null;
            nodes.forEach(x => {
                element.appendChild(x);
            });
        } catch (e) {
            element.innerText = text;
        }
    }

    setInputFocus = () => {
        setTimeout(() => {
            const element = this.newMessageRef.current;

            focusInput(element);
        }, 100);
    };

    setChatDraftMessage = chatDraftMessage => {
        if (!chatDraftMessage) return;

        const { chatId, draftMessage } = chatDraftMessage;
        if (!chatId) return;

        TdLibController.send({
            '@type': 'setChatDraftMessage',
            chat_id: chatId,
            draft_message: draftMessage
        });
    };

    getDraftMessage = (chatId, replyToMessageId, innerHTML) => {
        const chat = ChatStore.get(chatId);
        if (!chat) return;

        const { draft_message } = chat;
        const { text, entities } = getEntities(innerHTML);
        const draftMessage =
            (text && text.length > 0) || entities.length > 0
                ? {
                      '@type': 'draftMessage',
                      reply_to_message_id: replyToMessageId,
                      input_message_text: {
                          '@type': 'inputMessageText',
                          text: {
                              '@type': 'formattedText',
                              text,
                              entities
                          },
                          disable_web_page_preview: false,
                          clear_draft: false
                      }
                  }
                : null;

        if (draftEquals(draft_message, draftMessage)) {
            return null;
        }

        return { chatId, draftMessage };
    };

    handleSubmit = () => {
        const { chatId, editMessageId } = this.state;
        const element = this.newMessageRef.current;
        if (!element) return;

        let { innerHTML } = element;

        element.innerText = null;
        this.handleInput();

        editMessage(chatId, 0);

        if (!innerHTML) return;
        if (!innerHTML.trim()) return;

        const { text, entities } = getEntities(innerHTML);

        const formattedText = {
            '@type': 'formattedText',
            text,
            entities
        };
        const inputContent = {
            '@type': 'inputMessageText',
            text: formattedText,
            disable_web_page_preview: false,
            clear_draft: true
        };

        if (editMessageId) {
            const editedMessage = MessageStore.get(chatId, editMessageId);
            if (!editedMessage) return;

            const { content } = editedMessage;
            if (!content) return;

            const { text, caption } = content;
            if (text) {
                this.editMessageText(inputContent, result => {});
            } else if (caption) {
                this.editMessageCaption(formattedText);
            }
        } else {
            this.sendMessage(inputContent, false, result => {});
        }
    };

    handleAttachPoll = () => {
        TdLibController.clientUpdate({
            '@type': 'clientUpdateNewPoll'
        });
    };

    handleAttachPhoto = () => {
        if (!this.attachPhotoRef) return;

        this.attachPhotoRef.current.click();
    };

    async getNewItem(file, sendAsFile) {
        if (!file) return null;

        const caption = this.newMessageRef.current.innerHTML;
        if (caption) {
            this.newMessageRef.current.innerHTML = null;
            this.handleInput();
        }

        const media = sendAsFile
            ? await getMediaPhotoFromFile(file)
            : await getMediaDocumentFromFile(file);

        return {
            file,
            media,
            caption
        }
    };

    handleAttachPhotoComplete = async () => {
        const { files } = this.attachPhotoRef.current;
        if (files.length === 0) return;

        if (files.length === 1) {
            const [ newFile, ...rest ] = Array.from(files);
            if (!newFile) return;

            const newItem = await this.getNewItem(newFile, true);

            this.setState({
                openEditMedia: true,
                newItem
            });
        } else {
            Array.from(files).forEach(async file => {
                const [width, height] = await readImageSize(file);

                const content = {
                    '@type': 'inputMessagePhoto',
                    photo: { '@type': 'inputFileBlob', name: file.name, size: file.size, data: file },
                    width,
                    height
                };

                this.handleSendPhoto(content, file);
            });
        }

        this.attachPhotoRef.current.value = '';
    };

    handleAttachDocument = () => {
        if (!this.attachDocumentRef) return;

        this.attachDocumentRef.current.click();
    };

    handleAttachDocumentComplete = async () => {
        const { files } = this.attachDocumentRef.current;
        if (files.length === 0) return;

        if (files.length === 1) {
            const [ newFile, ...rest ] = Array.from(files);
            if (!newFile) return;

            const newItem = await this.getNewItem(newFile, false);

            this.setState({
                openEditMedia: true,
                newItem
            });
        } else {
            Array.from(files).forEach(file => {
                const content = {
                    '@type': 'inputMessageDocument',
                    document: { '@type': 'inputFileBlob', name: file.name, size: file.size, data: file }
                };

                this.handleSendDocument(content, file);
            });
        }

        this.attachDocumentRef.current.value = '';
    };

    setTyping() {
        const { chatId, editMessageId } = this.state;
        const chat = ChatStore.get(chatId);
        if (!chat) return;

        const element = this.newMessageRef.current;
        if (!element) return;

        const { innerHTML } = element;
        if (innerHTML === '<br>' || innerHTML === '<div><br></div>') {
            element.innerHTML = null;
        }
        const { innerText } = element;

        if (!innerText) return;
        if (isMeChat(chatId)) return;
        if (editMessageId) return;

        const typingManager = chat.OutputTypingManager || (chat.OutputTypingManager = new OutputTypingManager(chat.id));
        typingManager.setTyping({ '@type': 'chatActionTyping' });
    }

    setHints() {
        const { editMessageId } = this.state;
        const innerText = this.newMessageRef.current.innerText;
        if (!innerText || innerText.length > 11 || editMessageId) {
            const { hint } = StickerStore;
            if (hint) {
                TdLibController.clientUpdate({
                    '@type': 'clientUpdateLocalStickersHint',
                    hint: null
                });
            }

            return;
        }

        const t0 = performance.now();
        const regex = emojiRegex();
        let match = regex.exec(innerText);
        const t1 = performance.now();
        // console.log('Matched ' + (t1 - t0) + 'ms', match);
        if (!match || innerText !== match[0]) {
            const { hint } = StickerStore;
            if (hint) {
                TdLibController.clientUpdate({
                    '@type': 'clientUpdateLocalStickersHint',
                    hint: null
                });
            }

            return;
        }

        const timestamp = Date.now();
        TdLibController.send({
            '@type': 'getStickers',
            emoji: match[0],
            limit: 100
        }).then(stickers => {
            TdLibController.clientUpdate({
                '@type': 'clientUpdateLocalStickersHint',
                hint: {
                    timestamp,
                    emoji: match[0],
                    stickers
                }
            });
        });

        TdLibController.send({
            '@type': 'searchStickers',
            emoji: match[0],
            limit: 100
        }).then(stickers => {
            TdLibController.clientUpdate({
                '@type': 'clientUpdateRemoteStickersHint',
                hint: {
                    timestamp,
                    emoji: match[0],
                    stickers
                }
            });
        });
    }

    handleClear = () => {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);
    };

    handleBold = () => {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);

        document.execCommand('bold', false, null);
    };

    handleItalic = () => {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);

        document.execCommand('italic', false, null);
    };

    handleMono = () => {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);

        let text = '';
        const { selection } = this;
        if (selection && !selection.isCollapsed) {
            text = selection.toString();
        }

        if (!text) return;
        text = `<code>${text}</code>`;
        document.execCommand('removeFormat', false, null);
        document.execCommand('insertHTML', false, text);
    };

    handleUnderline = () => {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);

        document.execCommand('underline', false, null);
    };

    handleStrikeThrough = () => {
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);

        document.execCommand('strikeThrough', false, null);
    };

    handleUrl = () => {
        this.openEditUrlDialog();
    };

    handleCancel = () => {
        const { chatId, editMessageId, replyToMessageId } = this.state;
        if (editMessageId) {
            editMessage(chatId, 0);
        } else if (replyToMessageId) {
            replyMessage(chatId, 0);
        }
    };

    handleKeyDown = event => {
        const { altKey, ctrlKey, keyCode, metaKey, repeat, shiftKey } = event;

        // console.log('[k] handleKeyDown', altKey, ctrlKey, keyCode, metaKey, repeat, shiftKey);

        switch (keyCode) {
            // enter
            case 13: {
                if (!altKey && !ctrlKey && !metaKey && !shiftKey) {
                    if (!repeat) this.handleSubmit();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            // esc
            case 27: {
                if (!altKey && !ctrlKey && !metaKey && !shiftKey) {
                    if (!repeat) this.handleCancel();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            // arrow up
            case 38: {
                if (!repeat && !altKey && !ctrlKey && !metaKey && !shiftKey) {
                    const element = this.newMessageRef.current;
                    if (element && !element.innerText) {
                        const { editMessageId } = this.state;
                        if (editMessageId) return;

                        TdLibController.clientUpdate({
                            '@type': 'clientUpdateTryEditMessage'
                        });

                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
                break;
            }
            // cmd + b
            case 66: {
                if (!altKey && (ctrlKey || metaKey) && !shiftKey) {
                    if (!repeat) this.handleBold();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            // cmd + i
            case 73: {
                if (!altKey && (ctrlKey || metaKey) && !shiftKey) {
                    if (!repeat) this.handleItalic();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            case 75: {
                // cmd + k
                if (!altKey && (ctrlKey || metaKey) && !shiftKey) {
                    if (!repeat) this.handleUrl();

                    event.preventDefault();
                    event.stopPropagation();
                }
                // alt + cmd + k
                else if (altKey && (ctrlKey || metaKey) && !shiftKey) {
                    if (!repeat) this.handleMono();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
            // alt + cmd + n
            case 192: {
                if (altKey && (ctrlKey || metaKey) && !shiftKey) {
                    if (!repeat) this.handleClear();

                    event.preventDefault();
                    event.stopPropagation();
                }
                break;
            }
        }
    };

    handleSendPhoto = (content, file) => {
        if (!content) return;

        this.sendMessage(content, true, result => {
            const cachedMessage = MessageStore.get(result.chat_id, result.id);
            if (cachedMessage != null) {
                this.handleSendingMessage(cachedMessage, file);
            }

            FileStore.uploadFile(result.content.photo.sizes[0].photo.id, result);
        });
    };

    handleSendPoll = poll => {
        this.sendMessage(poll, true, () => {});
    };

    handleSendDocument = (content, file) => {
        if (!content) return;

        this.sendMessage(content, true, result => FileStore.uploadFile(result.content.document.document.id, result));
    };

    handleSendAudio = (content, file) => {
        if (!content) return;

        this.sendMessage(content, true, result => FileStore.uploadFile(result.content.audio.audio.id, result));
    };

    async handleSendFiles(files) {
        if (!files) return;
        if (!files.length) return;

        if (files.length === 1) {
            const newItem = await this.getNewItem(files[0], files[0].type.startsWith('image'));
            if (!newItem) return;

            this.setState({
                openEditMedia: true,
                newItem
            });
        } else {
            this.setState({ files });
        }
    }

    handlePaste = async event => {
        const { items } = event.clipboardData || event.originalEvent.clipboardData;
        if (!items) return;

        const files = [];
        Array.from(items).forEach(item => {
            if (item.kind.indexOf('file') === 0) {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        });

        if (files.length > 0) {
            event.preventDefault();

            this.handleSendFiles(files);
            return;
        }

        const plainText = event.clipboardData.getData('text/plain');
        if (plainText) {
            event.preventDefault();
            document.execCommand('insertText', false, plainText);
            return;
        }
    };

    handlePasteConfirm = () => {
        const { files } = this.state;
        if (!files) return;
        if (!files.length) return;

        files.forEach(file => {
            const content = {
                '@type': 'inputMessageDocument',
                document: { '@type': 'inputFileBlob', name: file.name, data: file }
            };

            this.handleSendDocument(content, file);
        });

        this.handlePasteCancel();
    };

    handlePasteCancel = () => {
        this.setState({ files: null });
    };

    handleUpdateDraftConfirm = () => {
        const { newDraft } = this.state;
        if (!newDraft) return;

        this.loadDraft();
        this.handleUpdateDraftCancel();
    };

    handleUpdateDraftCancel = () => {
        this.setState({ newDraft: null });
    };

    handleSendingMessage = (message, blob) => {
        if (!message) return;

        const { sending_state, content, chat_id, id } = message;
        if (!sending_state) return;
        if (sending_state['@type'] !== 'messageSendingStatePending') return;
        if (content['@type'] !== 'messagePhoto') return;

        const { photo } = content;
        if (!photo) return;

        const size = getSize(photo.sizes, PHOTO_SIZE);
        if (!size) return;

        const { photo: file } = size;
        if (!file) return;
        if (file.blob) return;

        file.blob = blob;
        FileStore.updatePhotoBlob(chat_id, id, file.id);
    };

    editMessageMedia(content) {
        const { chatId, editMessageId } = this.state;
        // console.log('[em] editMessageMedia start', chatId, editMessageId, content);

        if (!chatId) return;
        if (!editMessageId) return;
        if (!content) return;

        TdLibController.send({
            '@type': 'editMessageMedia',
            chat_id: chatId,
            message_id: editMessageId,
            input_message_content: content
        });
    }

    editMessageCaption(caption) {
        const { chatId, editMessageId } = this.state;

        if (!chatId) return;
        if (!editMessageId) return;
        if (!caption) return;

        TdLibController.send({
            '@type': 'editMessageCaption',
            chat_id: chatId,
            message_id: editMessageId,
            caption
        });
    }

    async editMessageText(content, callback) {
        const { chatId, editMessageId } = this.state;

        if (!chatId) return;
        if (!editMessageId) return;
        if (!content) return;

        try {
            const result = await TdLibController.send({
                '@type': 'editMessageText',
                chat_id: chatId,
                message_id: editMessageId,
                input_message_content: content
            });

            callback(result);
        } finally {
        }
    }

    sendMessage = async (content, clearDraft, callback) => {
        const { chatId, replyToMessageId } = this.state;

        if (!chatId) return;
        if (!content) return;

        try {
            await AppStore.invokeScheduledAction(`clientUpdateClearHistory chatId=${chatId}`);

            const result = await TdLibController.send({
                '@type': 'sendMessage',
                chat_id: chatId,
                reply_to_message_id: replyToMessageId,
                input_message_content: content
            });

            this.setState({ replyToMessageId: 0 }, () => {
                if (clearDraft) {
                    this.saveDraft();
                }
            });
            //MessageStore.set(result);

            TdLibController.send({
                '@type': 'viewMessages',
                chat_id: chatId,
                message_ids: [result.id]
            });

            callback(result);
        } catch (error) {
            alert('sendMessage error ' + JSON.stringify(error));
        }
    };

    handleEmojiSelect = emoji => {
        if (!emoji) return;

        this.restoreSelection();
        document.execCommand('insertText', false, emoji.native);
        this.handleInput();
    };

    handleInput = async event => {
        this.setTyping();
        this.setHints();
    };

    openEditUrlDialog = () => {
        let defaultText = '';
        let defaultUrl = '';

        const { selection, range } = this;
        if (range) {
            let { startContainer, endContainer } = range;
            if (startContainer === endContainer) {
                const { parentElement } = startContainer;
                if (parentElement && parentElement.nodeName === 'A') {
                    defaultText = parentElement.innerText;
                    defaultUrl = parentElement.href;
                }
            }
        }

        if (!defaultText && selection && !selection.isCollapsed) {
            defaultText = selection.toString();
        }

        this.setState({
            openEditUrl: true,
            defaultUrl,
            defaultText
        });
    };

    closeEditUrlDialog = () => {
        this.setState(
            {
                openEditUrl: false
            },
            () => {
                this.restoreSelection();
            }
        );
    };

    saveSelection() {
        this.selection = document.getSelection();
        if (!this.selection) return;
        if (!this.selection.rangeCount) return;

        this.range = this.selection.getRangeAt(0);
    }

    restoreSelection() {
        const { range } = this;

        if (!range) {
            this.focusInput();
            return;
        }

        const selection = document.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        this.newMessageRef.current.focus();
    }

    focusInput = () => {
        const element = this.newMessageRef.current;
        if (!element) return;
        if (!element.childNodes.length) {
            element.focus();
            return;
        }

        const lastTextNode = findLastTextNode(element);
        if (!lastTextNode) {
            return;
        }

        const range = document.createRange();
        range.setStart(lastTextNode, lastTextNode.length);
        range.collapse(true);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        element.focus();
    };

    handleCancelEditUrl = () => {
        this.closeEditUrlDialog();
    };

    handleDoneEditUrl = (text, url) => {
        this.closeEditUrlDialog();
        setTimeout(() => {
            // edit current link node
            const { range } = this;
            if (range) {
                const { startContainer, endContainer } = range;
                if (startContainer && startContainer === endContainer) {
                    const { parentNode } = startContainer;
                    if (parentNode && parentNode.nodeName === 'A') {
                        parentNode.href = url;
                        parentNode.title = url;
                        parentNode.innerText = text;

                        // move cursor to end of editing node
                        const { lastChild } = parentNode;
                        if (lastChild) {
                            const range = document.createRange();
                            range.setStart(lastChild, lastChild.textContent.length);
                            range.setEnd(lastChild, lastChild.textContent.length);

                            const selection = document.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                        return;
                    }
                }
            }

            // replace selected text with new link node
            const link = `<a href=${url} title=${url} rel='noopener noreferrer' target='_blank'>${text}</a>`;
            document.execCommand('removeFormat', false, null);
            document.execCommand('insertHTML', false, link);
        }, 0);
    };

    handleCancelEditMedia = () => {
        this.closeEditMediaDialog();
    };

    handleEditMedia = (caption, content) => {
        if (content) {
            this.editMessageMedia(content);
            return;
        }

        this.editMessageCaption(caption);
    };

    handleSendMedia = (content, file) => {
        this.closeEditMediaDialog(false);

        switch (content['@type']) {
            case 'inputMessageAudio': {
                this.handleSendAudio(content, file);
                break;
            }
            case 'inputMessagePhoto': {
                this.handleSendPhoto(content, file);
                break;
            }
            case 'inputMessageDocument': {
                this.handleSendDocument(content, file);
                break;
            }
        }
    };

    closeEditMediaDialog(cancel = true) {
        const { newItem } = this.state;

        this.setState(
            {
                openEditMedia: false,
                newItem: null
            },
            () => {
                if (cancel && newItem && newItem.caption) {
                    this.newMessageRef.current.innerHTML = newItem.caption;
                    this.focusInput();
                    this.handleInput();
                } else {
                    this.restoreSelection();
                }
            }
        );
    }

    handleHeaderClick = () => {
        setTimeout(() => this.restoreSelection(), 0);
    };

    render() {
        const { t } = this.props;
        const {
            chatId,
            editMessageId,
            newItem,
            replyToMessageId,
            files,
            newDraft,
            defaultText,
            defaultUrl,
            openEditUrl,
            openEditMedia
        } = this.state;

        const isMediaEditing = editMessageId > 0 && !isTextMessage(chatId, editMessageId);

        return (
            <div className='inputbox-background'>
                <div className='inputbox'>
                    <div className='inputbox-bubble'>
                        <InputBoxHeader
                            chatId={chatId}
                            messageId={replyToMessageId}
                            editMessageId={openEditMedia ? 0 : editMessageId}
                            onClick={this.handleHeaderClick}
                        />
                        <div className='inputbox-wrapper'>
                            <div className='inputbox-left-column'>
                                <React.Suspense
                                    fallback={
                                        <IconButton className='inputbox-icon-button' aria-label='Emoticon'>
                                            <InsertEmoticonIcon />
                                        </IconButton>
                                    }>
                                    <EmojiPickerButton onSelect={this.handleEmojiSelect} />
                                </React.Suspense>
                            </div>
                            <div className='inputbox-middle-column'>
                                <div
                                    id='inputbox-message'
                                    ref={this.newMessageRef}
                                    placeholder={isMediaEditing ? t('Caption') : t('Message')}
                                    contentEditable
                                    suppressContentEditableWarning
                                    onKeyDown={this.handleKeyDown}
                                    onPaste={this.handlePaste}
                                    onInput={this.handleInput}
                                />
                            </div>
                            <div className='inputbox-right-column'>
                                <input
                                    ref={this.attachDocumentRef}
                                    className='inputbox-attach-button'
                                    type='file'
                                    multiple='multiple'
                                    onChange={this.handleAttachDocumentComplete}
                                />
                                <input
                                    ref={this.attachPhotoRef}
                                    className='inputbox-attach-button'
                                    type='file'
                                    multiple='multiple'
                                    accept='image/*'
                                    onChange={this.handleAttachPhotoComplete}
                                />
                                {!Boolean(editMessageId) && (
                                    <AttachButton
                                        chatId={chatId}
                                        onAttachPhoto={this.handleAttachPhoto}
                                        onAttachDocument={this.handleAttachDocument}
                                        onAttachPoll={this.handleAttachPoll}
                                    />
                                )}

                                {/*<IconButton>*/}
                                {/*<KeyboardVoiceIcon />*/}
                                {/*</IconButton>*/}
                            </div>
                        </div>
                    </div>
                    <div className='inputbox-send-button-background'>
                        <IconButton
                            className='inputbox-send-button'
                            aria-label='Send'
                            size='small'
                            onClick={this.handleSubmit}>
                            {editMessageId ? <DoneIcon /> : <SendIcon />}
                        </IconButton>
                    </div>
                </div>
                {!isPrivateChat(chatId) && <CreatePollDialog onSend={this.handleSendPoll} />}
                <PasteFilesDialog files={files} onConfirm={this.handlePasteConfirm} onCancel={this.handlePasteCancel} />
                {/*<UpdateDraftDialog draft={newDraft} onConfirm={this.handleUpdateDraftConfirm} onCancel={this.handleUpdateDraftCancel}/>*/}
                <EditUrlDialog
                    open={openEditUrl}
                    defaultText={defaultText}
                    defaultUrl={defaultUrl}
                    onDone={this.handleDoneEditUrl}
                    onCancel={this.handleCancelEditUrl}
                />
                <EditMediaDialog
                    open={openEditMedia}
                    chatId={chatId}
                    messageId={editMessageId}
                    newItem={newItem}
                    onEdit={this.handleEditMedia}
                    onSend={this.handleSendMedia}
                    onCancel={this.handleCancelEditMedia}
                />
            </div>
        );
    }
}

export default withTranslation()(InputBox);
