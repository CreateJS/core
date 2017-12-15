expect.extend({
	toBeInRange () {
		return {
			compare (actual, expected, range = 0) {
				return {
					pass: actual <= (expected + range) && actual >= (expected - range)
				};
			}
		};
	}
});
