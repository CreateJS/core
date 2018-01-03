/**
 * @license Ticker
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

import EventDispatcher from "../events/EventDispatcher";
import Event from "../events/Event";

// reference to each ticker created
const _tickerInstances = {};
function getTicker (name) { return _tickerInstances[name]; }
function deleteTicker (name) { delete _tickerInstances[name]; }

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
class Ticker extends EventDispatcher {

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
	static get RAF_SYNCHED () { return "synched"; }

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
	static get RAF () { return "raf"; }

	/**
	 * In this mode, Ticker uses the setTimeout API. This provides predictable, adaptive frame timing, but does not
	 * provide the benefits of requestAnimationFrame (screen synch, background throttling).
	 *
	 * @static
	 * @type {string}
	 * @default "timeout"
	 * @readonly
	 */
	static get TIMEOUT () { return "timeout"; }

	constructor (name) {
		super();

		/**
		 * The name of this instance.
		 * @type {string}
		 */
		this.name = name;
		_tickerInstances[name] = this;

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
		this.timingMode = Ticker.TIMEOUT;

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
		this.maxDelta = 0;

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
		this.paused = false;

		/**
		 * @private
		 * @type {boolean}
		 * @default false
		 */
		this._inited = false;

		/**
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._startTime = 0;

		/**
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._pausedTime = 0;

		/**
		 * The number of ticks that have passed.
		 *
		 * @private
		 * @type {number}
		 * @default 0
		 */
		this._ticks = 0;

		/**
		 * The number of ticks that have passed while Ticker has been paused.
		 *
		 * @private
		 * @type {number}
		 * @default
		 */
		this._pausedTicks = 0;

		/**
		 * @private
		 * @type {number}
		 * @default
		 */
		this._interval = 50;

		/**
		 * @private
		 * @type {number}
		 * @default
		 */
		this._lastTime = 0;

		/**
		 * @private
		 * @type {Array}
		 * @default null
		 */
		this._times = null;

		/**
		 * @private
		 * @type {Array}
		 * @default null
		 */
		this._tickTimes = null;

		/**
		 * Stores the timeout or requestAnimationFrame id.
		 *
		 * @private
		 * @type {number}
		 * @default null
		 */
		this._timerId = null;

		/**
		 * True if currently using requestAnimationFrame, false if using setTimeout. This may be different than timingMode
		 * if that property changed and a tick hasn't fired.
		 *
		 * @private
		 * @type {boolean}
		 * @default true
		 */
		this._raf = true;
	}

	/**
	 * Indicates the target time (in milliseconds) between ticks. Default is 50 (20 FPS).
	 * Note that actual time between ticks may be more than specified depending on CPU load.
	 * This property is ignored if the ticker is using the `RAF` timing mode.
	 *
	 * @type {number}
	 */
	get interval () { return this._interval; }
	set interval (interval) {
		this._interval = interval;
		if (!this._inited) { return; }
		this._setupTick();
	}

	/**
	 * Indicates the target frame rate in frames per second (FPS). Effectively just a shortcut to `interval`, where
	 * `framerate == 1000/interval`.
	 *
	 * @type {number}
	 */
	get framerate () { return 1000 / this._interval; }
	set framerate (framerate) { this.interval = 1000 / framerate; }

	/**
	 * Call Ticker.create() to get a new Ticker instance.
	 * It is not initalized by default and its ticks are not synched with any other instance.
	 *
	 * @param {string} name The name given to the new instance.
	 * @return {core.Ticker} A new Ticker instance.
	 */
	create (name) {
		if (_tickerInstances[name]) {
			throw new Error(`A ticker instance named '${name}' already exists.`);
		}
		return new Ticker(name);
	}

	/**
	 * Starts the tick. This is called automatically when the first listener is added.
	 */
	init () {
		if (this._inited) { return; }
		this._inited = true;
		this._times = [];
		this._tickTimes = [];
		this._startTime = this._getTime();
		this._times.push(this._lastTime = 0);
		this._setupTick();
	}

	/**
	 * Stops the Ticker and removes all listeners. Use init() to restart the Ticker.
	 */
	reset () {
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

	/**
	 * Init the Ticker instance if it hasn't been already.
	 */
	addEventListener (type, listener, useCapture) {
		!this._inited && this.init();
		return super.addEventListener(type, listener, useCapture);
	}

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
	getMeasuredTickTime (ticks = null) {
		const times = this._tickTimes;
		if (!times || times.length < 1) { return -1; }
		// by default, calculate average for the past ~1 second:
		ticks = Math.min(times.length, ticks || (this.framerate | 0));
		return times.reduce((a, b) => a + b, 0) / ticks;
	}

	/**
	 * Returns the actual frames / ticks per second.
	 *
	 * @param {number} [ticks=null] The number of previous ticks over which to measure the actual frames / ticks per second.
	 * Defaults to the number of ticks per second.
	 * @return {number} The actual frames / ticks per second. Depending on performance, this may differ
	 * from the target frames per second.
	 */
	getMeasuredFPS (ticks = null) {
		const times = this._times;
		if (!times || times.length < 2) { return -1; }
		// by default, calculate fps for the past ~1 second:
		ticks = Math.min(times.length - 1, ticks || (this.framerate | 0));
		return 1000 / ((times[0] - times[ticks]) / ticks);
	}

	/**
	 * Returns the number of milliseconds that have elapsed since Ticker was initialized via {@link core.Ticker#init}.
	 * Returns -1 if Ticker has not been initialized. For example, you could use
	 * this in a time synchronized animation to determine the exact amount of time that has elapsed.
	 *
	 * @param {boolean} [runTime=false] If true only time elapsed while Ticker was not paused will be returned.
	 * If false, the value returned will be total time elapsed since the first tick event listener was added.
	 * @return {number} Number of milliseconds that have elapsed since Ticker was initialized or -1.
	 */
	getTime (runTime = false) {
		return this._startTime ? this._getTime() - (runTime ? this._pausedTime : 0) : -1;
	}

	/**
	 * Similar to {@link core.Ticker#getTime}, but returns the time on the most recent {@link core.Ticker#event:tick}
	 * event object.
	 *
	 * @param {boolean} [runTime=false] If true, the runTime property will be returned instead of time.
	 * @returns {number} The time or runTime property from the most recent tick event or -1.
	 */
	getEventTime (runTime = false) {
		return this._startTime ? (this._lastTime || this._startTime) - (runTime ? this._pausedTime : 0) : -1;
	}

	/**
	 * Returns the number of ticks that have been broadcast by Ticker.
	 *
	 * @param {boolean} [pauseable=false] Indicates whether to include ticks that would have been broadcast
	 * while Ticker was paused. If true only tick events broadcast while Ticker is not paused will be returned.
	 * If false, tick events that would have been broadcast while Ticker was paused will be included in the return
	 * value.
	 * @return {number} of ticks that have been broadcast.
	 */
	getTicks (pauseable = false) {
		return this._ticks - (pauseable ? this._pausedTicks : 0);
	}

	/**
	 * @private
	 */
	_handleSynch () {
		this._timerId = null;
		this._setupTick();

		// run if enough time has elapsed, with a little bit of flexibility to be early:
		if (this._getTime() - this._lastTime >= (this._interval - 1) * 0.97) {
			this._tick();
		}
	}

	/**
	 * @private
	 */
	_handleRAF () {
		this._timerId = null;
		this._setupTick();
		this._tick();
	}

	/**
	 * @private
	 */
	_handleTimeout () {
		this._timerId = null;
		this._setupTick();
		this._tick();
	}

	/**
	 * @private
	 */
	_setupTick () {
		if (this._timerId != null) { return; } // avoid duplicates
		const mode = this.timingMode || (this._raf && Ticker.RAF);
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

	/**
	 * @private
	 * @emits core.Ticker#event:tick
	 */
	_tick () {
		const paused = this.paused,
			time = this._getTime(),
			elapsedTime = time-this._lastTime;
		this._lastTime = time;
		this._ticks++;

		if (paused) {
			this._pausedTicks++;
			this._pausedTime += elapsedTime;
		}

		if (this.hasEventListener("tick")) {
			const event = new Event("tick");
			const maxDelta = this.maxDelta;
			event.delta = (maxDelta && elapsedTime > maxDelta) ? maxDelta : elapsedTime;
			event.paused = paused;
			event.time = time;
			event.runTime = time-this._pausedTime;
			this.dispatchEvent(event);
		}

		this._tickTimes.unshift(this._getTime() - time);
		while (this._tickTimes.length > 100) { this._tickTimes.pop(); }

		this._times.unshift(time);
		while (this._times.length > 100) { this._times.pop(); }
	}

	/**
	 * @private
	 */
	_getTime () {
		const now = window.performance.now;
		return ((now && now.call(performance)) || (new Date().getTime())) - this._startTime;
	}

}

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

export default new Ticker("createjs.global");
export { Ticker, getTicker, deleteTicker };
