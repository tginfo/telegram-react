/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

window.RLottie = (function () {
    let rlottie = {}, apiInitStarted = false, apiInited = false, initCallbacks = [];
    let deviceRatio = window.devicePixelRatio || 1;
    let rlottieWorkers = [], curWorkerNum = 0;

    let startTime = +(new Date());
    function dT() {
        return '[' + ((+(new Date()) - startTime)/ 1000.0) + '] ';
    }

    rlottie.Api = {};
    rlottie.players = Object.create(null);
    rlottie.urls = Object.create(null);
    rlottie.events = Object.create(null);
    rlottie.frames = new Map();
    rlottie.WORKERS_LIMIT = 4;

    let reqId = 0;
    let mainLoopTO = false;
    let checkViewportDate = false;
    let lastRenderDate = false;

    let { userAgent } = window.navigator;
    let isSafari = !!window.safari ||
        !!(userAgent && (/\b(iPad|iPhone|iPod)\b/.test(userAgent) || (!!userAgent.match('Safari') && !userAgent.match('Chrome'))));
    let isRAF = isSafari;
    rlottie.isSafari = isSafari;

    function wasmIsSupported() {
        try {
            if (typeof WebAssembly === 'object' &&
                typeof WebAssembly.instantiate === 'function') {
                const module = new WebAssembly.Module(Uint8Array.of(
                    0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
                ));
                if (module instanceof WebAssembly.Module) {
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
                }
            }
        } catch (e) {}
        return false;
    }

    function isSupported() {
        return (
            wasmIsSupported() &&
            typeof Uint8ClampedArray !== 'undefined' &&
            typeof Worker !== 'undefined' &&
            typeof ImageData !== 'undefined'
        );
    }

    rlottie.isSupported = isSupported();

    function mainLoop() {
        // console.log('[rlottie] mainLoop');
        let delta, rendered;
        const now = +Date.now();
        const checkViewport = !checkViewportDate || (now - checkViewportDate) > 1000;

        const shiftPlayer = new Map();
        for (let key in rlottie.players) {
            const rlPlayer = rlottie.players[key];
            const dataKey = `${rlPlayer.url}_${rlPlayer.width}_${rlPlayer.height}`
            shiftPlayer.set(dataKey, key);
        }
        for (let key in rlottie.players) {
            const rlPlayer = rlottie.players[key];
            if (rlPlayer) {
                const { url, width, height } = rlPlayer;
                const dataKey = `${url}_${width}_${height}`;
                const data = rlottie.frames.get(dataKey);
                if (data && data.frameCount) {
                    delta = now - data.frameThen;
                    if (delta > data.frameInterval) {
                        rendered = render(rlPlayer, checkViewport, shiftPlayer.get(dataKey) === key);
                        if (rendered) {
                            lastRenderDate = now;
                        }
                    }
                }
            }
        }

        const delay = now - lastRenderDate < 100 ? 16 : 500;
        if (delay < 20 && isRAF) {
            mainLoopTO = requestAnimationFrame(mainLoop)
        } else {
            mainLoopTO = setTimeout(mainLoop, delay);
        }
        if (checkViewport) {
            checkViewportDate = now;
        }
    }

    function setupMainLoop() {
        let isEmpty = true;
        for (const key in rlottie.players) {
            const rlPlayer = rlottie.players[key];
            if (rlPlayer) {
                const { url, width, height } = rlPlayer;
                const dataKey = `${url}_${width}_${height}`;
                const data = rlottie.frames.get(dataKey);
                if (data && data.frameCount) {
                    isEmpty = false;
                    break;
                }
            }
        }
        if ((mainLoopTO !== false) === isEmpty) {
            if (isEmpty) {
                if (isRAF) {
                    cancelAnimationFrame(mainLoopTO);
                }
                try {
                    clearTimeout(mainLoopTO);
                } catch (e) {};
                mainLoopTO = false;
            } else {
                if (isRAF) {
                    mainLoopTO = requestAnimationFrame(mainLoop);
                } else {
                    mainLoopTO = setTimeout(mainLoop, 0);
                }
            }
        }
    }

    function initApi(callback) {
        if (apiInited) {
            callback && callback();
        } else {
            callback && initCallbacks.push(callback);
            if (!apiInitStarted) {
                apiInitStarted = true;
                let workersRemain = rlottie.WORKERS_LIMIT;
                for (let workerNum = 0; workerNum < rlottie.WORKERS_LIMIT; workerNum++) {
                    (function(workerNum) {
                        const rlottieWorker = rlottieWorkers[workerNum] = new QueryableWorker('rlottie/rlottie-wasm.worker.js');
                        rlottieWorker.addListener('ready', function () {
                            console.log(dT(), 'worker #' + workerNum + ' ready');
                            rlottieWorker.addListener('frame', onFrame);
                            rlottieWorker.addListener('loaded', onLoaded);
                            --workersRemain;
                            if (!workersRemain) {
                                console.log(dT(), 'workers ready');
                                apiInited = true;
                                for (let i = 0; i < initCallbacks.length; i++) {
                                    initCallbacks[i]();
                                }
                                initCallbacks = [];
                            }
                        });
                    })(workerNum);
                }
            }
        }
    }

    function initPlayer(el, options) {
        options = options || {};
        const rlPlayer = {};
        let url = null;
        if (options.fileId && (options.animationData || options.stringData)) {
            url = options.fileId;
        }

        options.maxDeviceRatio = 1.5;

        if (!url) {
            console.warn('url not found');
            return;
        }
        let pic_width = options.width;
        let pic_height = options.height;
        if (!pic_width || !pic_height) {
            pic_width = pic_height = 256;
        }
        rlPlayer.autoplay = options.autoplay || false;
        rlPlayer.paused = !rlPlayer.autoplay;
        rlPlayer.loop = options.loop || false;
        rlPlayer.playWithoutFocus = options.playWithoutFocus;
        rlPlayer.inViewportFunc = options.inViewportFunc;

        const curDeviceRatio = options.maxDeviceRatio ? Math.min(options.maxDeviceRatio, deviceRatio) : deviceRatio;

        rlPlayer.url = url;
        rlPlayer.reqId = ++reqId;
        rlPlayer.el = el;
        rlPlayer.width = pic_width * curDeviceRatio;
        rlPlayer.height = pic_height * curDeviceRatio;
        rlPlayer.imageData = new ImageData(rlPlayer.width, rlPlayer.height);
        rlottie.players[reqId] = rlPlayer;
        rlottie.urls[reqId] = { url: rlPlayer.url, width: rlPlayer.width, height: rlPlayer.height };

        rlPlayer.canvas = document.createElement('canvas');
        rlPlayer.canvas.width = pic_width * curDeviceRatio;
        rlPlayer.canvas.height = pic_height * curDeviceRatio;
        rlPlayer.el.innerHTML = null;
        rlPlayer.el.appendChild(rlPlayer.canvas);
        rlPlayer.context = rlPlayer.canvas.getContext('2d');
        rlPlayer.forceRender = true;

        const dataKey = `${rlPlayer.url}_${rlPlayer.width}_${rlPlayer.height}`;
        const data = rlottie.frames.get(dataKey);
        if (!data) {
            const rWorker = rlottieWorkers[curWorkerNum++];
            if (curWorkerNum >= rlottieWorkers.length) {
                curWorkerNum = 0;
            }

            rlottie.frames.set(dataKey, {
                reqId: rlPlayer.reqId,
                nextFrameNo: false,
                rWorker,
                frames: {},
                cachingModulo: options.cachingModulo || 3,
                clamped: new Uint8ClampedArray(rlPlayer.width * rlPlayer.height * 4),
                width: rlPlayer.width,
                height: rlPlayer.height
            });

            // console.log('[rlottie] initPlayer', options);
            if (options.stringData) {
                rWorker.sendQuery('loadFromJson', rlPlayer.reqId, options.stringData, rlPlayer.width, rlPlayer.height);
            } else if (options.animationData) {
                rWorker.sendQuery('loadFromBlob', rlPlayer.reqId, options.animationData, rlPlayer.width, rlPlayer.height);
            } else {
                rWorker.sendQuery('loadFromData', rlPlayer.reqId, url, rlPlayer.width, rlPlayer.height);
            }
        } else {
            let activePlayer = null;
            for (let key in rlottie.players) {
                const pl = rlottie.players[key];
                if (pl && pl.url === url && pl.width === rlPlayer.width && pl.height === rlPlayer.height && rlPlayer !== pl) {
                    activePlayer = pl;
                    break;
                }
            }

            if (!activePlayer && data.frameCount && data.fps){
                if (data.frames[0]) {
                    doRender(rlPlayer, data.frames[0]);
                }

                data.frameQueue = null;
                onLoaded(data.reqId, data.frameCount, data.fps);
            }
            else if (activePlayer) {
                rlPlayer.context.drawImage(activePlayer.canvas, 0, 0);

                if (!rlPlayer.firstFrame) {
                    rlPlayer.firstFrame = true;
                    const rlEvents = rlottie.events[rlPlayer.reqId];
                    if (rlEvents) {
                        rlEvents['firstFrame'] && rlEvents['firstFrame']();
                    }
                }
            }
        }

        return rlPlayer.reqId;
    }

    function destroyWorkers() {
        for (let workerNum = 0; workerNum < rlottie.WORKERS_LIMIT; workerNum++) {
            if (rlottieWorkers[workerNum]) {
                rlottieWorkers[workerNum].terminate();
                console.log('worker #' + workerNum + ' terminated');
            }
        }
        console.log('workers destroyed');
        apiInitStarted = apiInited = false;
        rlottieWorkers = [];
    }

    function render(rlPlayer, checkViewport, shift) {
        const dataKey = `${rlPlayer.url}_${rlPlayer.width}_${rlPlayer.height}`;
        const data = rlottie.frames.get(dataKey);
        if (!rlPlayer.canvas || rlPlayer.canvas.width == 0 || rlPlayer.canvas.height == 0) {
            // console.log('[rlottie] render false 1');
            return false;
        }

        if (!rlPlayer.forceRender) {
            // not focused
            if (!rlPlayer.playWithoutFocus && !document.hasFocus() || !data.frameCount) {
                return false;
            }

            // paused
            if (rlPlayer.paused) {
                return false;
            }

            // not in viewport
            let { isInViewport, inViewportFunc } = rlPlayer;
            if (isInViewport === undefined || checkViewport) {
                const rect = rlPlayer.el.getBoundingClientRect();
                if (inViewportFunc) {
                    isInViewport = inViewportFunc(rlPlayer.url, rect);
                } else {
                    if (rect.bottom < 0 ||
                        rect.right < 0 ||
                        rect.top > (window.innerHeight || document.documentElement.clientHeight) ||
                        rect.left > (window.innerWidth || document.documentElement.clientWidth)) {
                        isInViewport = false;
                    } else {
                        isInViewport = true;
                    }
                }
                rlPlayer.isInViewport = isInViewport;
            }
            if (!isInViewport) {
                return false;
            }
        }

        const frameData = shift ?
            data.frameQueue.shift() :
            (data.frameQueue.queue.length > 0 ? data.frameQueue.queue[0] : null);

        if (frameData !== null) {
            const { frameNo, frame } = frameData;

            doRender(rlPlayer, frame);

            if (data.frameCount - 1 === frameNo) {
                if (!rlPlayer.loop) {
                    rlPlayer.paused = true;
                }

                const rlEvents = rlottie.events[rlPlayer.reqId];
                if (rlEvents) {
                    rlEvents['loopComplete'] && rlEvents['loopComplete']();
                }
            } else if (frameNo === rlPlayer.to) {
                rlPlayer.paused = true;
            }

            if (shift) {
                const now = +(new Date());
                data.frameThen = now - (now % data.frameInterval);

                const nextFrameNo = data.nextFrameNo;
                if (nextFrameNo !== false) {
                    data.nextFrameNo = false;
                    requestFrame(data.reqId, nextFrameNo);
                }
            }
        }

        return true;
    }

    function doRender(rlPlayer, frame) {
        // console.log('[rlottie] doRender');
        rlPlayer.forceRender = false;
        rlPlayer.imageData.data.set(frame);
        rlPlayer.context.putImageData(rlPlayer.imageData, 0, 0);

        if (rlPlayer.thumb) {
            rlPlayer.el.removeChild(rlPlayer.thumb);
            delete rlPlayer.thumb;
        }

        if (!rlPlayer.firstFrame) {
            rlPlayer.firstFrame = true;
            const rlEvents = rlottie.events[rlPlayer.reqId];
            if (rlEvents) {
                rlEvents['firstFrame'] && rlEvents['firstFrame']();
            }
        }
    }

    function requestFrame(reqId, frameNo) {
        const { url, width, height } = rlottie.urls[reqId];
        const dataKey = `${url}_${width}_${height}`;
        const data = rlottie.frames.get(dataKey);

        // console.log('[rlottie] requestFrame', frameNo);

        const frame = data.frames[frameNo];
        if (frame) {
            onFrame(reqId, frameNo, frame)
        } else if (isSafari) {
            if (data.reqId === reqId) data.rWorker.sendQuery('renderFrame', reqId, frameNo);
        } else {
            if(!data.clamped.length) { // fix detached
                data.clamped = new Uint8ClampedArray(data.width * data.height * 4);
            }
            if (data.reqId === reqId) data.rWorker.sendQuery('renderFrame', reqId, frameNo, data.clamped);
        }
    }

    function onFrame(reqId, frameNo, frame) {
        const { url, width, height } = rlottie.urls[reqId];
        const dataKey = `${url}_${width}_${height}`;
        const data = rlottie.frames.get(dataKey);

        // console.log('[rlottie] onFrame');
        if (data.cachingModulo &&
            !data.frames[frameNo] &&
            (!frameNo || ((reqId + frameNo) % data.cachingModulo))) {
            data.frames[frameNo] = new Uint8ClampedArray(frame)
        }
        if (data && data.reqId === reqId) {
            data.frameQueue.push({ frameNo, frame });
        }

        const rlPlayer = rlottie.players[reqId];
        if (rlPlayer && rlPlayer.forceRender && frameNo === 0) {
            doRender(rlPlayer, frame);
        }

        let nextFrameNo;
        // if (rlPlayer && rlPlayer.segments && rlPlayer.from > rlPlayer.to) {
        //     nextFrameNo = frameNo--;
        //     if (nextFrameNo < 0) {
        //         nextFrameNo = data.frameCount - 1;
        //     }
        // } else
            {
            nextFrameNo = ++frameNo;
            if (nextFrameNo >= data.frameCount) {
                nextFrameNo = 0;
            }
        }

        if (data.frameQueue.needsMore())  {
            requestFrame(reqId, nextFrameNo)
        } else {
            data.nextFrameNo = nextFrameNo;
        }
    }

    function onLoaded(reqId, frameCount, fps) {
        const { url, width, height } = rlottie.urls[reqId];
        const dataKey = `${url}_${width}_${height}`;
        const data = rlottie.frames.get(dataKey);

        let frameNo = 0;
        if (data && !data.frameQueue) {
            data.fps = fps;
            data.frameThen = Date.now();
            data.frameInterval = 1000 / fps;
            data.frameCount = frameCount;
            data.frameQueue = new FrameQueue(fps / 4);
            data.nextFrameNo = false;

            const rlPlayer = rlottie.players[reqId];
            if (rlPlayer && rlPlayer.from) {
                frameNo = rlPlayer.from;
                data.nextFrameNo = frameNo;
            }
        }

        setupMainLoop();
        requestFrame(reqId, frameNo);
    }

    rlottie.init = function(el, options) {
        if (!rlottie.isSupported) {
            return false;
        }
        initApi(() => {
            if (el && options) {
                initPlayer(el, options);
            }
        });
    }

    function loadAnimation(options, callback) {
        // console.log('[rlottie] loadAnimation', options);
        if (!rlottie.isSupported) {
            return false;
        }

        initApi(() => {
            const reqId = initPlayer(options.container, options);
            // console.log('[rlottie] loadAnimation reqId', reqId);
            callback && callback(reqId);
        });
    }

    function unloadAnimation(reqId) {
        delete rlottie.players[reqId];

        setupMainLoop();
    }

    rlottie.initApi = function () {
        initApi();
    }

    rlottie.destroyWorkers = function() {
        destroyWorkers();
    }

    rlottie.hasFirstFrame = function (reqId) {
        const { url, width, height } = rlottie.urls[reqId];
        const dataKey = `${url}_${width}_${height}`;
        const data = rlottie.frames.get(dataKey);

        return data && Boolean(data.frames[0]);
    }

    rlottie.loadAnimation = function (options, callback) {
        // console.log('[rlottie] loadAnimation', reqId);
        return loadAnimation(options, callback);
    }

    rlottie.destroy = function(reqId) {
        // console.log('[rlottie] destroy', reqId);
        unloadAnimation(reqId);
    }

    rlottie.clear = function() {
        rlottie.frames = new Map();
        return true;
    }

    rlottie.clearPlayers = function() {
        rlottie.players = Object.create(null);
        return true;
    }

    rlottie.addEventListener = function (reqId, eventName, callback) {
        if (!rlottie.events[reqId]) {
            rlottie.events[reqId] = Object.create(null);
        }

        rlottie.events[reqId][eventName] = callback;
    }

    rlottie.removeEventListener = function (reqId, eventName) {
        if (!rlottie.events[reqId]) {
            return;
        }

        delete rlottie.events[reqId][eventName];

        if (!Object.keys(rlottie.events[reqId]).length) {
            delete rlottie.events[reqId];
        }
    }

    rlottie.isPaused = function (reqId) {
        const rlPlayer = rlottie.players[reqId];
        if (!rlPlayer) return false;

        return rlPlayer.paused;
    }

    rlottie.pause = function (reqId) {
        const rlPlayer = rlottie.players[reqId];
        if (!rlPlayer) return;

        rlPlayer.paused = true;
    }

    rlottie.play = function (reqId) {
        const rlPlayer = rlottie.players[reqId];
        if (!rlPlayer) return;

        // console.log('[rlottie] play');
        rlPlayer.paused = false;
    }

    rlottie.playSegments = function (reqId, segments, forceFlag) {
        const rlPlayer = rlottie.players[reqId];
        if (!rlPlayer) return;

        if (!segments || segments.length < 2) return;

        console.log('[rlottie] playSegments', segments);
        rlPlayer.from = segments[0];
        rlPlayer.to = segments[1];
        rlPlayer.segments = segments;
        rlPlayer.paused = false;

        const { url, width, height } = rlPlayer;
        const dataKey = `${url}_${width}_${height}`;
        const data = rlottie.frames.get(dataKey);
        if (data.frameQueue) {
            data.nextFrameNo = rlPlayer.segments[0];
            data.frameQueue = new FrameQueue(data.fps / 4);
            requestFrame(data.reqId, data.nextFrameNo);
        }
    }

    return rlottie;
}());

class QueryableWorker {
    constructor(url, defaultListener, onError) {
        this.worker = new Worker(url);
        this.listeners = [];

        this.defaultListener = defaultListener || function() { };
        if (onError) {
            this.worker.onerror = onError;
        }

        this.worker.onmessage = event => {
            if (event.data instanceof Object &&
                event.data.hasOwnProperty('queryMethodListener') &&
                event.data.hasOwnProperty('queryMethodArguments')) {
                this.listeners[event.data.queryMethodListener].apply(this, event.data.queryMethodArguments);
            } else {
                this.defaultListener.call(this, event.data);
            }
        };
    }

    postMessage(message) {
        this.worker.postMessage(message);
    }

    terminate() {
        this.worker.terminate();
    }

    addListener(name, listener) {
        this.listeners[name] = listener;
    }

    removeListener(name) {
        delete this.listeners[name];
    }

    /*
      This functions takes at least one argument, the method name we want to query.
      Then we can pass in the arguments that the method needs.
    */
    sendQuery(queryMethod) {
        if (arguments.length < 1) {
            throw new TypeError('QueryableWorker.sendQuery takes at least one argument');
            return;
        }
        queryMethod = arguments[0];
        const args = Array.prototype.slice.call(arguments, 1);
        if (RLottie.isSafari) {
            this.worker.postMessage({
                'queryMethod': queryMethod,
                'queryMethodArguments': args
            });
        } else {
            const transfer = [];
            for(let i = 0; i < args.length; i++) {
                if(args[i] instanceof ArrayBuffer) {
                    transfer.push(args[i]);
                }

                if(args[i].buffer && args[i].buffer instanceof ArrayBuffer) {
                    transfer.push(args[i].buffer);
                }
            }

            this.worker.postMessage({
                'queryMethod': queryMethod,
                'queryMethodArguments': args
            }, transfer);
        }
    }
}

class FrameQueue {
    constructor(maxLength) {
        this.queue = [];
        this.maxLength = maxLength;
    }

    needsMore() {
        return this.queue.length < this.maxLength;
    }

    empty() {
        return !this.queue.length;
    }

    push(element) {
        return this.queue.push(element);
    }

    shift() {
        return this.queue.length ? this.queue.shift() : null;
    }
}

window.RLottie.initApi();
