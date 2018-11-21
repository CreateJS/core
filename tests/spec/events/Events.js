import Event from "../../../src/events/Event";
import EventDispatcher from "../../../src/events/EventDispatcher";
import { Container } from "@createjs/easeljs";

describe("Events", function() {
	var eventDispatcher;

	beforeEach(function() {
		jest.useFakeTimers();
		eventDispatcher = new EventDispatcher();
	});

	afterEach(function() {
		eventDispatcher.removeAllEventListeners();
	});

	test("dispatchEvent() and addEventListener() should work", function() {
		eventDispatcher.addEventListener("test", function(data) {
			expect(data.data).toBe("bar");
		});
		eventDispatcher.dispatchEvent({
			type: "test",
			target: this,
			data: "bar",
		});
	});

	test("dispatchEvent() and on() should work", function() {
		eventDispatcher.on("test", function(data) {
			expect(data.data).toBe("bar");
		});
		eventDispatcher.dispatchEvent({
			type: "test",
			target: this,
			data: "bar",
		});
	});

	test("hasEventlistener() should be true.", function() {
		eventDispatcher.addEventListener("test", function() {});
		expect(eventDispatcher.hasEventListener("test")).toBe(true);
	});

	test("removeEventListener() should work", function() {
		var foo = function() {};
		eventDispatcher.addEventListener("test", foo);
		eventDispatcher.removeEventListener("test", foo);
		expect(eventDispatcher.hasEventListener("test")).toBe(false);
	});

	test("off() should work", function() {
		var foo = function() {};
		eventDispatcher.addEventListener("test", foo);
		eventDispatcher.off("test", foo);
		expect(eventDispatcher.hasEventListener("test")).toBe(false);
	});

	test("removeAllEventListeners() should work", function() {
		eventDispatcher.addEventListener("test", function() {});
		eventDispatcher.addEventListener("test2", function() {});
		eventDispatcher.addEventListener("test3", function() {});

		eventDispatcher.removeAllEventListeners();

		expect(eventDispatcher.hasEventListener("test")).toBe(false);
		expect(eventDispatcher.hasEventListener("test2")).toBe(false);
		expect(eventDispatcher.hasEventListener("test3")).toBe(false);
	});

	test("willTrigger() should work", function() {
		var foo = new Container();
		var bar = new Container();

		foo.addChild(bar);

		foo.addEventListener("test", function() {});
		expect(bar.willTrigger("test")).toBe(true);
	});

	test("enableMouseOver() should work", function() {
		this.stage.enableMouseOver(true);

		expect(this.stage._mouseOverIntervalID).not.toBe(null);
	});

	test("Events should bubble.", function(done) {
		var a = new Container();
		var b = new Container();
		var c = new Container();

		var timeout = setTimeout(function() {
			expect(true).toBe(false);
			done();
		}, 10);

		a.addEventListener("foo", function() {
			clearTimeout(timeout);
			expect(true).toBe(true);
			done();
		});

		a.addChild(b);
		b.addChild(c);

		c.dispatchEvent(new Event("foo", true));
	});

	test("Events should not bubble.", function(done) {
		var a = new Container();
		var b = new Container();
		var c = new Container();

		var timeout = setTimeout(function() {
			expect(true).toBe(true);
			done();
		}, 10);

		a.addEventListener("foo", function() {
			clearTimeout(timeout);
			expect(true).toBe(false);
			done();
		});

		a.addChild(b);
		b.addChild(c);

		c.dispatchEvent(new Event("foo", false));
	});

	test("event.useCapture should work.", function(done) {
		var a = new Container();
		var b = new Container();
		var c = new Container();

		// Fail condition
		var timeout = setTimeout(function() {
			expect(true).toBe(false);
			done();
		}, 10);

		// Success
		a.addEventListener(
			"foo",
			function(evt) {
				clearTimeout(timeout);
				expect(evt.eventPhase).toBe(1);
				done();
			},
			true,
		);

		a.addChild(b);
		b.addChild(c);
		c.dispatchEvent(new Event("foo", true));
	});

	test("event.stopPropagation() should work.", function(done) {
		var a = new Container();
		var b = new Container();
		var c = new Container();
		var d = new Container();

		// Success
		var timeout = setTimeout(function() {
			expect(true).toBe(true);
			done();
		}, 10);

		// Should not get called
		c.addEventListener(
			"foo",
			function(evt) {
				clearTimeout(timeout);
				expect(true).toBe(false);
				done();
			},
			false,
		);

		a.addChild(b);

		a.addEventListener(
			"foo",
			function(evt) {
				evt.stopPropagation();
			},
			true,
		);
		b.addChild(c);

		c.addChild(d);

		d.dispatchEvent(new Event("foo", true));
	});

	test("event.stopImmediatePropagation() should work.", function(done) {
		var a = new Container();
		var b = new Container();
		var c = new Container();
		var d = new Container();

		// Success
		var timeout = setTimeout(function() {
			expect(true).toBe(true);
			done();
		}, 10);

		// Should not get called
		c.addEventListener(
			"foo",
			function(evt) {
				clearTimeout(timeout);
				expect(true).toBe(false);
				done();
			},
			true,
		);

		a.addChild(b);

		b.addEventListener(
			"foo",
			function(evt) {
				evt.stopImmediatePropagation();
			},
			true,
		);
		b.addChild(c);

		c.addChild(d);

		d.dispatchEvent(new Event("foo", true));
	});

	test("event.preventDefault() should work.", function(done) {
		var a = new Container();
		var b = new Container();
		var c = new Container();

		var timeout = setTimeout(function() {
			expect(true).toBe(true);
			done();
		}, 10);

		a.addEventListener("foo", function(evt) {
			clearTimeout(timeout);
			expect(evt.defaultPrevented).toBe(true);
			done();
		});

		a.addChild(b);

		b.addEventListener("foo", function(evt) {
			evt.preventDefault();
		});
		b.addChild(c);

		c.dispatchEvent(new Event("foo", true, true));
	});
});
