(this.webpackJsonptelegram_react=this.webpackJsonptelegram_react||[]).push([[7],{661:function(e,t,n){},663:function(e,t,n){},665:function(e,t,n){},666:function(e,t,n){},667:function(e,t,n){},692:function(e,t,n){"use strict";n.r(t);var a=n(10),i=n.n(a),r=n(16),s=n(4),o=n(5),c=n(8),l=n(7),u=n(9),d=n(0),p=n.n(d),f=n(22),h=n.n(f),k=n(57),m=n(193),v=n.n(m),S=n(29),b=n(254),w=n(391),g=n(472),E=n(668),O=n(102),y=(n(473),function(e){function t(){return Object(s.a)(this,t),Object(c.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(u.a)(t,e),Object(o.a)(t,[{key:"render",value:function(){var e=this.props.animation;return e?p.a.createElement("div",{className:"sticker-preview"},p.a.createElement(O.a,{type:"preview",stretch:!0,animation:e,style:{borderRadius:0}})):null}}]),t}(p.a.Component)),j=n(461),C=n(38),P=n(40),M=n(662),R=n.n(M),T=n(164),D=n(3),I=(n(661),function(e){function t(){return Object(s.a)(this,t),Object(c.a)(this,Object(l.a)(t).apply(this,arguments))}return Object(u.a)(t,e),Object(o.a)(t,[{key:"shouldComponentUpdate",value:function(e,t,n){return this.props.info!==e.info}},{key:"render",value:function(){var e=this.props,t=e.info,n=e.onSelect,a=e.onMouseDown,i=e.onMouseEnter,r=e.onDeleteClick;if(!t)return null;var s=t.title,o=t.stickers.map(function(e,t){return p.a.createElement("div",{className:"sticker-set-item",key:e.sticker.id,"data-sticker-id":e.sticker.id,onClick:function(){return n(e)},onMouseEnter:i,onMouseDown:a,style:{width:D.Db,height:D.Db}},p.a.createElement(T.b,{key:e.sticker.id,sticker:e,autoplay:!1,blur:!1,displaySize:D.Db,preview:!0,source:T.a.PICKER}))});return p.a.createElement("div",{className:"sticker-set"},p.a.createElement("div",{className:"sticker-set-title"},p.a.createElement("div",{className:"sticker-set-title-wrapper"},p.a.createElement("span",null,s)),r&&p.a.createElement(w.a,{"aria-label":"delete",classes:{root:"sticker-set-icon-root"},size:"small",onClick:r},p.a.createElement(R.a,{fontSize:"inherit"}))),p.a.createElement("div",{className:"sticker-set-content"},o))}}]),t}(p.a.Component)),U=n(664),x=n.n(U),N=n(459),V=n(88),A=(n(663),function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(c.a)(this,Object(l.a)(t).call(this,e))).onClientUpdateStickerSetPosition=function(e){var t=e.position;n.setState({position:t})},n.scrollToPosition=function(){var e=n.state.position,t=Object(C.a)(n),a=t.animator,i=t.anchorRef,r=t.scrollRef.current,s=i.current,o=P.findDOMNode(s),c=r.scrollLeft,l=48*e-147,u=Number(o.style.left.replace("px","")),d=48*e;a&&a.stop(),n.animator=new N.a(0,[{from:c,to:l,func:function(e){return r.scrollLeft=e}},{from:Math.abs(d-u)>338?d-338*Math.sign(d-u):u,to:d,func:function(e){return o.style.left=e+"px"}}]),setTimeout(function(){n.animator&&n.animator.start()},0)},n.handleWheel=function(e){var t=Object(C.a)(n).scrollRef;0===e.deltaX&&(t.current.scrollLeft+=e.deltaY)},n.handleSelect=function(e){var t=n.props,a=t.stickers;(0,t.onSelect)(a.indexOf(e))},n.scrollRef=p.a.createRef(),n.anchorRef=p.a.createRef(),n.state={position:0},n}return Object(u.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){V.a.on("clientUpdateStickerSetPosition",this.onClientUpdateStickerSetPosition)}},{key:"componentWillUnmount",value:function(){V.a.off("clientUpdateStickerSetPosition",this.onClientUpdateStickerSetPosition)}},{key:"componentDidUpdate",value:function(e,t,n){t.position!==this.state.position&&this.scrollToPosition()}},{key:"render",value:function(){var e=this,t=this.props,n=t.recent,a=t.stickers,i=n?p.a.createElement("div",{className:"stickers-picker-header-recent",onClick:function(){return e.handleSelect("recent")}},p.a.createElement(x.a,null)):null,r=a.map(function(t){return p.a.createElement(T.b,{key:t.sticker.id,className:"stickers-picker-header-sticker",sticker:t,play:!1,autoplay:!1,blur:!1,displaySize:36,preview:!0,source:T.a.PICKER_HEADER,openMedia:function(){return e.handleSelect(t)}})});return p.a.createElement("div",{className:"stickers-picker-header"},p.a.createElement("div",{ref:this.scrollRef,className:h()("stickers-picker-header-scroll","scrollbars-hidden"),onWheel:this.handleWheel},p.a.createElement("div",{className:"stickers-picker-header-items"},i,r),p.a.createElement("div",{ref:this.anchorRef,className:"stickers-picker-header-anchor"})))}}]),t}(p.a.Component)),L=n(15),_=n(14),B=n(44),H=n(1),G=n(2),F=(n(665),function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(c.a)(this,Object(l.a)(t).call(this,e))).onUpdateInstalledStickerSets=function(e){var t=e.is_masks;e.sticker_set_ids;t&&n.filterSets()},n.onUpdateRecentStickers=function(e){n.reloadRecentContent()},n.scrollTop=function(){n.scrollRef.current.scrollTop=0},n.loadContent=function(){var e=Object(r.a)(i.a.mark(function e(t,a,r){var s,o,c,l;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(t){e.next=4;break}return e.next=3,G.a.send({"@type":"getRecentStickers",is_attached:!1});case 3:t=e.sent;case 4:if(r){e.next=13;break}return e.next=7,G.a.send({"@type":"getInstalledStickerSets",is_masks:!1});case 7:return s=e.sent,o=[],s.sets.forEach(function(e){o.push(G.a.send({"@type":"getStickerSet",set_id:e.id}))}),e.next=12,Promise.all(o);case 12:r=e.sent;case 13:c=r.slice(0,5),l=r.reduce(function(e,t){return t.stickers.length>0&&e.push(t.stickers[0]),e},[]),n.setState({recent:t,stickerSets:a,sets:c,fullSets:r,headerStickers:l}),n.setsLength=c.length;case 17:case"end":return e.stop()}},e)}));return function(t,n,a){return e.apply(this,arguments)}}(),n.loadInViewContentOnScroll=function(){n.loadInViewContent()},n.loadInViewContentOnScrollEnd=function(){n.loadInViewContent(400)},n.loadInViewContent=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=n.scrollRef.current,a=n.state.sets,i=[];a.forEach(function(a){var r=n.itemsMap.get(a.id),s=P.findDOMNode(r);if(s){var o=t.scrollTop-e,c=t.scrollTop+t.offsetHeight+e,l=s.offsetTop,u=s.offsetTop+s.clientHeight;l>=o&&s.offsetTop<=c?i.push(a):u>=o&&u<=c?i.push(a):l<=o&&u>=c&&i.push(a)}}),i.forEach(function(e){var t=H.a.getStore();n.loadedSets.has(e.id)||(n.loadedSets.set(e.id,e.id),Object(_.F)(t,e))})},n.updatePosition=function(){var e=n.scrollRef.current,t=n.state,a=t.recent,i=t.sets,r=e.scrollHeight,s=0,o=0;if(a&&a.stickers.length>0){o=1;var c=n.itemsMap.get("recent");if(c){var l=P.findDOMNode(c);if(l&&l.offsetTop<=e.scrollTop){var u=l.offsetTop;if(l&&u<=e.scrollTop){var d=Math.abs(e.scrollTop-u);d<=r&&(r=d,s=0)}}}}i.forEach(function(t,a){var i=n.itemsMap.get(t.id);if(i){var c=P.findDOMNode(i);if(c&&c.offsetTop<=e.scrollTop){var l=c.offsetTop;if(c){var u=Math.abs(e.scrollTop-l);u<=r&&(r=u,s=o+a)}}}}),G.a.clientUpdate({"@type":"clientUpdateStickerSetPosition",position:s})},n.handleScroll=Object(r.a)(i.a.mark(function e(){var t,a,r,s,o,c,l,u;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(n.scrolling=!0,t=new Date,n.lastScrollTime=t,n.scrollTimer&&clearTimeout(n.scrollTimer),n.scrollTimer=setTimeout(function(){t===n.lastScrollTime&&(n.scrolling=!1)},250),n.loadInViewContentOnScrollEnd(),n.updatePosition(),a=n.scrollRef.current,!n.loadingChunk){e.next=10;break}return e.abrupt("return");case 10:if(r=!1,a.scrollTop+a.offsetHeight>=a.scrollHeight-400&&(r=!0),r){e.next=14;break}return e.abrupt("return",!1);case 14:if(s=n.state,o=s.sets,(c=s.stickerSets).sets.length!==o.length){e.next=17;break}return e.abrupt("return");case 17:return n.loadingChunk=!0,l=[],c.sets.slice(n.setsLength,n.setsLength+5).forEach(function(e){l.push(G.a.send({"@type":"getStickerSet",set_id:e.id}))}),e.next=22,Promise.all(l).finally(function(){n.loadingChunk=!1});case 22:u=e.sent,n.setsLength+=u.length,n.setState({sets:o.concat(u)});case 25:case"end":return e.stop()}},e)})),n.loadPreviewContent=function(e){var t=n.state,a=t.recent,i=t.sets,r=Object(B.k)([a].concat(i)).find(function(t){return t.sticker.id===e});if(r){var s=H.a.getStore();Object(_.E)(s,r,null);Object(B.i)(r,i,5).forEach(function(e){Object(_.E)(s,e,null)})}},n.handleMouseEnter=function(e){var t=Number(e.currentTarget.dataset.stickerId);if(t&&n.mouseDown){n.mouseDownStickerId!==t&&(n.mouseDownStickerId=null),n.setState({previewStickerId:t}),n.loadPreviewContent(t);var a=n.props.onPreview,i=n.state,r=i.recent,s=i.sets;a(Object(B.k)([r].concat(s)).find(function(e){return e.sticker.id===t}))}},n.handleMouseDown=function(e){var t=Number(e.currentTarget.dataset.stickerId);if(t){n.mouseDownStickerId=t;var a=Date.now();return n.setState({previewStickerId:t,timestamp:a,showPreview:!1,cancelSend:!1}),setTimeout(function(){n.state.timestamp===a&&n.setState({showPreview:!0,cancelSend:!0},function(){var e=n.props.onPreview,a=n.state,i=a.recent,r=a.sets;e(Object(B.k)([i].concat(r)).find(function(e){return e.sticker.id===t}))})},500),n.loadPreviewContent(t),n.mouseDown=!0,document.addEventListener("mouseup",n.handleMouseUp),e.preventDefault(),e.stopPropagation(),!1}},n.handleMouseUp=function(){n.setState({previewStickerId:0,timestamp:0,showPreview:!1}),(0,n.props.onPreview)(null),n.mouseDown=!1,document.removeEventListener("mouseup",n.handleMouseUp)},n.handleStickerSelect=function(e){var t=n.props.onSelect;n.state.cancelSend||t(e)},n.handleSelectSet=function(){var e=Object(r.a)(i.a.mark(function e(t){var a,r,s,o,c,l,u,d,p,f;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(a=n.state,r=a.sets,s=a.stickerSets,o=Object(C.a)(n),c=o.scrollRef,-1!==t){e.next=7;break}c.current.scrollTop=0,e.next=26;break;case 7:if(!(t<r.length)){e.next=12;break}(l=n.itemsMap.get(r[t].id))&&(u=P.findDOMNode(l))&&(c.current.scrollTop=u.offsetTop),e.next=26;break;case 12:if(!(t<s.sets.length)){e.next=26;break}if(!n.loadingChunk){e.next=15;break}return e.abrupt("return");case 15:if(s.sets.length!==r.length){e.next=17;break}return e.abrupt("return");case 17:return n.loadingChunk=!0,d=[],s.sets.slice(n.setsLength,t+1).forEach(function(e){d.push(G.a.send({"@type":"getStickerSet",set_id:e.id}))}),e.next=22,Promise.all(d).finally(function(){return n.loadingChunk=!1});case 22:p=e.sent,n.setsLength+=p.length,f=r.concat(p),n.setState({sets:f},function(){t<f.length&&n.handleSelectSet(t)});case 26:case"end":return e.stop()}},e)}));return function(t){return e.apply(this,arguments)}}(),n.handleDeleteRecent=function(){G.a.send({"@type":"clearRecentStickers",is_attached:!1})},n.handleDeleteStickerSet=function(e){G.a.send({"@type":"changeStickerSet",set_id:e,is_installed:!1})},n.scrollRef=p.a.createRef(),n.itemsMap=new Map,n.loadedSets=new Map,n.state={recent:null,stickerSets:null,sets:[],headerStickers:[],position:0},n.loadInViewContentOnScrollEnd=Object(L.e)(n.loadInViewContentOnScrollEnd,100),n.loadInViewContentOnScroll=Object(L.B)(n.loadInViewContentOnScroll,2e3),n.updatePosition=Object(L.B)(n.updatePosition,250),n}return Object(u.a)(t,e),Object(o.a)(t,[{key:"shouldComponentUpdate",value:function(e,t,n){var a=this.state,i=a.position,r=a.recent,s=a.stickerSets,o=a.sets,c=a.showPreview;return t.recent!==r||(t.stickerSets!==s||(t.sets!==o||(t.showPreview!==c||t.position!==i)))}},{key:"componentDidMount",value:function(){V.a.on("updateInstalledStickerSets",this.onUpdateInstalledStickerSets),V.a.on("updateRecentStickers",this.onUpdateRecentStickers)}},{key:"componentWillUnmount",value:function(){V.a.off("updateInstalledStickerSets",this.onUpdateInstalledStickerSets),V.a.off("updateRecentStickers",this.onUpdateRecentStickers)}},{key:"stop",value:function(){}},{key:"filterSets",value:function(e){var t=this.state;t.sets,t.stickerSets}},{key:"reloadRecentContent",value:function(){var e=Object(r.a)(i.a.mark(function e(){var t;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,G.a.send({"@type":"getRecentStickers",is_attached:!1});case 2:t=e.sent,this.setState({recent:t});case 4:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.props,n=t.t,a=t.style,i=this.state,r=i.recent,s=(i.stickerSets,i.sets),o=i.headerStickers;this.itemsMap.clear();var c=s.map(function(t){return p.a.createElement(I,{key:t.id,ref:function(n){return e.itemsMap.set(t.id,n)},info:t,onSelect:e.handleStickerSelect,onMouseDown:e.handleMouseDown,onMouseEnter:e.handleMouseEnter})}),l=r&&r.stickers.length>0?{stickers:r.stickers,title:n("RecentStickers")}:null;return p.a.createElement("div",{className:"stickers-picker",style:a},p.a.createElement(A,{recent:l,stickers:o,onSelect:this.handleSelectSet}),p.a.createElement("div",{ref:this.scrollRef,className:h()("stickers-picker-scroll","scrollbars-hidden"),onScroll:this.handleScroll},Boolean(l)&&p.a.createElement(I,{ref:function(t){return e.itemsMap.set("recent",t)},info:l,onSelect:this.handleStickerSelect,onMouseDown:this.handleMouseDown,onMouseEnter:this.handleMouseEnter,onDeleteClick:this.handleDeleteRecent}),c))}}]),t}(p.a.Component)),W=Object(k.a)(Object(k.d)(),Object(S.d)(),Object(k.c)())(F),z=n(165),X=(n(666),function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(c.a)(this,Object(l.a)(t).call(this,e))).handleScroll=function(e){var t=n.scrollRef.current,a=t.scrollTop,i=t.scrollHeight,r=t.offsetHeight;n.loadInViewContentOnScrollEnd();var s=a<=10,o=i-(a+r)<=10,c=Math.abs(a-n.prevScrollTop)>50&&!s&&!o;n.prevScrollTop=a,c||n.loadInViewContent()},n.scrollTop=function(){n.scrollRef.current.scrollTop=0},n.loadInViewContentOnScroll=function(){n.loadInViewContent()},n.loadInViewContentOnScrollEnd=function(){n.loadInViewContent()},n.loadInViewContent=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=n.scrollRef.current,a=z.a.savedAnimations;if(a){var i=a.animations,r=new Map,s=[];i.forEach(function(a,i){var o=n.itemsMap.get("".concat(i,"_").concat(a.animation.id)),c=P.findDOMNode(o);if(c){var l=t.scrollTop-e,u=t.scrollTop+t.offsetHeight+e,d=c.offsetTop,p=c.offsetTop+c.clientHeight;d>=l&&c.offsetTop<=u?(r.set(a,a),s.push(i)):p>=l&&p<=u?(r.set(a,a),s.push(i)):d<=l&&p>=u&&(r.set(a,a),s.push(i))}});var o=z.a.animationsInView;Object(L.d)(o,r)||G.a.clientUpdate({"@type":"clientUpdateAnimationsInView",animations:r})}},n.handleMouseDown=function(e){var t=Number(e.currentTarget.dataset.animationIndex);n.mouseDownStickerId=t;var a=Date.now();return n.setState({previewStickerId:t,timestamp:a,showPreview:!1,cancelSend:!1}),setTimeout(function(){n.state.timestamp===a&&n.setState({showPreview:!0,cancelSend:!0},function(){var e=n.props.onPreview,a=n.state;a.recent,a.sets;e(z.a.savedAnimations.animations[t])})},500),n.mouseDown=!0,document.addEventListener("mouseup",n.handleMouseUp),e.preventDefault(),e.stopPropagation(),!1},n.handleMouseEnter=function(e){var t=Number(e.currentTarget.dataset.animationIndex);n.mouseDown&&(n.mouseDownStickerId!==t&&(n.mouseDownStickerId=null),n.setState({previewStickerId:t}),(0,n.props.onPreview)(z.a.savedAnimations.animations[t]))},n.handleMouseUp=function(){n.setState({previewStickerId:0,timestamp:0,showPreview:!1}),(0,n.props.onPreview)(null),n.mouseDown=!1,document.removeEventListener("mouseup",n.handleMouseUp)},n.openAnimation=function(e){var t=n.props.onSelect;n.state.cancelSend||t(e)},n.scrollRef=p.a.createRef(),n.itemsMap=new Map,n.loadInViewContentOnScroll=Object(L.B)(n.loadInViewContentOnScroll,250),n.loadInViewContentOnScrollEnd=Object(L.e)(n.loadInViewContentOnScrollEnd,250),n}return Object(u.a)(t,e),Object(o.a)(t,[{key:"start",value:function(){this.loadInViewContent()}},{key:"stop",value:function(){G.a.clientUpdate({"@type":"clientUpdateAnimationsInView",animations:new Map})}},{key:"loadContent",value:function(){var e=Object(r.a)(i.a.mark(function e(){var t,n,a,r=this;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(t=z.a.savedAnimations){e.next=8;break}return e.next=4,G.a.send({"@type":"getSavedAnimations"});case 4:n=e.sent,z.a.savedAnimations=n,t=n,this.forceUpdate(function(){r.start()});case 8:a=H.a.getStore(),t.animations.slice(0,1e3).forEach(function(e){Object(_.t)(a,e,null),Object(_.s)(a,e,null,!1)});case 11:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this,t=this.props,n=(t.t,t.style),a=z.a.savedAnimations;if(!a)return null;this.itemsMap.clear();var i=a.animations.map(function(t,n){return p.a.createElement("div",{"data-animation-index":n,key:"".concat(n,"_").concat(t.animation.id),ref:function(a){return e.itemsMap.set("".concat(n,"_").concat(t.animation.id),a)},onMouseDown:e.handleMouseDown,onMouseEnter:e.handleMouseEnter},p.a.createElement(O.a,{type:"picker",animation:t,openMedia:function(){return e.openAnimation(t)},style:{width:104,height:104,margin:2,borderRadius:0}}))});return p.a.createElement("div",{className:"gifs-picker",style:n},p.a.createElement("div",{ref:this.scrollRef,className:h()("gifs-picker-scroll","scrollbars-hidden"),onScroll:this.handleScroll},i))}}]),t}(p.a.Component)),J=Object(k.a)(Object(k.d)(),Object(S.d)(),Object(k.c)())(X),K=n(18),Y=n(89),q=(n(667),function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(c.a)(this,Object(l.a)(t).call(this,e))).onClientUpdateChange=function(e){n.state.open?n.removePicker=!0:n.picker=null},n.handleButtonMouseEnter=function(e){n.buttonEnter=!0,setTimeout(function(){if(n.buttonEnter&&(n.updatePicker(!0),n.loadStickerSets(),n.loadSavedAnimations(),2===n.state.tab)){var e=n.gifsPickerRef.current;e&&e.start()}},D.f)},n.loadSavedAnimations=Object(r.a)(i.a.mark(function e(){var t,n,a;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(t=z.a.savedAnimations){e.next=7;break}return e.next=4,G.a.send({"@type":"getSavedAnimations"});case 4:n=e.sent,z.a.savedAnimations=n,t=n;case 7:a=H.a.getStore(),t.animations.slice(0,1e3).forEach(function(e){Object(_.t)(a,e)});case 10:case"end":return e.stop()}},e)})),n.loadStickerSets=Object(r.a)(i.a.mark(function e(){var t,a,r;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!n.sets){e.next=2;break}return e.abrupt("return");case 2:return e.next=4,G.a.send({"@type":"getRecentStickers",is_attached:!1});case 4:return n.recent=e.sent,e.next=7,G.a.send({"@type":"getInstalledStickerSets",is_masks:!1});case 7:return n.stickerSets=e.sent,t=[],n.stickerSets.sets.forEach(function(e){t.push(G.a.send({"@type":"getStickerSet",set_id:e.id}))}),e.next=12,Promise.all(t);case 12:n.sets=e.sent,a=n.stickersPickerRef.current,r=H.a.getStore(),Object(_.D)(r,n.recent),n.sets.slice(0,5).reverse().forEach(function(e){Object(_.F)(r,e),a.loadedSets.set(e.id,e.id)}),n.sets.reduce(function(e,t){return t.stickers.length>0&&e.push(t.stickers[0]),e},[]).forEach(function(e){Object(_.G)(r,e)});case 20:case"end":return e.stop()}},e)})),n.handleButtonMouseLeave=function(){n.buttonEnter=!1,setTimeout(function(){n.tryClosePicker()},D.f)},n.tryClosePicker=function(){var e=n.state,t=e.animation,a=e.sticker;n.paperEnter||n.buttonEnter||a||t||n.updatePicker(!1)},n.handlePaperMouseEnter=function(){n.paperEnter=!0},n.handlePaperMouseLeave=function(){n.paperEnter=!1,setTimeout(function(){n.tryClosePicker()},D.f)},n.updatePicker=function(e){n.setState({open:e},function(){if(!n.state.open){n.removePicker&&(n.picker=null,n.removePicker=!1);var e=n.gifsPickerRef.current;e&&e.stop()}})},n.handleEmojiClick=function(){n.setState({tab:0});var e=n.gifsPickerRef.current;e&&e.stop();var t=n.stickersPickerRef.current;t&&t.stop()},n.handleStickersClick=function(){var e=n.stickersPickerRef.current;1===n.state.tab?e&&e.scrollTop():(setTimeout(function(){e.loadContent(n.recent,n.stickerSets,n.sets)},150),n.setState({tab:1}));var t=n.gifsPickerRef.current;t&&t.stop()},n.handleGifsClick=function(){var e=n.gifsPickerRef.current;if(2===n.state.tab)e&&e.scrollTop();else{var t=z.a.savedAnimations;setTimeout(function(){e.loadContent(t),e.start()},150),n.setState({tab:2})}var a=n.stickersPickerRef.current;a&&a.stop()},n.handleStickerSend=function(e){e&&(G.a.clientUpdate({"@type":"clientUpdateStickerSend",sticker:e}),n.updatePicker(!1))},n.handleStickerPreview=function(e){n.setState({sticker:e}),G.a.clientUpdate({"@type":"clientUpdateStickerPreview",sticker:e}),e||n.tryClosePicker()},n.handleGifSend=function(e){e&&(G.a.clientUpdate({"@type":"clientUpdateAnimationSend",animation:e}),n.updatePicker(!1))},n.handleGifPreview=function(e){n.setState({animation:e}),G.a.clientUpdate({"@type":"clientUpdateAnimationPreview",animation:e}),e||n.tryClosePicker()},n.state={open:!1,tab:0},n.emojiPickerRef=p.a.createRef(),n.stickersPickerRef=p.a.createRef(),n.gifsPickerRef=p.a.createRef(),n}return Object(u.a)(t,e),Object(o.a)(t,[{key:"componentDidMount",value:function(){K.a.on("clientUpdateThemeChange",this.onClientUpdateChange),Y.a.on("clientUpdateLanguageChange",this.onClientUpdateChange)}},{key:"componentWillUnmount",value:function(){K.a.off("clientUpdateThemeChange",this.onClientUpdateChange),Y.a.off("clientUpdateLanguageChange",this.onClientUpdateChange)}},{key:"render",value:function(){var e=this.props,t=e.theme,n=e.t,a=this.state,i=a.open,r=a.tab,s=a.animation,o=a.sticker;if(i&&!this.picker){var c={search:n("Search"),notfound:n("NotEmojiFound"),skintext:n("ChooseDefaultSkinTone"),categories:{search:n("SearchResults"),recent:n("Recent"),people:n("SmileysPeople"),nature:n("AnimalsNature"),foods:n("FoodDrink"),activity:n("Activity"),places:n("TravelPlaces"),objects:n("Objects"),symbols:n("Symbols"),flags:n("Flags"),custom:n("Custom")}};this.picker=p.a.createElement(E.a,{ref:this.emojiPickerRef,set:"apple",showPreview:!1,showSkinTones:!1,onSelect:this.props.onSelect,color:t.palette.primary.dark,i18n:c,native:Object(L.r)(),style:{width:338,overflowX:"hidden",position:"absolute",left:0,top:0}}),this.stickersPicker=p.a.createElement(W,{ref:this.stickersPickerRef,onSelect:this.handleStickerSend,onPreview:this.handleStickerPreview,style:{position:"absolute",left:338,top:0}}),this.gifsPicker=p.a.createElement(J,{ref:this.gifsPickerRef,onSelect:this.handleGifSend,onPreview:this.handleGifPreview,style:{width:338,overflowX:"hidden",position:"absolute",left:676,top:0}})}return p.a.createElement(p.a.Fragment,null,p.a.createElement("link",{rel:"stylesheet",type:"text/css",href:"dark"===t.palette.type?"emoji-mart.dark.css":"emoji-mart.light.css"}),p.a.createElement(w.a,{className:"inputbox-icon-button","aria-label":"Emoticon",onMouseEnter:this.handleButtonMouseEnter,onMouseLeave:this.handleButtonMouseLeave},p.a.createElement(g.a,null)),p.a.createElement("div",{className:h()("emoji-picker-root",{"emoji-picker-root-opened":i}),onMouseEnter:this.handlePaperMouseEnter,onMouseLeave:this.handlePaperMouseLeave},p.a.createElement("div",{className:h()("emoji-picker-content",{"emoji-picker-content-stickers":1===r},{"emoji-picker-content-gifs":2===r})},this.picker,this.stickersPicker,this.gifsPicker),p.a.createElement("div",{className:"emoji-picker-header"},p.a.createElement(b.a,{color:0===r?"primary":"default",className:"emoji-picker-header-button",onClick:this.handleEmojiClick},n("Emoji")),p.a.createElement(b.a,{color:1===r?"primary":"default",className:"emoji-picker-header-button",onClick:this.handleStickersClick},n("AccDescrStickers")),p.a.createElement(b.a,{color:2===r?"primary":"default",className:"emoji-picker-header-button",onClick:this.handleGifsClick},n("AttachGif")))),Boolean(o)&&p.a.createElement(j.a,{sticker:o}),Boolean(s)&&p.a.createElement(y,{animation:s}))}}]),t}(p.a.Component)),Q=Object(k.a)(Object(S.d)(),v.a);t.default=Q(q)}}]);
//# sourceMappingURL=7.7a44d655.chunk.js.map