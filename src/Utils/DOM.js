/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function findLastTextNode(element) {
    if (element.nodeType === Node.TEXT_NODE) {
        return element;
    }

    for (let i = element.childNodes.length - 1; i >= 0; i--) {
        const textNode = findLastTextNode(element.childNodes[i]);
        if (textNode) {
            return textNode;
        }
    }

    return null;
}

export function focusInput(element) {
    if (!element) return;

    const textNode = findLastTextNode(element);
    if (textNode) {
        const range = document.createRange();
        range.setStart(textNode, textNode.length);
        range.collapse(true);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    element.focus();
}

export function scrollTop(element, behavior = 'smooth') {
    if (!element) return;
    if (element.scrollTop === 0) return;

    element.scrollTop = Math.min(element.scrollTop, 50);
    setTimeout(() => {
        element.scrollTo({ top: 0, behavior });
    }, 1);
}

export function scrollBottom(element, behavior = 'smooth') {
    if (!element) return;
    if (element.scrollTop === element.scrollHeight - element.offsetHeight) return;

    element.scrollTop = Math.max(element.scrollTop, element.scrollHeight - element.offsetHeight - 50);
    setTimeout(() => {
        element.scrollTo({ top: element.scrollHeight - element.offsetHeight, behavior });
    }, 1);
}
