import Axis from 'zb/geometry/axis';

describe('zb.std.plain.Axis', () => {
	it('X', () => {
		expect(Axis.X).not.undefined;
	});

	it('Y', () => {
		expect(Axis.Y).not.undefined;
	});

	it('X != Y', () => {
		expect(Axis.X).not.equal(Axis.Y);
	});
});
