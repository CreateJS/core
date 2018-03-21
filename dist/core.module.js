/**
 * @license
 * Core
 * Visit https://createjs.com for documentation, updates and examples.
 *
 * Copyright (c) 2017 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
class Event {
  constructor(type, bubbles = false, cancelable = false) {
    this.type = type;
    this.target = null;
    this.currentTarget = null;
    this.eventPhase = 0;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.timeStamp = new Date().getTime();
    this.defaultPrevented = false;
    this.propagationStopped = false;
    this.immediatePropagationStopped = false;
    this.removed = false;
  }
  preventDefault() {
    this.defaultPrevented = this.cancelable;
    return this;
  }
  stopPropagation() {
    this.propagationStopped = true;
    return this;
  }
  stopImmediatePropagation() {
    this.immediatePropagationStopped = this.propagationStopped = true;
    return this;
  }
  remove() {
    this.removed = true;
    return this;
  }
  clone() {
    const event = new Event(this.type, this.bubbles, this.cancelable);
    for (let n in this) {
      if (this.hasOwnProperty(n)) {
        event[n] = this[n];
      }
    }
    return event;
  }
  set(props) {
    for (let n in props) {
      this[n] = props[n];
    }
    return this;
  }
  toString() {
    return `[${this.constructor.name} (type=${this.type})]`;
  }
}

class EventDispatcher {
  static initialize(target) {
    const p = EventDispatcher.prototype;
    target.addEventListener = p.addEventListener;
    target.on = p.on;
    target.removeEventListener = target.off = p.removeEventListener;
    target.removeAllEventListeners = p.removeAllEventListeners;
    target.hasEventListener = p.hasEventListener;
    target.dispatchEvent = p.dispatchEvent;
    target._dispatchEvent = p._dispatchEvent;
    target.willTrigger = p.willTrigger;
  }
  constructor() {
    this._listeners = null;
    this._captureListeners = null;
  }
  addEventListener(type, listener, useCapture = false) {
    let listeners;
    if (useCapture) {
      listeners = this._captureListeners = this._captureListeners || {};
    } else {
      listeners = this._listeners = this._listeners || {};
    }
    let arr = listeners[type];
    if (arr) {
      this.removeEventListener(type, listener, useCapture);
      arr = listeners[type];
    }
    if (arr) {
      arr.push(listener);
    } else {
      listeners[type] = [ listener ];
    }
    return listener;
  }
  on(type, listener, scope = null, once = false, data = {}, useCapture = false) {
    if (listener.handleEvent) {
      scope = scope || listener;
      listener = listener.handleEvent;
    }
    scope = scope || this;
    return this.addEventListener(type, evt => {
      listener.call(scope, evt, data);
      once && evt.remove();
    }, useCapture);
  }
  removeEventListener(type, listener, useCapture = false) {
    const listeners = useCapture ? this._captureListeners : this._listeners;
    if (!listeners) {
      return;
    }
    const arr = listeners[type];
    if (!arr) {
      return;
    }
    const l = arr.length;
    for (let i = 0; i < l; i++) {
      if (arr[i] === listener) {
        if (l === 1) {
          delete listeners[type];
        } else {
          arr.splice(i, 1);
        }
        break;
      }
    }
  }
  off(type, listener, useCapture = false) {
    this.removeEventListener(type, listener, useCapture);
  }
  removeAllEventListeners(type = null) {
    if (type) {
      if (this._listeners) {
        delete this._listeners[type];
      }
      if (this._captureListeners) {
        delete this._captureListeners[type];
      }
    } else {
      this._listeners = this._captureListeners = null;
    }
  }
  dispatchEvent(eventObj, bubbles = false, cancelable = false) {
    if (typeof eventObj === "string") {
      const listeners = this._listeners;
      if (!bubbles && (!listeners || !listeners[eventObj])) {
        return true;
      }
      eventObj = new Event(eventObj, bubbles, cancelable);
    } else if (eventObj.target && eventObj.clone) {
      eventObj = eventObj.clone();
    }
    try {
      eventObj.target = this;
    } catch (e) {}
    if (!eventObj.bubbles || !this.parent) {
      this._dispatchEvent(eventObj, 2);
    } else {
      let top = this;
      const list = [ top ];
      while (top.parent) {
        list.push(top = top.parent);
      }
      const l = list.length;
      let i;
      for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
        list[i]._dispatchEvent(eventObj, 1 + (i == 0));
      }
      for (i = 1; i < l && !eventObj.propagationStopped; i++) {
        list[i]._dispatchEvent(eventObj, 3);
      }
    }
    return !eventObj.defaultPrevented;
  }
  hasEventListener(type) {
    const listeners = this._listeners, captureListeners = this._captureListeners;
    return !!(listeners && listeners[type] || captureListeners && captureListeners[type]);
  }
  willTrigger(type) {
    let o = this;
    while (o) {
      if (o.hasEventListener(type)) {
        return true;
      }
      o = o.parent;
    }
    return false;
  }
  toString() {
    return `[${this.constructor.name + this.name ? ` ${this.name}` : ""}]`;
  }
  _dispatchEvent(eventObj, eventPhase) {
    const listeners = eventPhase === 1 ? this._captureListeners : this._listeners;
    if (eventObj && listeners) {
      let arr = listeners[eventObj.type];
      let l;
      if (!arr || (l = arr.length) === 0) {
        return;
      }
      try {
        eventObj.currentTarget = this;
      } catch (e) {}
      try {
        eventObj.eventPhase = eventPhase;
      } catch (e) {}
      eventObj.removed = false;
      arr = arr.slice();
      for (let i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
        let o = arr[i];
        if (o.handleEvent) {
          o.handleEvent(eventObj);
        } else {
          o(eventObj);
        }
        if (eventObj.removed) {
          this.off(eventObj.type, o, eventPhase === 1);
          eventObj.removed = false;
        }
      }
    }
  }
}

class Ticker extends EventDispatcher {
  static get RAF_SYNCHED() {
    return "synched";
  }
  static get RAF() {
    return "raf";
  }
  static get TIMEOUT() {
    return "timeout";
  }
  constructor(name) {
    super();
    this.name = name;
    this.timingMode = Ticker.TIMEOUT;
    this.maxDelta = 0;
    this.paused = false;
    this._inited = false;
    this._startTime = 0;
    this._pausedTime = 0;
    this._ticks = 0;
    this._pausedTicks = 0;
    this._interval = 50;
    this._lastTime = 0;
    this._times = null;
    this._tickTimes = null;
    this._timerId = null;
    this._raf = true;
  }
  get interval() {
    return this._interval;
  }
  set interval(interval) {
    this._interval = interval;
    if (!this._inited) {
      return;
    }
    this._setupTick();
  }
  get framerate() {
    return 1e3 / this._interval;
  }
  set framerate(framerate) {
    this.interval = 1e3 / framerate;
  }
  init() {
    if (this._inited) {
      return;
    }
    this._inited = true;
    this._times = [];
    this._tickTimes = [];
    this._startTime = this._getTime();
    this._times.push(this._lastTime = 0);
    this._setupTick();
  }
  reset() {
    if (this._raf) {
      let f = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
      f && f(this._timerId);
    } else {
      clearTimeout(this._timerId);
    }
    this.removeAllEventListeners("tick");
    this._timerId = this._times = this._tickTimes = null;
    this._startTime = this._lastTime = this._ticks = 0;
    this._inited = false;
  }
  addEventListener(type, listener, useCapture) {
    !this._inited && this.init();
    return super.addEventListener(type, listener, useCapture);
  }
  getMeasuredTickTime(ticks = null) {
    const times = this._tickTimes;
    if (!times || times.length < 1) {
      return -1;
    }
    ticks = Math.min(times.length, ticks || this.framerate | 0);
    return times.reduce((a, b) => a + b, 0) / ticks;
  }
  getMeasuredFPS(ticks = null) {
    const times = this._times;
    if (!times || times.length < 2) {
      return -1;
    }
    ticks = Math.min(times.length - 1, ticks || this.framerate | 0);
    return 1e3 / ((times[0] - times[ticks]) / ticks);
  }
  getTime(runTime = false) {
    return this._startTime ? this._getTime() - (runTime ? this._pausedTime : 0) : -1;
  }
  getEventTime(runTime = false) {
    return this._startTime ? (this._lastTime || this._startTime) - (runTime ? this._pausedTime : 0) : -1;
  }
  getTicks(pauseable = false) {
    return this._ticks - (pauseable ? this._pausedTicks : 0);
  }
  _handleSynch() {
    this._timerId = null;
    this._setupTick();
    if (this._getTime() - this._lastTime >= (this._interval - 1) * .97) {
      this._tick();
    }
  }
  _handleRAF() {
    this._timerId = null;
    this._setupTick();
    this._tick();
  }
  _handleTimeout() {
    this._timerId = null;
    this._setupTick();
    this._tick();
  }
  _setupTick() {
    if (this._timerId != null) {
      return;
    }
    const mode = this.timingMode || this._raf && Ticker.RAF;
    if (mode === Ticker.RAF_SYNCHED || mode === Ticker.RAF) {
      const f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
      if (f) {
        this._timerId = f(mode === Ticker.RAF ? this._handleRAF.bind(this) : this._handleSynch.bind(this));
        this._raf = true;
        return;
      }
    }
    this._raf = false;
    this._timerId = setTimeout(this._handleTimeout.bind(this), this._interval);
  }
  _tick() {
    const paused = this.paused, time = this._getTime(), elapsedTime = time - this._lastTime;
    this._lastTime = time;
    this._ticks++;
    if (paused) {
      this._pausedTicks++;
      this._pausedTime += elapsedTime;
    }
    if (this.hasEventListener("tick")) {
      const event = new Event("tick");
      const maxDelta = this.maxDelta;
      event.delta = maxDelta && elapsedTime > maxDelta ? maxDelta : elapsedTime;
      event.paused = paused;
      event.time = time;
      event.runTime = time - this._pausedTime;
      this.dispatchEvent(event);
    }
    this._tickTimes.unshift(this._getTime() - time);
    while (this._tickTimes.length > 100) {
      this._tickTimes.pop();
    }
    this._times.unshift(time);
    while (this._times.length > 100) {
      this._times.pop();
    }
  }
  _getTime() {
    const now = window.performance && window.performance.now;
    return (now && now.call(performance) || new Date().getTime()) - this._startTime;
  }
  static on(type, listener, scope, once, data, useCapture) {
    return _instance.on(type, listener, scope, once, data, useCapture);
  }
  static removeEventListener(type, listener, useCapture) {
    _instance.removeEventListener(type, listener, useCapture);
  }
  static off(type, listener, useCapture) {
    _instance.off(type, listener, useCapture);
  }
  static removeAllEventListeners(type) {
    _instance.removeAllEventListeners(type);
  }
  static dispatchEvent(eventObj, bubbles, cancelable) {
    return _instance.dispatchEvent(eventObj, bubbles, cancelable);
  }
  static hasEventListener(type) {
    return _instance.hasEventListener(type);
  }
  static willTrigger(type) {
    return _instance.willTrigger(type);
  }
  static toString() {
    return _instance.toString();
  }
  static init() {
    _instance.init();
  }
  static reset() {
    _instance.reset();
  }
  static addEventListener(type, listener, useCapture) {
    _instance.addEventListener(type, listener, useCapture);
  }
  static getMeasuredTickTime(ticks) {
    return _instance.getMeasuredTickTime(ticks);
  }
  static getMeasuredFPS(ticks) {
    return _instance.getMeasuredFPS(ticks);
  }
  static getTime(runTime) {
    return _instance.getTime(runTime);
  }
  static getEventTime(runTime) {
    return _instance.getEventTime(runTime);
  }
  static getTicks(pauseable) {
    return _instance.getTicks(pauseable);
  }
  static get interval() {
    return _instance.interval;
  }
  static set interval(interval) {
    _instance.interval = interval;
  }
  static get framerate() {
    return _instance.framerate;
  }
  static set framerate(framerate) {
    _instance.framerate = framerate;
  }
  static get name() {
    return _instance.name;
  }
  static set name(name) {
    _instance.name = name;
  }
  static get timingMode() {
    return _instance.timingMode;
  }
  static set timingMode(timingMode) {
    _instance.timingMode = timingMode;
  }
  static get maxDelta() {
    return _instance.maxDelta;
  }
  static set maxDelta(maxDelta) {
    _instance.maxDelta = maxDelta;
  }
  static get paused() {
    return _instance.paused;
  }
  static set paused(paused) {
    _instance.paused = paused;
  }
}

const _instance = new Ticker("createjs.global");

export { Event, EventDispatcher, Ticker };

export { Event, EventDispatcher, Ticker };

var cjs = window.createjs = window.createjs || {};

var v = cjs.v = cjs.v || {};

v.core = "2.0.0";
//# sourceMappingURL=maps/core.module.js.map
