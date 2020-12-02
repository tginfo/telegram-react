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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { modalManager } from '../../Utils/Modal';
import './UnpinMessageDialog.css';

class UnpinMessageDialog extends React.Component {

    render() {
        const { messageId, onClose, t } = this.props;

        const text = messageId ? t('UnpinMessageAlert') : t('UnpinAllMessagesAlert');

        return (
            <Dialog
                manager={modalManager}
                transitionDuration={0}
                open={true}
                onClose={() => onClose(false)}
                aria-labelledby='dialog-title'>
                <DialogTitle id='dialog-title'>{t('Confirm')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {text}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => onClose(false)} color='primary'>
                        {t('Cancel')}
                    </Button>
                    <Button onClick={() => onClose(true)} color='primary'>
                        {t('Ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

UnpinMessageDialog.propTypes = {
    chatId: PropTypes.number,
    messageId: PropTypes.number,
    onClose: PropTypes.func
};

export default withTranslation()(UnpinMessageDialog);