/**
 * @license CoreJS
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
var createjs = function(exports) {
  "use strict";
  var classCallCheck = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function")
    }
  };
  var createClass = function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor)
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor
    }
  }();
  var inherits = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
  };
  var possibleConstructorReturn = function(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
  };
  /**
   * Contains properties and methods shared by all events for use with {@link core.EventDispatcher}.
   * Note that Event objects are often reused, so you should never
   * rely on an event object's state outside of the call stack it was received in.
   *
   * @memberof core
   * @example
   * const evt = new Event("myEvent");
   * const dispatcher = new EventDispatcher();
   * dispatcher.on("myEvent", event => console.log(event.type));
   * dispatcher.dispatchEvent(evt); // logs "myEvent"
   *
   * @param {string} type The event type.
   * @param {boolean} [bubbles=false] Indicates whether the event will bubble through the display list.
   * @param {boolean} [cancelable=false] Indicates whether the default behaviour of this event can be cancelled.
   */
  var Event = function() {
    function Event(type) {
      var bubbles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      classCallCheck(this, Event);
      /**
       * The type of event.
       * @type string
       */
      this.type = type;
      /**
       * The object that generated an event.
       *
       * @type Object
       * @default null
       * @readonly
       */
      this.target = null;
      /**
       * The current target that a bubbling event is being dispatched from. For non-bubbling events, this will
       * always be the same as target. For example, if childObj.parent = parentObj, and a bubbling event
       * is generated from childObj, then a listener on parentObj would receive the event with
       * target=childObj (the original target) and currentTarget=parentObj (where the listener was added).
       *
       * @type Object
       * @default null
       * @readonly
       */
      this.currentTarget = null;
      /**
       * For bubbling events, this indicates the current event phase:
       * <OL>
       * 	<LI> capture phase: starting from the top parent to the target</LI>
       * 	<LI> at target phase: currently being dispatched from the target</LI>
       * 	<LI> bubbling phase: from the target to the top parent</LI>
       * </OL>
       *
       * @type number
       * @default 0
       * @readonly
       */
      this.eventPhase = 0;
      /**
       * Indicates whether the event will bubble through the display list.
       *
       * @type boolean
       * @readonly
       */
      this.bubbles = bubbles;
      /**
       * Indicates whether the default behaviour of this event can be cancelled via {@link core.Event#preventDefault}.
       *
       * @type boolean
       * @readonly
       */
      this.cancelable = cancelable;
      /**
       * The epoch time at which this event was created.
       *
       * @type number
       * @readonly
       */
      this.timeStamp = (new Date).getTime();
      /**
       * Indicates if {@link core.Event#preventDefault} has been called on this event.
       *
       * @type boolean
       * @default false
       * @readonly
       */
      this.defaultPrevented = false;
      /**
       * Indicates if {@link core.Event#stopPropagation} or {@link core.Event#stopImmediatePropagation} has been called on this event.
       *
       * @type boolean
       * @default false
       * @readonly
       */
      this.propagationStopped = false;
      /**
       * Indicates if {@link core.Event#stopImmediatePropagation} has been called on this event.
       *
       * @type boolean
       * @default false
       * @readonly
       */
      this.immediatePropagationStopped = false;
      /**
       * Indicates if {@link core.Event#remove} has been called on this event.
       *
       * @type boolean
       * @default false
       * @readonly
       */
      this.removed = false
    }
    /**
     * Sets {@link core.Event#defaultPrevented} to true if the event is cancelable.
     * Mirrors the DOM level 2 event standard. In general, cancelable events that have `preventDefault()` called will
     * cancel the default behaviour associated with the event.
     * @return {core.Event} this, chainable
     */
    Event.prototype.preventDefault = function preventDefault() {
      this.defaultPrevented = this.cancelable;
      return this
    };
    /**
     * Sets {@link core.Event#propagationStopped} to true.
     * Mirrors the DOM event standard.
     * @return {core.Event} this, chainable
     */
    Event.prototype.stopPropagation = function stopPropagation() {
      this.propagationStopped = true;
      return this
    };
    /**
     * Sets {@link core.Event#propagationStopped} and {@link core.Event#immediatePropagationStopped} to true.
     * Mirrors the DOM event standard.
     * @return {core.Event} this, chainable
     */
    Event.prototype.stopImmediatePropagation = function stopImmediatePropagation() {
      this.immediatePropagationStopped = this.propagationStopped = true;
      return this
    };
    /**
     * Causes the active listener to be removed via removeEventListener();
     *
     * @example
     * myBtn.addEventListener("click", event => {
     *   event.remove(); // removes this listener.
     * });
     *
     * @return {core.Event} this, chainable
     */
    Event.prototype.remove = function remove() {
      this.removed = true;
      return this
    };
    /**
     * Returns a clone of the Event instance.
     *
     * @return {core.Event} a clone of the Event instance.
     */
    Event.prototype.clone = function clone() {
      var event = new Event(this.type, this.bubbles, this.cancelable);
      for (var n in this) {
        if (this.hasOwnProperty(n)) {
          event[n] = this[n]
        }
      }
      return event
    };
    /**
     * Provides a return {core.Event} this, chainable shortcut method for setting a number of properties on the instance.
     *
     * @param {Object} props A generic object containing properties to copy to the instance.
     * @return {core.Event} this, chainable
     */
    Event.prototype.set = function set(props) {
      for (var n in props) {
        this[n] = props[n]
      }
      return this
    };
    /**
     * Returns a string representation of this object.
     *
     * @return {string} A string representation of the instance.
     */
    Event.prototype.toString = function toString() {
      return "[" + this.constructor.name + " (type=" + this.type + ")]"
    };
    return Event
  }();
  /**
   * EventDispatcher provides methods for managing queues of event listeners and dispatching events.
   *
   * You can either extend EventDispatcher or mix its methods into an existing prototype or instance by using the
   * EventDispatcher {@link core.EventDispatcher.initialize} method.
   *
   * Together with the CreateJS Event class, EventDispatcher provides an extended event model that is based on the
   * DOM Level 2 event model, including addEventListener, removeEventListener, and dispatchEvent. It supports
   * bubbling / capture, preventDefault, stopPropagation, stopImmediatePropagation, and handleEvent.
   *
   * EventDispatcher also exposes a {@link core.EventDispatcher#on} method, which makes it easier
   * to create scoped listeners, listeners that only run once, and listeners with associated arbitrary data. The
   * {@link core.EventDispatcher#off} method is merely an alias to {@link core.EventDispatcher#removeEventListener}.
   *
   * Another addition to the DOM Level 2 model is the {@link core.EventDispatcher#removeAllEventListeners}
   * method, which can be used to listeners for all events, or listeners for a specific event. The Event object also
   * includes a {@link core.Event#remove} method which removes the active listener.
   *
   * @memberof core
   * @example
   * // add EventDispatcher capabilities to the "MyClass" class.
   * EventDispatcher.initialize(MyClass.prototype);
   *
   * // Add an event.
   * instance.addEventListener("eventName", event => console.log(event.target + " was clicked."));
   *
   * // scope ("this") can be be a challenge with events.
   * // using the {@link core.EventDispatcher#on} method to subscribe to events simplifies this.
   * instance.addEventListener("click", event => console.log(instance === this)); // false, scope is ambiguous.
   * instance.on("click", event => console.log(instance === this)); // true, `on` uses dispatcher scope by default.
   */
  var EventDispatcher = function() {
    /**
     * Static initializer to mix EventDispatcher methods into a target object or prototype.
     *
     * @static
     * @example
     * EventDispatcher.initialize(MyClass.prototype); // add to the prototype of the class
     * EventDispatcher.initialize(myInstance); // add to a specific instance
     *
     * @param {Object} target The target object to inject EventDispatcher methods into.
     */
    EventDispatcher.initialize = function initialize(target) {
      var p = EventDispatcher.prototype;
      target.addEventListener = p.addEventListener;
      target.on = p.on;
      target.removeEventListener = target.off = p.removeEventListener;
      target.removeAllEventListeners = p.removeAllEventListeners;
      target.hasEventListener = p.hasEventListener;
      target.dispatchEvent = p.dispatchEvent;
      target._dispatchEvent = p._dispatchEvent;
      target.willTrigger = p.willTrigger
    };

    function EventDispatcher() {
      classCallCheck(this, EventDispatcher);
      /**
       * @private
       * @default null
       * @type Object
       */
      this._listeners = null;
      /**
       * @private
       * @default null
       * @type Object
       */
      this._captureListeners = null
    }
    /**
     * Adds the specified event listener. Note that adding multiple listeners to the same function will result in
     * multiple callbacks getting fired.
     *
     * @example
     * displayObject.addEventListener("click", event => console.log('clicked', event));
     *
     * @param {string} type The string type of the event.
     * @param {Function|Object} listener An object with a handleEvent method, or a function that will be called when the event is dispatched.
     * @param {boolean} [useCapture=false] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     * @return {Function|Object} Returns the listener for chaining or assignment.
     */
    EventDispatcher.prototype.addEventListener = function addEventListener(type, listener) {
      var useCapture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var listeners = void 0;
      if (useCapture) {
        listeners = this._captureListeners = this._captureListeners || {}
      } else {
        listeners = this._listeners = this._listeners || {}
      }
      var arr = listeners[type];
      if (arr) {
        this.removeEventListener(type, listener, useCapture);
        arr = listeners[type]; // remove may have deleted the array
      }
      if (arr) {
        arr.push(listener)
      } else {
        listeners[type] = [listener]
      }
      return listener
    };
    /**
     * A shortcut method for using addEventListener that makes it easier to specify an execution scope, have a listener
     * only run once, associate arbitrary data with the listener, and remove the listener.
     *
     * This method works by creating an anonymous wrapper function and subscribing it with `addEventListener`.
     * The wrapper function is returned for use with `removeEventListener` (or `off`).
     *
     * To remove a listener added with `on`, you must pass in the returned wrapper function as the listener, or use
     * {@link core.Event#remove}. Likewise, each time you call `on` a NEW wrapper function is subscribed, so multiple calls
     * to `on` with the same params will create multiple listeners.
     *
     * @example
     * const listener = myBtn.on("click", handleClick, null, false, { count: 3 });
     * function handleClick (evt, data) {
     *   data.count -= 1;
     *   console.log(this == myBtn); // true - scope defaults to the dispatcher
     *   if (data.count == 0) {
     *     alert("clicked 3 times!");
     *     myBtn.off("click", listener);
     *     // alternately: evt.remove();
     *   }
     * }
     *
     * @param {string} type The string type of the event.
     * @param {Function|Object} listener An object with a handleEvent method, or a function that will be called when the event is dispatched.
     * @param {Object} [scope=null] The scope to execute the listener in. Defaults to the dispatcher/currentTarget for function listeners, and to the listener itself for object listeners (ie. using handleEvent).
     * @param {boolean} [once=false] If true, the listener will remove itself after the first time it is triggered.
     * @param {*} [data={}] Arbitrary data that will be included as the second parameter when the listener is called.
     * @param {boolean} [useCapture=false] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     * @return {Function} Returns the anonymous function that was created and assigned as the listener. This is needed to remove the listener later using .removeEventListener.
     */
    EventDispatcher.prototype.on = function on(type, listener) {
      var scope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var once = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var data = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
      var useCapture = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      if (listener.handleEvent) {
        scope = scope || listener;
        listener = listener.handleEvent
      }
      scope = scope || this;
      return this.addEventListener(type, function(event) {
        listener.call(scope, evt, data);
        once && evt.remove()
      }, useCapture)
    };
    /**
     * Removes the specified event listener.
     *
     * You must pass the exact function reference used when the event was added. If a proxy
     * function, or function closure is used as the callback, the proxy/closure reference must be used - a new proxy or
     * closure will not work.
     *
     * @example
     * displayObject.removeEventListener("click", handleClick);
     *
     * @param {string} type The string type of the event.
     * @param {Function|Object} listener The listener function or object.
     * @param {boolean} [useCapture=false] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     */
    EventDispatcher.prototype.removeEventListener = function removeEventListener(type, listener) {
      var useCapture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var listeners = useCapture ? this._captureListeners : this._listeners;
      if (!listeners) {
        return
      }
      var arr = listeners[type];
      if (!arr) {
        return
      }
      var l = arr.length;
      for (var i = 0; i < l; i++) {
        if (arr[i] === listener) {
          if (l === 1) {
            delete listeners[type]
          } // allows for faster checks.
          else {
            arr.splice(i, 1)
          }
          break
        }
      }
    };
    /**
     * A shortcut to the removeEventListener method, with the same parameters and return value. This is a companion to the
     * `on` method.
     *
     * To remove a listener added with `on`, you must pass in the returned wrapper function as the listener. See
     * {@link core.EventDispatcher#on} for an example.
     *
     * @param {string} type The string type of the event.
     * @param {Function|Object} listener The listener function or object.
     * @param {boolean} [useCapture=false] For events that bubble, indicates whether to listen for the event in the capture or bubbling/target phase.
     */
    EventDispatcher.prototype.off = function off(type, listener) {
      var useCapture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      this.removeEventListener(type, listener, useCapture)
    };
    /**
     * Removes all listeners for the specified type, or all listeners of all types.
     *
     * @example
     * // remove all listeners
     * displayObject.removeAllEventListeners();
     *
     * // remove all click listeners
     * displayObject.removeAllEventListeners("click");
     *
     * @param {string} [type=null] The string type of the event. If omitted, all listeners for all types will be removed.
     */
    EventDispatcher.prototype.removeAllEventListeners = function removeAllEventListeners() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      if (type) {
        if (this._listeners) {
          delete this._listeners[type]
        }
        if (this._captureListeners) {
          delete this._captureListeners[type]
        }
      } else {
        this._listeners = this._captureListeners = null
      }
    };
    /**
     * Dispatches the specified event to all listeners.
     *
     * @example
     * // use a string event
     * this.dispatchEvent("complete")
     *
     * // use an Event instance
     * const event = new createjs.Event("progress");
     * this.dispatchEvent(event);
     *
     * @param {Object|Event|string} eventObj An object with a "type" property, or a string type.
     * While a generic object will work, it is recommended to use a CreateJS Event instance. If a string is used,
     * dispatchEvent will construct an Event instance if necessary with the specified type. This latter approach can
     * be used to avoid event object instantiation for non-bubbling events that may not have any listeners.
     * @param {boolean} [bubbles=false] Specifies the `bubbles` value when a string was passed to eventObj.
     * @param {boolean} [cancelable=false] Specifies the `cancelable` value when a string was passed to eventObj.
     * @return {boolean} Returns false if `preventDefault()` was called on a cancelable event, true otherwise.
     */
    EventDispatcher.prototype.dispatchEvent = function dispatchEvent(eventObj) {
      var bubbles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var cancelable = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      if (typeof eventObj === "string") {
        // skip everything if there's no listeners and it doesn't bubble:
        var listeners = this._listeners;
        if (!bubbles && (!listeners || !listeners[eventObj])) {
          return true
        }
        eventObj = new Event(eventObj, bubbles, cancelable)
      } else if (eventObj.target && eventObj.clone) {
        // redispatching an active event object, so clone it:
        eventObj = eventObj.clone()
      }
      // TODO: it would be nice to eliminate this. Maybe in favour of evtObj instanceof Event? Or !!evtObj.createEvent
      try {
        eventObj.target = this
      } catch (e) {} // try/catch allows redispatching of native events
      if (!eventObj.bubbles || !this.parent) {
        this._dispatchEvent(eventObj, 2)
      } else {
        var top = this;
        var list = [top];
        while (top.parent) {
          list.push(top = top.parent)
        }
        var l = list.length;
        var i = void 0;
        // capture & atTarget
        for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
          list[i]._dispatchEvent(eventObj, 1 + (i == 0))
        }
        // bubbling
        for (i = 1; i < l && !eventObj.propagationStopped; i++) {
          list[i]._dispatchEvent(eventObj, 3)
        }
      }
      return !eventObj.defaultPrevented
    };
    /**
     * Indicates whether there is at least one listener for the specified event type.
     *
     * @param {string} type The string type of the event.
     * @return {boolean} Returns true if there is at least one listener for the specified event.
     */
    EventDispatcher.prototype.hasEventListener = function hasEventListener(type) {
      var listeners = this._listeners,
        captureListeners = this._captureListeners;
      return !!(listeners && listeners[type] || captureListeners && captureListeners[type])
    };
    /**
     * Indicates whether there is at least one listener for the specified event type on this object or any of its
     * ancestors (parent, parent's parent, etc). A return value of true indicates that if a bubbling event of the
     * specified type is dispatched from this object, it will trigger at least one listener.
     *
     * This is similar to {@link core.EventDispatcher#hasEventListener}, but it searches the entire
     * event flow for a listener, not just this object.
     *
     * @param {string} type The string type of the event.
     * @return {boolean} Returns `true` if there is at least one listener for the specified event.
     */
    EventDispatcher.prototype.willTrigger = function willTrigger(type) {
      var o = this;
      while (o) {
        if (o.hasEventListener(type)) {
          return true
        }
        o = o.parent
      }
      return false
    };
    /**
     * @return {String} a string representation of the instance.
     */
    EventDispatcher.prototype.toString = function toString() {
      return "[EventDispatcher]"
    };
    /**
     * @private
     * @param {Object|Event|string} eventObj
     * @param {Object} eventPhase
     */
    EventDispatcher.prototype._dispatchEvent = function _dispatchEvent(eventObj, eventPhase) {
      var listeners = eventPhase === 1 ? this._captureListeners : this._listeners;
      if (eventObj && listeners) {
        var arr = listeners[eventObj.type];
        var l = void 0;
        if (!arr || (l = arr.length) === 0) {
          return
        }
        try {
          eventObj.currentTarget = this
        } catch (e) {}
        try {
          eventObj.eventPhase = eventPhase
        } catch (e) {}
        eventObj.removed = false;
        arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
        for (var i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
          var o = arr[i];
          if (o.handleEvent) {
            o.handleEvent(eventObj)
          } else {
            o(eventObj)
          }
          if (eventObj.removed) {
            this.off(eventObj.type, o, eventPhase === 1);
            eventObj.removed = false
          }
        }
      }
    };
    return EventDispatcher
  }();
  // reference to each ticker created
  var _tickerInstances = {};
  /**
   * The Ticker provides a centralized tick or heartbeat broadcast at a set interval. Listeners can subscribe to the tick
   * event to be notified when a set time interval has elapsed.
   *
   * Note that the interval that the tick event is called is a target interval, and may be broadcast at a slower interval
   * when under high CPU load. The Ticker class uses a static interface (ex. `Ticker.framerate = 30;`) and
   * can not be instantiated.
   *
   * @todo Pass timingMode, maxDelta, paused values as instantiation arguments?
   *
   * @memberof core
   * @example
   * Ticker.addEventListener("tick", event => {
   *   // Actions carried out each tick (aka frame)
   *   if (!event.paused) {
   *     // Actions carried out when the Ticker is not paused.
   *   }
   * });
   * @example
   * // Ticker export explanation
   * import Ticker, { Ticker as TickerClass, getTicker } from "@createjs/core";
   * Ticker.name, Ticker.RAF // -> createjs.global, undefined
   * TickerClass.RAF // -> raf
   * Ticker === getTicker("createjs.global") // -> true
   *
   * @extends core.EventDispatcher
   * @param {string} name The name assigned to this instance.
   */
  var Ticker = function(_EventDispatcher) {
    inherits(Ticker, _EventDispatcher);
    createClass(Ticker, null, [{
      key: "RAF_SYNCHED",
      /**
       * In this mode, Ticker uses the requestAnimationFrame API, but attempts to synch the ticks to target framerate. It
       * uses a simple heuristic that compares the time of the RAF return to the target time for the current frame and
       * dispatches the tick when the time is within a certain threshold.
       *
       * This mode has a higher variance for time between frames than {{#crossLink "Ticker/TIMEOUT:property"}}{{/crossLink}},
       * but does not require that content be time based as with {{#crossLink "Ticker/RAF:property"}}{{/crossLink}} while
       * gaining the benefits of that API (screen synch, background throttling).
       *
       * Variance is usually lowest for framerates that are a divisor of the RAF frequency. This is usually 60, so
       * framerates of 10, 12, 15, 20, and 30 work well.
       *
       * Falls back to {{#crossLink "Ticker/TIMEOUT:property"}}{{/crossLink}} if the requestAnimationFrame API is not
       * supported.
       *
       * @static
       * @type {string}
       * @default "synched"
       * @readonly
       */
      get: function get() {
        return "synched"
      }
      /**
       * In this mode, Ticker passes through the requestAnimationFrame heartbeat, ignoring the target framerate completely.
       * Because requestAnimationFrame frequency is not deterministic, any content using this mode should be time based.
       * You can leverage {@link core.Ticker#getTime} and the {@link core.Ticker#event:tick}
       * event object's "delta" properties to make this easier.
       *
       * Falls back on {@link core.Ticker.TIMEOUT} if the requestAnimationFrame API is not supported.
       *
       * @static
       * @type {string}
       * @default "raf"
       * @readonly
       */
    }, {
      key: "RAF",
      get: function get() {
        return "raf"
      }
      /**
       * In this mode, Ticker uses the setTimeout API. This provides predictable, adaptive frame timing, but does not
       * provide the benefits of requestAnimationFrame (screen synch, background throttling).
       *
       * @static
       * @type {string}
       * @default "timeout"
       * @readonly
       */
    }, {
      key: "TIMEOUT",
      get: function get() {
        return "timeout"
      }
    }]);

    function Ticker(name) {
      classCallCheck(this, Ticker);
      /**
       * The name of this instance.
       * @type {string}
       */
      var _this = possibleConstructorReturn(this, _EventDispatcher.call(this));
      _this.name = name;
      _tickerInstances[name] = _this;
      /**
       * Specifies the timing api (setTimeout or requestAnimationFrame) and mode to use.
       *
       * @see {@link core.Ticker.TIMEOUT}
       * @see {@link core.Ticker.RAF}
       * @see {@link core.Ticker.RAF_SYNCHED}
       *
       * @type {string}
       * @default Ticker.TIMEOUT
       */
      _this.timingMode = Ticker.TIMEOUT;
      /**
       * Specifies a maximum value for the delta property in the tick event object. This is useful when building time
       * based animations and systems to prevent issues caused by large time gaps caused by background tabs, system sleep,
       * alert dialogs, or other blocking routines. Double the expected frame duration is often an effective value
       * (ex. maxDelta=50 when running at 40fps).
       *
       * This does not impact any other values (ex. time, runTime, etc), so you may experience issues if you enable maxDelta
       * when using both delta and other values.
       *
       * If 0, there is no maximum.
       *
       * @type {number}
       * @default 0
       */
      _this.maxDelta = 0;
      /**
       * When the ticker is paused, all listeners will still receive a tick event, but the `paused` property
       * of the event will be `true`. Also, while paused the `runTime` will not increase.
       *
       * @example
       * Ticker.addEventListener("tick", event => console.log(event.paused, Ticker.getTime(false), Ticker.getTime(true)));
       * Ticker.paused = true;
       *
       * @see {@link core.Ticker#event:tick}
       * @see {@link core.Ticker#getTime}
       * @see {@link core.Ticker#getEventTime}
       *
       * @type {boolean}
       * @default false
       */
      _this.paused = false;
      /**
       * @private
       * @type {boolean}
       * @default false
       */
      _this._inited = false;
      /**
       * @private
       * @type {number}
       * @default 0
       */
      _this._startTime = 0;
      /**
       * @private
       * @type {number}
       * @default 0
       */
      _this._pausedTime = 0;
      /**
       * The number of ticks that have passed.
       *
       * @private
       * @type {number}
       * @default 0
       */
      _this._ticks = 0;
      /**
       * The number of ticks that have passed while Ticker has been paused.
       *
       * @private
       * @type {number}
       * @default
       */
      _this._pausedTicks = 0;
      /**
       * @private
       * @type {number}
       * @default
       */
      _this._interval = 50;
      /**
       * @private
       * @type {number}
       * @default
       */
      _this._lastTime = 0;
      /**
       * @private
       * @type {Array}
       * @default null
       */
      _this._times = null;
      /**
       * @private
       * @type {Array}
       * @default null
       */
      _this._tickTimes = null;
      /**
       * Stores the timeout or requestAnimationFrame id.
       *
       * @private
       * @type {number}
       * @default null
       */
      _this._timerId = null;
      /**
       * True if currently using requestAnimationFrame, false if using setTimeout. This may be different than timingMode
       * if that property changed and a tick hasn't fired.
       *
       * @private
       * @type {boolean}
       * @default true
       */
      _this._raf = true;
      return _this
    }
    /**
     * Indicates the target time (in milliseconds) between ticks. Default is 50 (20 FPS).
     * Note that actual time between ticks may be more than specified depending on CPU load.
     * This property is ignored if the ticker is using the `RAF` timing mode.
     *
     * @type {number}
     */
    /**
     * Call Ticker.create() to get a new Ticker instance.
     * It is not initalized by default and its ticks are not synched with any other instance.
     *
     * @param {string} name The name given to the new instance.
     * @return {core.Ticker} A new Ticker instance.
     */
    Ticker.prototype.create = function create(name) {
      if (_tickerInstances[name]) {
        throw new Error("A ticker instance named '" + name + "' already exists.")
      }
      return new Ticker(name)
    };
    /**
     * Starts the tick. This is called automatically when the first listener is added.
     */
    Ticker.prototype.init = function init() {
      if (this._inited) {
        return
      }
      this._inited = true;
      this._times = [];
      this._tickTimes = [];
      this._startTime = this._getTime();
      this._times.push(this._lastTime = 0);
      this._setupTick()
    };
    /**
     * Stops the Ticker and removes all listeners. Use init() to restart the Ticker.
     */
    Ticker.prototype.reset = function reset() {
      if (this._raf) {
        var f = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame;
        f && f(this._timerId)
      } else {
        clearTimeout(this._timerId)
      }
      this.removeAllEventListeners("tick");
      this._timerId = this._times = this._tickTimes = null;
      this._startTime = this._lastTime = this._ticks = 0;
      this._inited = false
    };
    /**
     * Init the Ticker instance if it hasn't been already.
     */
    Ticker.prototype.addEventListener = function addEventListener(type, listener, useCapture) {
      !this._inited && this.init();
      return _EventDispatcher.prototype.addEventListener.call(this, type, listener, useCapture)
    };
    /**
     * Returns the average time spent within a tick. This can vary significantly from the value provided by getMeasuredFPS
     * because it only measures the time spent within the tick execution stack.
     *
     * Example 1: With a target FPS of 20, getMeasuredFPS() returns 20fps, which indicates an average of 50ms between
     * the end of one tick and the end of the next. However, getMeasuredTickTime() returns 15ms. This indicates that
     * there may be up to 35ms of "idle" time between the end of one tick and the start of the next.
     *
     * Example 2: With a target FPS of 30, getFPS() returns 10fps, which indicates an average of 100ms between the end of
     * one tick and the end of the next. However, getMeasuredTickTime() returns 20ms. This would indicate that something
     * other than the tick is using ~80ms (another script, DOM rendering, etc).
     *
     * @param {number} [ticks=null] The number of previous ticks over which to measure the average time spent in a tick.
     * Defaults to the number of ticks per second. To get only the last tick's time, pass in 1.
     * @return {number} The average time spent in a tick in milliseconds.
     */
    Ticker.prototype.getMeasuredTickTime = function getMeasuredTickTime() {
      var ticks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var times = this._tickTimes;
      if (!times || times.length < 1) {
        return -1
      }
      // by default, calculate average for the past ~1 second:
      ticks = Math.min(times.length, ticks || this.framerate | 0);
      return times.reduce(function(a, b) {
        return a + b
      }, 0) / ticks
    };
    /**
     * Returns the actual frames / ticks per second.
     *
     * @param {number} [ticks=null] The number of previous ticks over which to measure the actual frames / ticks per second.
     * Defaults to the number of ticks per second.
     * @return {number} The actual frames / ticks per second. Depending on performance, this may differ
     * from the target frames per second.
     */
    Ticker.prototype.getMeasuredFPS = function getMeasuredFPS() {
      var ticks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var times = this._times;
      if (!times || times.length < 2) {
        return -1
      }
      // by default, calculate fps for the past ~1 second:
      ticks = Math.min(times.length - 1, ticks || this.framerate | 0);
      return 1e3 / ((times[0] - times[ticks]) / ticks)
    };
    /**
     * Returns the number of milliseconds that have elapsed since Ticker was initialized via {@link core.Ticker#init}.
     * Returns -1 if Ticker has not been initialized. For example, you could use
     * this in a time synchronized animation to determine the exact amount of time that has elapsed.
     *
     * @param {boolean} [runTime=false] If true only time elapsed while Ticker was not paused will be returned.
     * If false, the value returned will be total time elapsed since the first tick event listener was added.
     * @return {number} Number of milliseconds that have elapsed since Ticker was initialized or -1.
     */
    Ticker.prototype.getTime = function getTime() {
      var runTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this._startTime ? this._getTime() - (runTime ? this._pausedTime : 0) : -1
    };
    /**
     * Similar to {@link core.Ticker#getTime}, but returns the time on the most recent {@link core.Ticker#event:tick}
     * event object.
     *
     * @param {boolean} [runTime=false] If true, the runTime property will be returned instead of time.
     * @returns {number} The time or runTime property from the most recent tick event or -1.
     */
    Ticker.prototype.getEventTime = function getEventTime() {
      var runTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this._startTime ? (this._lastTime || this._startTime) - (runTime ? this._pausedTime : 0) : -1
    };
    /**
     * Returns the number of ticks that have been broadcast by Ticker.
     *
     * @param {boolean} [pauseable=false] Indicates whether to include ticks that would have been broadcast
     * while Ticker was paused. If true only tick events broadcast while Ticker is not paused will be returned.
     * If false, tick events that would have been broadcast while Ticker was paused will be included in the return
     * value.
     * @return {number} of ticks that have been broadcast.
     */
    Ticker.prototype.getTicks = function getTicks() {
      var pauseable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      return this._ticks - (pauseable ? this._pausedTicks : 0)
    };
    /**
     * @private
     */
    Ticker.prototype._handleSynch = function _handleSynch() {
      this._timerId = null;
      this._setupTick();
      // run if enough time has elapsed, with a little bit of flexibility to be early:
      if (this._getTime() - this._lastTime >= (this._interval - 1) * .97) {
        this._tick()
      }
    };
    /**
     * @private
     */
    Ticker.prototype._handleRAF = function _handleRAF() {
      this._timerId = null;
      this._setupTick();
      this._tick()
    };
    /**
     * @private
     */
    Ticker.prototype._handleTimeout = function _handleTimeout() {
      this._timerId = null;
      this._setupTick();
      this._tick()
    };
    /**
     * @private
     */
    Ticker.prototype._setupTick = function _setupTick() {
      if (this._timerId != null) {
        return
      } // avoid duplicates
      var mode = this.timingMode || this._raf && Ticker.RAF;
      if (mode === Ticker.RAF_SYNCHED || mode === Ticker.RAF) {
        var f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
        if (f) {
          this._timerId = f(mode === Ticker.RAF ? this._handleRAF.bind(this) : this._handleSynch.bind(this));
          this._raf = true;
          return
        }
      }
      this._raf = false;
      this._timerId = setTimeout(this._handleTimeout.bind(this), this._interval)
    };
    /**
     * @private
     * @emits core.Ticker#event:tick
     */
    Ticker.prototype._tick = function _tick() {
      var paused = this.paused,
        time = this._getTime(),
        elapsedTime = time - this._lastTime;
      this._lastTime = time;
      this._ticks++;
      if (paused) {
        this._pausedTicks++;
        this._pausedTime += elapsedTime
      }
      if (this.hasEventListener("tick")) {
        var event = new Event("tick");
        var maxDelta = this.maxDelta;
        event.delta = maxDelta && elapsedTime > maxDelta ? maxDelta : elapsedTime;
        event.paused = paused;
        event.time = time;
        event.runTime = time - this._pausedTime;
        this.dispatchEvent(event)
      }
      this._tickTimes.unshift(this._getTime() - time);
      while (this._tickTimes.length > 100) {
        this._tickTimes.pop()
      }
      this._times.unshift(time);
      while (this._times.length > 100) {
        this._times.pop()
      }
    };
    /**
     * @private
     */
    Ticker.prototype._getTime = function _getTime() {
      var now = window.performance.now;
      return (now && now.call(performance) || (new Date).getTime()) - this._startTime
    };
    createClass(Ticker, [{
      key: "interval",
      get: function get() {
        return this._interval
      },
      set: function set(interval) {
        this._interval = interval;
        if (!this._inited) {
          return
        }
        this._setupTick()
      }
      /**
       * Indicates the target frame rate in frames per second (FPS). Effectively just a shortcut to `interval`, where
       * `framerate == 1000/interval`.
       *
       * @type {number}
       */
    }, {
      key: "framerate",
      get: function get() {
        return 1e3 / this._interval
      },
      set: function set(framerate) {
        this.interval = 1e3 / framerate
      }
    }]);
    return Ticker
  }(EventDispatcher);
  /**
   * Dispatched each tick. The event will be dispatched to each listener even when the Ticker has been paused.
   *
   * @example
   * Ticker.addEventListener("tick", event => console.log("Paused:", event.paused, event.delta));
   *
   * @event core.Ticker#tick
   * @type {Object}
   * @property {Object} target The object that dispatched the event.
   * @property {string} type The event type.
   * @property {boolean} paused Indicates whether the ticker is currently paused.
   * @property {number} delta The time elapsed in ms since the last tick.
   * @property {number} time The total time in ms since Ticker was initialized.
   * @property {number} runTime The total time in ms that Ticker was not paused since it was initialized. For example,
   * you could determine the amount of time that the Ticker has been paused since initialization with `time-runTime`.
   * @since 0.6.0
   */
  var Ticker$1 = new Ticker("createjs.global");
  /**
   * The core classes of CreateJS.
   * @namespace core
   *
   * @example
   * import { EventDispatcher, Event } from "@createjs/core";
   * const dispatcher = new EventDispatcher();
   * dispatcher.on("myEvent", foo);
   * dispatcher.dispatchEvent(new Event("myEvent"));
   * // foo() is called.
   */
  // events
  // inject version into window
  var v = window.createjs = window.createjs || {
    v: {}
  };
  v.c = "2.0.0";
  exports.Event = Event;
  exports.EventDispatcher = EventDispatcher;
  exports.Ticker = Ticker$1;
  return exports
}(this.createjs || {});
//# sourceMappingURL=maps/core-NEXT.js.map
