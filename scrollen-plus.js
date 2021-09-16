/*
MIT License

Copyright (c) 2021 Saleh Kawaf Kulla

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

"use strict";
const MiniScroll = (function () {
    let cont, scrl, opts, vBar = null, hBar = null;
    const defaults = {
        vTrackClass: "track-v",
        vHandleClass: "handle-v",
        hTrackClass: "track-h",
        hHandleClass: "handle-h",
        trim: 3
    };
    class MiniScroll {
        constructor(element, options = {}) {
            cont = this.notNull(element, "Container");
            scrl = this.notNull(cont.querySelector(".scroll-content"), "Scroll Content");
            opts = Object.assign(Object.assign({}, defaults), options);
            this.init();
        }
        resize() {
            this.eachBar('resize');
        }
        enableVScroll() {
            if (vBar !== null)
                return;
            vBar = new VBar();
            this.resize();
        }
        enableHScroll() {
            if (hBar !== null)
                return;
            hBar = new HBar();
            this.resize();
        }
        notNull(obj, name) {
            if (obj === null)
                throw new ReferenceError(name + " cannot be null");
            return obj;
        }
        init() {
            scrl.addEventListener("scroll", this.scroll.bind(this));
            window.addEventListener("resize", this.resize.bind(this));
        }
        scroll() {
            this.eachBar('scroll');
        }
        eachBar(methodName) {
            if (vBar !== null)
                vBar[methodName]();
            if (hBar !== null)
                hBar[methodName]();
        }
    }
    let Alignment;
    (function (Alignment) {
        Alignment["v"] = "v";
        Alignment["h"] = "h";
    })(Alignment || (Alignment = {}));
    class Bar {
        constructor(align, _state) {
            this.align = align;
            this._state = _state;
            this._dragging = false;
            this.build();
            this.updateDisplayState();
            this.updateBoundingPos();
        }
        get track() {
            return this._track;
        }
        get handle() {
            return this._handle;
        }
        build() {
            this._track = document.createElement("div");
            this._track.classList.add(opts[this.align + "TrackClass"]);
            cont.appendChild(this._track);
            this._handle = document.createElement("div");
            this._handle.classList.add(opts[this.align + "HandleClass"]);
            this._track.appendChild(this._handle);
            this._track.addEventListener("click", this.jump.bind(this));
            this._handle.addEventListener("mousedown", this.startDrag.bind(this));
            document.body.addEventListener("mousemove", this.drag.bind(this));
            document.body.addEventListener("mouseup", this.endDrag.bind(this));
        }
        resize() {
            this.updateDisplayState();
            const oheight = this.offsetHeight();
            const sHeight = this.scrollHeight();
            const pcg = oheight * 100 / sHeight;
            const val = oheight != sHeight
                ? oheight * pcg / 100 - opts.trim * 2
                : oheight - opts.trim * 2;
            cont.style.setProperty(this.sizeProp, val + "px");
        }
        scroll() {
            const pos = (this.scrollPos() / this.scrollHeight()) * 100;
            cont.style.setProperty(this.posProp, pos + '%');
            this.updateBoundingPos();
        }
        updateDisplayState() {
            switch (this._state) {
                case "auto":
                    this._track.style.display =
                        this.offsetHeight() == this.scrollHeight() ? "none" : "block";
                    break;
                case "scroll":
                    this._track.style.display = "block";
                    break;
                default:
                    this._track.style.display = "none";
                    return false;
            }
            return true;
        }
        startDrag(e) {
            this._dragging = true;
            this.position = this.pagePos(e);
            scrl.classList.add("dragging");
        }
        drag(e) {
            if (!this._dragging)
                return;
            const delta = this.pagePos(e) - this.position;
            const distance = (delta / this.offsetHeight()) * this.scrollHeight();
            this.scrollTo(distance);
        }
        endDrag() {
            this._dragging = false;
            scrl.classList.remove("dragging");
        }
        jump(e) {
            if (e.target == this.handle || this.handle.contains(e.target))
                return;
            const delta = this.pagePos(e) - this.position;
            const distance = (delta / this.offsetHeight()) * this.scrollHeight();
            this.smoothScrollTo(distance);
        }
    }
    class VBar extends Bar {
        constructor() {
            const state = getComputedStyle(scrl).overflowY;
            super(Alignment.v, state);
            this.posProp = "--scroll-top";
            this.sizeProp = "--handle-height";
        }
        resize() {
            super.resize();
            const style = getComputedStyle(cont);
            this.absHeight = this.track.offsetHeight -
                (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)) / 2;
        }
        scrollTo(pos) {
            scrl.scrollTo(scrl.scrollLeft, pos);
        }
        smoothScrollTo(pos) {
            scrl.scrollTo({
                left: scrl.scrollLeft,
                top: pos,
                behavior: "smooth"
            });
        }
        offsetHeight() {
            return this.absHeight;
        }
        scrollHeight() {
            return scrl.scrollHeight;
        }
        pagePos(event) {
            return event.pageY;
        }
        scrollPos() {
            return scrl.scrollTop;
        }
        updateBoundingPos() {
            const rect = this.track.getBoundingClientRect();
            this.position = rect.top + this.handle.offsetHeight / 2;
        }
    }
    class HBar extends Bar {
        constructor() {
            const state = getComputedStyle(scrl).overflowX;
            super(Alignment.h, state);
            this.posProp = "--scroll-left";
            this.sizeProp = "--handle-width";
        }
        resize() {
            super.resize();
            const style = getComputedStyle(cont);
            this.absWidth = this.track.offsetWidth -
                (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) / 2;
        }
        scrollTo(pos) {
            scrl.scrollTo(pos, scrl.scrollTop);
        }
        smoothScrollTo(pos) {
            scrl.scrollTo({
                left: pos,
                top: scrl.scrollTop,
                behavior: "smooth"
            });
        }
        offsetHeight() {
            return this.absWidth;
        }
        scrollHeight() {
            return scrl.scrollWidth;
        }
        pagePos(event) {
            return event.pageX;
        }
        scrollPos() {
            return scrl.scrollLeft;
        }
        updateBoundingPos() {
            const rect = this.track.getBoundingClientRect();
            this.position = rect.left + this.handle.offsetWidth / 2;
        }
    }
    return MiniScroll;
})();