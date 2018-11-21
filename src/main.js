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
export { default as Event } from "./events/Event";
export { default as EventDispatcher } from "./events/EventDispatcher";
// utils
export { default as Ticker } from "./utils/Ticker";
