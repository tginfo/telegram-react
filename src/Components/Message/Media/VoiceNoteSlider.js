/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Slider from '@material-ui/core/Slider';
import { PLAYER_PROGRESS_TIMEOUT_MS } from '../../../Constants';
import PlayerStore from '../../../Stores/PlayerStore';
import TdLibController from '../../../Controllers/TdLibController';
import './VoiceNoteSlider.css';

class VoiceNoteSlider extends React.Component {
    constructor(props) {
        super(props);

        const { message, time } = PlayerStore;
        const { chatId, messageId, duration } = this.props;

        const active = message && message.chat_id === chatId && message.id === messageId;
        const currentTime = active && time ? time.currentTime : 0;
        const audioDuration = active && time && time.duration ? time.duration : duration;

        this.state = {
            active: active,
            currentTime: currentTime,
            duration: audioDuration,
            value: this.getValue(currentTime, audioDuration, active)
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { active, value } = this.state;

        if (nextState.value !== value) {
            return true;
        }

        if (nextState.active !== active) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        PlayerStore.on('clientUpdateMediaActive', this.onClientUpdateMediaActive);
        PlayerStore.on('clientUpdateMediaTime', this.onClientUpdateMediaTime);
        PlayerStore.on('clientUpdateMediaEnd', this.onClientUpdateMediaEnd);
    }

    componentWillUnmount() {
        PlayerStore.off('clientUpdateMediaActive', this.onClientUpdateMediaActive);
        PlayerStore.off('clientUpdateMediaTime', this.onClientUpdateMediaTime);
        PlayerStore.off('clientUpdateMediaEnd', this.onClientUpdateMediaEnd);
    }

    reset = () => {
        const { duration } = this.props;
        const { value } = this.state;

        if (value === 1) {
            this.setState({
                active: false,
                currentTime: 0
            });

            setTimeout(() => {
                const { currentTime } = this.state;
                if (!currentTime) {
                    this.setState({
                        value: this.getValue(0, duration, false)
                    });
                }
            }, PLAYER_PROGRESS_TIMEOUT_MS);
        } else {
            this.setState({
                active: false,
                currentTime: 0,
                value: this.getValue(0, duration, false)
            });
        }
    };

    onClientUpdateMediaEnd = update => {
        const { chatId, messageId } = this.props;

        if (chatId === update.chatId && messageId === update.messageId) {
            this.reset();
        }
    };

    onClientUpdateMediaTime = update => {
        const { chatId, messageId, duration } = this.props;
        const { active, dragging } = this.state;

        if (chatId !== update.chatId) return;
        if (messageId !== update.messageId) return;

        const playerDuration = update.duration >= 0 && update.duration < Infinity ? update.duration : duration;
        const value = this.getValue(update.currentTime, playerDuration, active);

        if (dragging) {
            this.setState({
                currentTime: update.currentTime,
                duration: playerDuration
            });
        } else {
            this.setState({
                currentTime: update.currentTime,
                duration: playerDuration,
                value
            });
        }
    };

    onClientUpdateMediaActive = update => {
        const { chatId, messageId, duration } = this.props;
        const { active, currentTime, dragging } = this.state;

        if (chatId === update.chatId && messageId === update.messageId) {
            const playerDuration = update.duration >= 0 && update.duration < Infinity ? update.duration : duration;
            let value = this.state.value;
            if (!dragging) {
                value = this.getValue(active ? currentTime : 0, playerDuration, true);
            }

            this.setState({
                active: true,
                currentTime: active ? currentTime : 0,
                value
            });
        } else if (active) {
            this.reset();
        }
    };

    getValue = (currentTime, duration, active) => {
        return active ? currentTime / duration : 0;
    };

    handleMouseDown = event => {
        event.stopPropagation();

        this.setState({
            dragging: true
        });
    };

    handleChangeCommitted = () => {
        const { chatId, messageId } = this.props;
        const { value, active } = this.state;
        if (!active) return;

        TdLibController.clientUpdate({
            '@type': 'clientUpdateMediaSeek',
            chatId,
            messageId,
            value
        });

        this.setState({
            dragging: false
        });
    };

    handleChange = (event, value) => {
        const { chatId, messageId } = this.props;
        const { active, dragging } = this.state;
        if (!active) return;

        if (dragging) {
            TdLibController.clientUpdate({
                '@type': 'clientUpdateMediaSeeking',
                chatId,
                messageId,
                value
            });
        }

        this.setState({
            value
        });
    };

    render() {
        const { className, style } = this.props;
        const { value } = this.state;

        return (
            <div className={classNames('voice-note-slider', className)} style={style}>
                <Slider
                    className='voice-note-slider-component'
                    classes={{
                        track: 'voice-note-slider-track',
                        thumb: 'voice-note-slider-thumb',
                        active: 'voice-note-slider-active'
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    value={value}
                    onChange={this.handleChange}
                    onChangeCommitted={this.handleChangeCommitted}
                    onMouseDown={this.handleMouseDown}
                />
            </div>
        );
    }
}

VoiceNoteSlider.propTypes = {
    chatId: PropTypes.number.isRequired,
    messageId: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired
};

export default VoiceNoteSlider;
