/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import EventEmitter from './EventEmitter';
import { STORAGE_AUTH_KEY, STORAGE_AUTH_TEST_KEY } from '../Constants';
import TdLibController from '../Controllers/TdLibController';

class AuthorizationStore extends EventEmitter {
    constructor() {
        super();

        const { useTestDC } = TdLibController.parameters;
        this.authKey = useTestDC? STORAGE_AUTH_TEST_KEY : STORAGE_AUTH_KEY;

        this.reset();
        this.load();

        this.addTdLibListener();
    }

    load() {
        try {
            const value = localStorage.getItem(this.authKey);
            if (value) {
                this.current = JSON.parse(value);
            } else {
                this.current = null;
            }
        } catch {}
    }

    save(state) {
        if (state) {
            localStorage.setItem(this.authKey, JSON.stringify(state));
        } else {
            localStorage.removeItem(this.authKey);
        }
    }

    reset = () => {
        this.current = null;
    };

    onUpdate = update => {
        switch (update['@type']) {
            case 'updateAuthorizationState': {
                const { authorization_state } = update;

                this.current = authorization_state;
                this.save(authorization_state);

                if (authorization_state['@type'] !== 'authorizationStateReady') {
                    this.setCountryCode();
                }

                this.emit(update['@type'], update);
                break;
            }
            default:
                break;
        }
    };

    setCountryCode = async () => {
        const { code } = this;
        if (code) return;

        this.code = await TdLibController.send({ '@type': 'getCountryCode' });
        TdLibController.clientUpdate({ '@type': 'clientUpdateCountryCode', code: this.code });
    };

    onClientUpdate = update => {
        switch (update['@type']) {
            case 'clientUpdateCountryCode': {
                this.emit(update['@type'], update);
                break;
            }
            case 'clientUpdateMonkeyIdle': {
                this.emit(update['@type'], update);
                break;
            }
            case 'clientUpdateMonkeyTracking': {
                this.emit(update['@type'], update);
                break;
            }
            case 'clientUpdateMonkeyClose': {
                this.emit(update['@type'], update);
                break;
            }
            case 'clientUpdateMonkeyPeek': {
                this.emit(update['@type'], update);
                break;
            }
            default:
                break;
        }
    };

    addTdLibListener = () => {
        TdLibController.on('update', this.onUpdate);
        TdLibController.on('clientUpdate', this.onClientUpdate);
    };

    removeTdLibListener = () => {
        TdLibController.off('update', this.onUpdate);
        TdLibController.off('clientUpdate', this.onClientUpdate);
    };
}

const store = new AuthorizationStore();
window.authorization = store;
export default store;
