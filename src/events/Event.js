/**
 * @license Event
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
class Event {

	constructor (type, bubbles = false, cancelable = false) {
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
		this.timeStamp = new Date().getTime();

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
		this.removed = false;
	}

	/**
	 * Sets {@link core.Event#defaultPrevented} to true if the event is cancelable.
	 * Mirrors the DOM level 2 event standard. In general, cancelable events that have `preventDefault()` called will
	 * cancel the default behaviour associated with the event.
	 * @return {core.Event} this, chainable
	 */
	preventDefault () {
		this.defaultPrevented = this.cancelable;
		return this;
	}

	/**
	 * Sets {@link core.Event#propagationStopped} to true.
	 * Mirrors the DOM event standard.
	 * @return {core.Event} this, chainable
	 */
	stopPropagation () {
		this.propagationStopped = true;
		return this;
	}

	/**
	 * Sets {@link core.Event#propagationStopped} and {@link core.Event#immediatePropagationStopped} to true.
	 * Mirrors the DOM event standard.
	 * @return {core.Event} this, chainable
	 */
	stopImmediatePropagation () {
		this.immediatePropagationStopped = this.propagationStopped = true;
		return this;
	}

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
	remove () {
		this.removed = true;
		return this;
	}

	/**
	 * Returns a clone of the Event instance.
	 *
	 * @return {core.Event} a clone of the Event instance.
	 */
	clone () {
		const event = new Event(this.type, this.bubbles, this.cancelable);
		for (let n in this) {
			if (this.hasOwnProperty(n)) {
				event[n] = this[n];
			}
		}
		return event;
	}

	/**
	 * Provides a return {core.Event} this, chainable shortcut method for setting a number of properties on the instance.
	 *
	 * @param {Object} props A generic object containing properties to copy to the instance.
	 * @return {core.Event} this, chainable
	 */
	set (props) {
		for (let n in props) { this[n] = props[n]; }
		return this;
	}

	/**
	 * Returns a string representation of this object.
	 *
	 * @return {string} A string representation of the instance.
	 */
	toString () {
		return `[${this.constructor.name} (type=${this.type})]`;
	}

}

export { Event };
