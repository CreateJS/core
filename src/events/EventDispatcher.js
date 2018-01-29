/**
 * @license EventDispatcher
 * Visit http://createjs.com/ for documentation, updates and examples.
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

import Event from "./Event";

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
class EventDispatcher {

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
	static initialize (target) {
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

	constructor () {
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
		this._captureListeners = null;
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
	addEventListener (type, listener, useCapture = false) {
		let listeners;
		if (useCapture) {
			listeners = this._captureListeners = this._captureListeners || {};
		} else {
			listeners = this._listeners = this._listeners || {};
		}
		let arr = listeners[type];
		if (arr) {
			this.removeEventListener(type, listener, useCapture);
			arr = listeners[type]; // remove may have deleted the array
		}
		if (arr) { arr.push(listener);  }
		else { listeners[type] = [listener]; }
		return listener;
	}

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
	on (type, listener, scope = null, once = false, data = {}, useCapture = false) {
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
	removeEventListener (type, listener, useCapture = false) {
		const listeners = useCapture ? this._captureListeners : this._listeners;
		if (!listeners) { return; }
		const arr = listeners[type];
		if (!arr) { return; }
		const l = arr.length;
		for (let i = 0; i < l; i++) {
			if (arr[i] === listener) {
				if (l === 1) { delete(listeners[type]); } // allows for faster checks.
				else { arr.splice(i, 1); }
				break;
			}
		}
	}

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
	off (type, listener, useCapture = false) {
		this.removeEventListener(type, listener, useCapture);
	}

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
	removeAllEventListeners (type = null) {
		if (type) {
			if (this._listeners) { delete(this._listeners[type]); }
			if (this._captureListeners) { delete(this._captureListeners[type]); }
		} else {
			this._listeners = this._captureListeners = null;
		}
	}

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
	dispatchEvent (eventObj, bubbles = false, cancelable = false) {
		if (typeof eventObj === "string") {
			// skip everything if there's no listeners and it doesn't bubble:
			const listeners = this._listeners;
			if (!bubbles && (!listeners || !listeners[eventObj])) { return true; }
			eventObj = new Event(eventObj, bubbles, cancelable);
		} else if (eventObj.target && eventObj.clone) {
			// redispatching an active event object, so clone it:
			eventObj = eventObj.clone();
		}

		// TODO: it would be nice to eliminate this. Maybe in favour of evtObj instanceof Event? Or !!evtObj.createEvent
		try { eventObj.target = this; } catch (e) {} // try/catch allows redispatching of native events

		if (!eventObj.bubbles || !this.parent) {
			this._dispatchEvent(eventObj, 2);
		} else {
			let top = this;
			const list = [top];
			while (top.parent) { list.push(top = top.parent); }
			const l = list.length;
			let i;

			// capture & atTarget
			for (i = l - 1; i >= 0 && !eventObj.propagationStopped; i--) {
				list[i]._dispatchEvent(eventObj, 1+(i==0));
			}
			// bubbling
			for (i = 1; i < l && !eventObj.propagationStopped; i++) {
				list[i]._dispatchEvent(eventObj, 3);
			}
		}
		return !eventObj.defaultPrevented;
	}

	/**
	 * Indicates whether there is at least one listener for the specified event type.
	 *
	 * @param {string} type The string type of the event.
	 * @return {boolean} Returns true if there is at least one listener for the specified event.
	 */
	hasEventListener (type) {
		const listeners = this._listeners, captureListeners = this._captureListeners;
		return !!((listeners && listeners[type]) || (captureListeners && captureListeners[type]));
	}

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
	willTrigger (type) {
		let o = this;
		while (o) {
			if (o.hasEventListener(type)) { return true; }
			o = o.parent;
		}
		return false;
	}

	/**
	 * @return {String} a string representation of the instance.
	 */
	toString () {
		return `[${this.constructor.name + this.name ? ` ${this.name}` : ""}]`;
	}

	/**
	 * @private
	 * @param {Object|Event|string} eventObj
	 * @param {Object} eventPhase
	 */
	_dispatchEvent (eventObj, eventPhase) {
		const listeners = eventPhase === 1 ? this._captureListeners : this._listeners;
		if (eventObj && listeners) {
			let arr = listeners[eventObj.type];
			let l;
			if (!arr || (l = arr.length) === 0) { return; }
			try { eventObj.currentTarget = this; } catch (e) {}
			try { eventObj.eventPhase = eventPhase; } catch (e) {}
			eventObj.removed = false;

			arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
			for (let i = 0; i < l && !eventObj.immediatePropagationStopped; i++) {
				let o = arr[i];
				if (o.handleEvent) { o.handleEvent(eventObj); }
				else { o(eventObj); }
				if (eventObj.removed) {
					this.off(eventObj.type, o, eventPhase === 1);
					eventObj.removed = false;
				}
			}
		}
	}

}

export default EventDispatcher;
