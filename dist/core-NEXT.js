/**
 * @license Core
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

(function (exports) {
	'use strict';

	var Event =
	function () {
	  function Event(type, bubbles, cancelable) {
	    if (bubbles === void 0) {
	      bubbles = false;
	    }
	    if (cancelable === void 0) {
	      cancelable = false;
	    }
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
	  var _proto = Event.prototype;
	  _proto.preventDefault = function preventDefault() {
	    this.defaultPrevented = this.cancelable;
	    return this;
	  };
	  _proto.stopPropagation = function stopPropagation() {
	    this.propagationStopped = true;
	    return this;
	  };
	  _proto.stopImmediatePropagation = function stopImmediatePropagation() {
	    this.immediatePropagationStopped = this.propagationStopped = true;
	    return this;
	  };
	  _proto.remove = function remove() {
	    this.removed = true;
	    return this;
	  };
	  _proto.clone = function clone() {
	    var event = new Event(this.type, this.bubbles, this.cancelable);
	    for (var n in this) {
	      if (this.hasOwnProperty(n)) {
	        event[n] = this[n];
	      }
	    }
	    return event;
	  };
	  _proto.set = function set(props) {
	    for (var n in props) {
	      this[n] = props[n];
	    }
	    return this;
	  };
	  _proto.toString = function toString() {
	    return "[" + this.constructor.name + " (type=" + this.type + ")]";
	  };
	  return Event;
	}();

	var EventDispatcher =
	function () {
	  EventDispatcher.initialize = function initialize(target) {
	    var p = EventDispatcher.prototype;
	    target.addEventListener = p.addEventListener;
	    target.on = p.on;
	    target.removeEventListener = target.off = p.removeEventListener;
	    target.removeAllEventListeners = p.removeAllEventListeners;
	    target.hasEventListener = p.hasEventListener;
	    target.dispatchEvent = p.dispatchEvent;
	    target._dispatchEvent = p._dispatchEvent;
	    target.willTrigger = p.willTrigger;
	  };
	  function EventDispatcher() {
	    this._listeners = null;
	    this._captureListeners = null;
	  }
	  var _proto = EventDispatcher.prototype;
	  _proto.addEventListener = function addEventListener(type, listener, useCapture) {
	    if (useCapture === void 0) {
	      useCapture = false;
	    }
	    var listeners;
	    if (useCapture) {
	      listeners = this._captureListeners = this._captureListeners || {};
	    } else {
	      listeners = this._listeners = this._listeners || {};
	    }
	    var arr = listeners[type];
	    if (arr) {
	      this.removeEventListener(type, listener, useCapture);
	      arr = listeners[type];
	    }
	    if (arr) {
	      arr.push(listener);
	    } else {
	      listeners[type] = [listener];
	    }
	    return listener;
	  };
	  _proto.on = function on(type, listener, scope, once, data, useCapture) {
	    if (scope === void 0) {
	      scope = null;
	    }
	    if (once === void 0) {
	      once = false;
	    }
	    if (data === void 0) {
	      data = {};
	    }
	    if (useCapture === void 0) {
	      useCapture = false;
	    }
	    if (listener.handleEvent) {
	      scope = scope || listener;
	      listener = listener.handleEvent;
	    }
	    scope = scope || this;
	    return this.addEventListener(type, function (evt) {
	      listener.call(scope, evt, data);
	      once && evt.remove();
	    }, useCapture);
	  };
	  _proto.removeEventListener = function removeEventListener(type, listener, useCapture) {
	    if (useCapture === void 0) {
	      useCapture = false;
	    }
	    var listeners = useCapture ? this._captureListeners : this._listeners;
	    if (!listeners) {
	      return;
	    }
	    var arr = listeners[type];
	    if (!arr) {
	      return;
	    }
	    var l = arr.length;
	    for (var i = 0; i < l; i++) {
	      if (arr[i] === listener) {
	        if (l === 1) {
	          delete listeners[type];
	        }
	        else {
	            arr.splice(i, 1);
	          }
	        break;
	      }
	    }
	  };
	  _proto.off = function off(type, listener, useCapture) {
	    if (useCapture === void 0) {
	      useCapture = false;
	    }
	    this.removeEventListener(type, listener, useCapture);
	  };
	  _proto.removeAllEventListeners = function removeAllEventListeners(type) {
	    if (type === void 0) {
	      type = null;
	    }
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
	  };
	  _proto.dispatchEvent = function dispatchEvent(eventObj, bubbles, cancelable) {
	    if (bubbles === void 0) {
	      bubbles = false;
	    }
	    if (cancelable === void 0) {
	      cancelable = false;
	    }
	    if (typeof eventObj === "string") {
	      var listeners = this._listeners;
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
	      var top = this;
	      var list = [top];
	      while (top.parent) {
	        list.push(top = top.parent);
	      }
	      var l = list.length;
	      var i;
	      for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
	        list[i]._dispatchEvent(eventObj, 1 + (i == 0));
	      }
	      for (i = 1; i < l && !eventObj.propagationStopped; i++) {
	        list[i]._dispatchEvent(eventObj, 3);
	      }
	    }
	    return !eventObj.defaultPrevented;
	  };
	  _proto.hasEventListener = function hasEventListener(type) {
	    var listeners = this._listeners,
	        captureListeners = this._captureListeners;
	    return !!(listeners && listeners[type] || captureListeners && captureListeners[type]);
	  };
	  _proto.willTrigger = function willTrigger(type) {
	    var o = this;
	    while (o) {
	      if (o.hasEventListener(type)) {
	        return true;
	      }
	      o = o.parent;
	    }
	    return false;
	  };
	  _proto.toString = function toString() {
	    return "[" + (this.constructor.name + this.name ? " " + this.name : "") + "]";
	  };
	  _proto._dispatchEvent = function _dispatchEvent(eventObj, eventPhase) {
	    var listeners = eventPhase === 1 ? this._captureListeners : this._listeners;
	    if (eventObj && listeners) {
	      var arr = listeners[eventObj.type];
	      var l;
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
	      for (var i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
	        var o = arr[i];
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
	  };
	  return EventDispatcher;
	}();

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	var Ticker =
	function (_EventDispatcher) {
	  _inheritsLoose(Ticker, _EventDispatcher);
	  _createClass(Ticker, null, [{
	    key: "RAF_SYNCHED",
	    get: function get() {
	      return "synched";
	    }
	  }, {
	    key: "RAF",
	    get: function get() {
	      return "raf";
	    }
	  }, {
	    key: "TIMEOUT",
	    get: function get() {
	      return "timeout";
	    }
	  }]);
	  function Ticker(name) {
	    var _this;
	    _this = _EventDispatcher.call(this) || this;
	    _this.name = name;
	    _this.timingMode = Ticker.TIMEOUT;
	    _this.maxDelta = 0;
	    _this.paused = false;
	    _this._inited = false;
	    _this._startTime = 0;
	    _this._pausedTime = 0;
	    _this._ticks = 0;
	    _this._pausedTicks = 0;
	    _this._interval = 50;
	    _this._lastTime = 0;
	    _this._times = null;
	    _this._tickTimes = null;
	    _this._timerId = null;
	    _this._raf = true;
	    return _this;
	  }
	  var _proto = Ticker.prototype;
	  _proto.init = function init() {
	    if (this._inited) {
	      return;
	    }
	    this._inited = true;
	    this._times = [];
	    this._tickTimes = [];
	    this._startTime = this._getTime();
	    this._times.push(this._lastTime = 0);
	    this._setupTick();
	  };
	  _proto.reset = function reset() {
	    if (this._raf) {
	      var f = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
	      f && f(this._timerId);
	    } else {
	      clearTimeout(this._timerId);
	    }
	    this.removeAllEventListeners("tick");
	    this._timerId = this._times = this._tickTimes = null;
	    this._startTime = this._lastTime = this._ticks = 0;
	    this._inited = false;
	  };
	  _proto.addEventListener = function addEventListener(type, listener, useCapture) {
	    !this._inited && this.init();
	    return _EventDispatcher.prototype.addEventListener.call(this, type, listener, useCapture);
	  };
	  _proto.getMeasuredTickTime = function getMeasuredTickTime(ticks) {
	    if (ticks === void 0) {
	      ticks = null;
	    }
	    var times = this._tickTimes;
	    if (!times || times.length < 1) {
	      return -1;
	    }
	    ticks = Math.min(times.length, ticks || this.framerate | 0);
	    return times.reduce(function (a, b) {
	      return a + b;
	    }, 0) / ticks;
	  };
	  _proto.getMeasuredFPS = function getMeasuredFPS(ticks) {
	    if (ticks === void 0) {
	      ticks = null;
	    }
	    var times = this._times;
	    if (!times || times.length < 2) {
	      return -1;
	    }
	    ticks = Math.min(times.length - 1, ticks || this.framerate | 0);
	    return 1000 / ((times[0] - times[ticks]) / ticks);
	  };
	  _proto.getTime = function getTime(runTime) {
	    if (runTime === void 0) {
	      runTime = false;
	    }
	    return this._startTime ? this._getTime() - (runTime ? this._pausedTime : 0) : -1;
	  };
	  _proto.getEventTime = function getEventTime(runTime) {
	    if (runTime === void 0) {
	      runTime = false;
	    }
	    return this._startTime ? (this._lastTime || this._startTime) - (runTime ? this._pausedTime : 0) : -1;
	  };
	  _proto.getTicks = function getTicks(pauseable) {
	    if (pauseable === void 0) {
	      pauseable = false;
	    }
	    return this._ticks - (pauseable ? this._pausedTicks : 0);
	  };
	  _proto._handleSynch = function _handleSynch() {
	    this._timerId = null;
	    this._setupTick();
	    if (this._getTime() - this._lastTime >= (this._interval - 1) * 0.97) {
	      this._tick();
	    }
	  };
	  _proto._handleRAF = function _handleRAF() {
	    this._timerId = null;
	    this._setupTick();
	    this._tick();
	  };
	  _proto._handleTimeout = function _handleTimeout() {
	    this._timerId = null;
	    this._setupTick();
	    this._tick();
	  };
	  _proto._setupTick = function _setupTick() {
	    if (this._timerId != null) {
	      return;
	    }
	    var mode = this.timingMode || this._raf && Ticker.RAF;
	    if (mode === Ticker.RAF_SYNCHED || mode === Ticker.RAF) {
	      var f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
	      if (f) {
	        this._timerId = f(mode === Ticker.RAF ? this._handleRAF.bind(this) : this._handleSynch.bind(this));
	        this._raf = true;
	        return;
	      }
	    }
	    this._raf = false;
	    this._timerId = setTimeout(this._handleTimeout.bind(this), this._interval);
	  };
	  _proto._tick = function _tick() {
	    var paused = this.paused,
	        time = this._getTime(),
	        elapsedTime = time - this._lastTime;
	    this._lastTime = time;
	    this._ticks++;
	    if (paused) {
	      this._pausedTicks++;
	      this._pausedTime += elapsedTime;
	    }
	    if (this.hasEventListener("tick")) {
	      var event = new Event("tick");
	      var maxDelta = this.maxDelta;
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
	  };
	  _proto._getTime = function _getTime() {
	    var now = window.performance && window.performance.now;
	    return (now && now.call(performance) || new Date().getTime()) - this._startTime;
	  };
	  Ticker.on = function on(type, listener, scope, once, data, useCapture) {
	    return _instance.on(type, listener, scope, once, data, useCapture);
	  };
	  Ticker.removeEventListener = function removeEventListener(type, listener, useCapture) {
	    _instance.removeEventListener(type, listener, useCapture);
	  };
	  Ticker.off = function off(type, listener, useCapture) {
	    _instance.off(type, listener, useCapture);
	  };
	  Ticker.removeAllEventListeners = function removeAllEventListeners(type) {
	    _instance.removeAllEventListeners(type);
	  };
	  Ticker.dispatchEvent = function dispatchEvent(eventObj, bubbles, cancelable) {
	    return _instance.dispatchEvent(eventObj, bubbles, cancelable);
	  };
	  Ticker.hasEventListener = function hasEventListener(type) {
	    return _instance.hasEventListener(type);
	  };
	  Ticker.willTrigger = function willTrigger(type) {
	    return _instance.willTrigger(type);
	  };
	  Ticker.toString = function toString() {
	    return _instance.toString();
	  };
	  Ticker.init = function init() {
	    _instance.init();
	  };
	  Ticker.reset = function reset() {
	    _instance.reset();
	  };
	  Ticker.addEventListener = function addEventListener(type, listener, useCapture) {
	    _instance.addEventListener(type, listener, useCapture);
	  };
	  Ticker.getMeasuredTickTime = function getMeasuredTickTime(ticks) {
	    return _instance.getMeasuredTickTime(ticks);
	  };
	  Ticker.getMeasuredFPS = function getMeasuredFPS(ticks) {
	    return _instance.getMeasuredFPS(ticks);
	  };
	  Ticker.getTime = function getTime(runTime) {
	    return _instance.getTime(runTime);
	  };
	  Ticker.getEventTime = function getEventTime(runTime) {
	    return _instance.getEventTime(runTime);
	  };
	  Ticker.getTicks = function getTicks(pauseable) {
	    return _instance.getTicks(pauseable);
	  };
	  _createClass(Ticker, [{
	    key: "interval",
	    get: function get() {
	      return this._interval;
	    },
	    set: function set(interval) {
	      this._interval = interval;
	      if (!this._inited) {
	        return;
	      }
	      this._setupTick();
	    }
	  }, {
	    key: "framerate",
	    get: function get() {
	      return 1000 / this._interval;
	    },
	    set: function set(framerate) {
	      this.interval = 1000 / framerate;
	    }
	  }], [{
	    key: "interval",
	    get: function get() {
	      return _instance.interval;
	    },
	    set: function set(interval) {
	      _instance.interval = interval;
	    }
	  }, {
	    key: "framerate",
	    get: function get() {
	      return _instance.framerate;
	    },
	    set: function set(framerate) {
	      _instance.framerate = framerate;
	    }
	  }, {
	    key: "name",
	    get: function get() {
	      return _instance.name;
	    },
	    set: function set(name) {
	      _instance.name = name;
	    }
	  }, {
	    key: "timingMode",
	    get: function get() {
	      return _instance.timingMode;
	    },
	    set: function set(timingMode) {
	      _instance.timingMode = timingMode;
	    }
	  }, {
	    key: "maxDelta",
	    get: function get() {
	      return _instance.maxDelta;
	    },
	    set: function set(maxDelta) {
	      _instance.maxDelta = maxDelta;
	    }
	  }, {
	    key: "paused",
	    get: function get() {
	      return _instance.paused;
	    },
	    set: function set(paused) {
	      _instance.paused = paused;
	    }
	  }]);
	  return Ticker;
	}(EventDispatcher);
	var _instance = new Ticker("createjs.global");

	exports.Event = Event;
	exports.EventDispatcher = EventDispatcher;
	exports.Ticker = Ticker;

	var v = exports.versions = exports.versions || {};
	v.core = "NEXT";

}((this.createjs = this.createjs || {})));
//# sourceMappingURL=core-NEXT.js.map
