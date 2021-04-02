/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { addExtmap, addPayloadTypes, addSsrc } from './P2PSdpBuilder';

export class SafariP2PSdpBuilder {
    static generateOffer(info) {
        const { sessionId, fingerprints, ufrag, pwd, media } = info;
        if (!media.length) {
            return `v=0
o=- ${sessionId} 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
`;
        }

        let sdp = `v=0
o=- ${sessionId} 2 IN IP4 127.0.0.1
s=-
t=0 0`;
        if (fingerprints) {
            fingerprints.forEach(x => {
                const { hash, fingerprint, setup } = x;
                sdp += `
a=fingerprint:${hash} ${fingerprint}
a=setup:${setup}`;
            });
        }
        if (ufrag && pwd) {
            sdp += `
a=ice-ufrag:${ufrag}
a=ice-pwd:${pwd}`;
        }

        sdp += `
a=group:BUNDLE ${media.map(x => x.mid).join(' ')}
a=extmap-allow-mixed
a=msid-semantic: WMS *`;
        const streamName = 'stream' + media.map(x => x.ssrc).join('_');
        for (let i = 0; i < media.length; i++) {
            const m = media[i];
            const { type, ssrc, ssrcGroup, types, dir, mid, extmap } = m;
            switch (type) {
                case 'application': {
                    const { port, maxSize } = m;
                    sdp += `
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=ice-options:trickle
a=mid:${mid}
a=sctp-port:${port}
a=max-message-size:${maxSize}`;
                    break;
                }
                case 'audio': {
                    sdp += `
m=audio 9 UDP/TLS/RTP/SAVPF ${types.map(x => x.id).join(' ')}
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-options:trickle
a=mid:${mid}`;
                    sdp += addExtmap(extmap);
                    if (dir) {
                        sdp += `
a=${dir}`;
                    }
                    if (ssrc) {
                        sdp += `
a=msid:${streamName} audio${ssrc}`;
                    }
                    sdp += `
a=rtcp-mux`;
                    sdp += addPayloadTypes(types);
                    sdp += addSsrc(type, ssrc, ssrcGroup, streamName);

                    break;
                }
                case 'video': {
                    sdp += `
m=video 9 UDP/TLS/RTP/SAVPF ${types.map(x => x.id).join(' ')}
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-options:trickle
a=mid:${mid}`;
                    sdp += addExtmap(extmap);
                    if (dir) {
                        sdp += `
a=${dir}`;
                    }
                    if (ssrc) {
                        sdp += `
a=msid:${streamName} video${ssrc}`;
                    }
                    sdp += `
a=rtcp-mux
a=rtcp-rsize`;
                    sdp += addPayloadTypes(types);
                    sdp += addSsrc(type, ssrc, ssrcGroup, streamName);
                    break;
                }
            }
        }

        sdp += `
`;

        return sdp;
    }

    static generateAnswer(info) {
        const { sessionId, fingerprints, ufrag, pwd, media } = info;
        if (!media.length) {
            return `v=0
o=- ${sessionId} 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
`;
        }

        let sdp = `v=0
o=- ${sessionId} 2 IN IP4 127.0.0.1
s=-
t=0 0`;
        if (fingerprints) {
            fingerprints.forEach(x => {
                const { hash, fingerprint, setup } = x;
                sdp += `
a=fingerprint:${hash} ${fingerprint}
a=setup:${setup}`;
            });
        }
        if (ufrag && pwd) {
            sdp += `
a=ice-ufrag:${ufrag}
a=ice-pwd:${pwd}`;
        }

        sdp += `
a=group:BUNDLE ${media.map(x => x.mid).join(' ')}
a=extmap-allow-mixed
a=msid-semantic: WMS *`;
        const streamName = 'stream' + media.map(x => x.ssrc).join('_');
        for (let i = 0; i < media.length; i++) {
            const m = media[i];
            const { type, ssrc, ssrcGroup, types, dir, mid, extmap } = m;
            switch (type) {
                case 'application': {
                    const { port, maxSize } = m;
                    sdp += `
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=ice-options:trickle
a=mid:${mid}
a=sctp-port:${port}
a=max-message-size:${maxSize}`;
                    break;
                }
                case 'audio': {
                    sdp += `
m=audio 9 UDP/TLS/RTP/SAVPF ${types.map(x => x.id).join(' ')}
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-options:trickle
a=mid:${mid}`;
                    sdp += addExtmap(extmap);
                    if (dir) {
                        sdp += `
a=${dir}`;
                    }
                    if (ssrc) {
                        sdp += `
a=msid:${streamName} audio${ssrc}`;
                    }
                    sdp += `
a=rtcp-mux`;
                    sdp += addPayloadTypes(types);
                    sdp += addSsrc(type, ssrc, ssrcGroup, streamName);

                    break;
                }
                case 'video': {
                    sdp += `
m=video 9 UDP/TLS/RTP/SAVPF ${types.map(x => x.id).join(' ')}
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-options:trickle
a=mid:${mid}`;
                    sdp += addExtmap(extmap);
                    if (dir) {
                        sdp += `
a=${dir}`;
                    }
                    if (ssrc) {
                        sdp += `
a=msid:${streamName} video${ssrc}`;
                    }
                    sdp += `
a=rtcp-mux
a=rtcp-rsize`;
                    sdp += addPayloadTypes(types);
                    sdp += addSsrc(type, ssrc, ssrcGroup, streamName);
                    break;
                }
            }
        }

        sdp += `
`;

        return sdp;
    }
}