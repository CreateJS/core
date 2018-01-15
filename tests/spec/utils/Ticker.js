import Ticker, { getTicker, deleteTicker } from '../../src/utils/Ticker';

jest.useFakeTimers();

describe("Ticker", () => {

	beforeEach(() => {
		Ticker.reset();
		Ticker.init();
	});

	test("addEventListener() => evt.time", () => {
		Ticker.addEventListener("tick", evt => {
			expect(evt.time).toBeInRange(Ticker.getTime(), 2);
		});
	});

	test("addEventListener() => evt.delta", () => {
		Ticker.addEventListener("tick", evt => {
			expect(evt.delta).toBeInRange(Ticker.interval, 5);
		});
	});

	test("addEventListener() => evt.runTime", () => {
		Ticker.addEventListener("tick", evt => {
			expect(evt.runTime).toBeInRange(Ticker.getTime() | 0, 1);
		});
	});

	test("addEventListener() => evt.paused", () => {
		Ticker.paused = true;

		Ticker.addEventListener("tick", evt => {
			expect(evt.paused).toBeTruthy();
		});
	});

	test("get framerate", () => {
		Ticker.interval = 40;
		expect(Ticker.framerate).toBe(25);
	});

	test("set framerate", () => {
		Ticker.framerate = 40;
		setTimeout(() => expect(Ticker.getTime() | 0).toBeInRange(40 * 2, 3), 40 * 2);
	});

	test("getMeasuredFPS()", () => {
		Ticker.addEventListener("tick", evt => {
			expect(Ticker.getMeasuredFPS()).toBeInRange(Ticker.framerate, 5);
		});
	});

	test("getMeasuredTickTime()", () => {
		expect(Ticker.getMeasuredTickTime() | 0).not.toBeNull();
	});

	test("getTicks()", () => {
		Ticker.addEventListener("tick", evt => {
			expect(Ticker.getTicks()).toBeInRange(Ticker.framerate, 5);
		});
	});

	test("getTime()", () => {
		Ticker.addEventListener("tick", evt => {
			expect(Ticker.getTime()).toBeInRange(1000, 5);
		});
	});

	test("getEventTime()", () => {
		Ticker.addEventListener("tick", evt => {
			expect(Ticker.getEventTime() | 0).toBeInRange(
				(Ticker.interval * Ticker.framerate) - Ticker.interval,
				40
			);
		});
	});

	test("can create new tickers", () => {
		expect(Ticker.name).toBe("createjs.global");
		const name = "myTicker";
		const myTicker = Ticker.create(name);
		expect(myTicker).not.toBe(Ticker);
		expect(myTicker.name).toBe(name);
		expect(() => Ticker.create(name)).toThrow(`A ticker instance named '${name}' already exists.`);
	});

	test("can get and delete existing tickers", () => {
		const name = "myTicker";
		deleteTicker(name);
		expect(getTicker(name)).toBeUndefined();
		Ticker.create(name);
		const myTicker = getTicker(name);
		expect(myTicker.name).toBe(name);
	});

});
