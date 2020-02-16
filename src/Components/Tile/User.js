/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import UserTile from './UserTile';
import UserStatus from './UserStatus';
import { getUserFullName } from '../../Utils/User';
import './User.css';

class User extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.userId !== this.props.userId;
    }

    handleClick = () => {
        const { userId, onSelect } = this.props;
        if (!onSelect) return;

        onSelect(userId);
    };

    render() {
        const { userId, t } = this.props;

        const fullName = getUserFullName(userId, null, t);

        return (
            <div className='user' onClick={this.handleClick}>
                <div className='user-wrapper'>
                    <UserTile userId={userId} />
                    <div className='dialog-inner-wrapper'>
                        <div className='tile-first-row'>
                            <div className='dialog-title'>{fullName}</div>
                        </div>
                        <div className='tile-second-row'>
                            <UserStatus userId={userId} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

User.propTypes = {
    userId: PropTypes.number.isRequired,
    onSelect: PropTypes.func
};

export default withTranslation()(User);
