import Direction, {Value} from 'zb/geometry/direction';

describe('Direction', () => {
	describe('Class', () => {
		it('function', () => {
			expect(Direction)
				.is.a('function');
		});
	});

	describe('Constants', () => {
		it('constant: LEFT', () => {
			expect(Direction.createLeft())
				.instanceOf(Direction);
			expect(Direction.createLeft().getKey())
				.equal(Value.LEFT);
		});

		it('constant: RIGHT', () => {
			expect(Direction.createRight())
				.instanceOf(Direction);
			expect(Direction.createRight().getKey())
				.equal(Value.RIGHT);
		});

		it('constant: UP', () => {
			expect(Direction.createUp())
				.instanceOf(Direction);
			expect(Direction.createUp().getKey())
				.equal(Value.UP);
		});

		it('constant: DOWN', () => {
			expect(Direction.createDown())
				.instanceOf(Direction);
			expect(Direction.createDown().getKey())
				.equal(Value.DOWN);
		});
	});

	describe('.domPropertyName()', () => {
		it('function', () => {
			expect(Direction.createLeft().domPropertyName)
				.is.a('function');
		});

		it('left', () => {
			expect(Direction.createLeft().domPropertyName())
				.equal('left');
		});

		it('right', () => {
			expect(Direction.createRight().domPropertyName())
				.equal('right');
		});

		it('up', () => {
			expect(Direction.createUp().domPropertyName())
				.equal('top');
		});

		it('down', () => {
			expect(Direction.createDown().domPropertyName())
				.equal('bottom');
		});
	});
});
