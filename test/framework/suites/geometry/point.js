import Point from 'zb/geometry/point';

describe('Point', () => {
	describe('Class', () => {
		it('class exist', () => {
			expect(Point)
				.is.a('function');
		});
	});

	describe('Point / Transformations', () => {
		describe('.invertPoint', () => {
			it('function', () => {
				const point = new Point(3, 2);
				expect(point.invertPoint)
					.is.a('function');
			});

			it('sample', () => {
				const point = new Point(3, 2);
				expect(point.invertPoint().getValue())
					.deep.equal(
						{x: -3, y: -2}
					);
			});
		});
	});

	describe('Point / Operations', () => {
		describe('Point / Operations / Page', () => {
			describe('.floorPage', () => {
				it('function exists', () => {
					const point = new Point(3, 2);
					expect(point.floorPage)
						.is.a('function');
				});

				it('return {Point}', () => {
					const point = new Point(17, 10);
					const page = new Point(10, 10);
					expect(point.floorPage(page))
						.instanceOf(Point);
				});

				const checks = [{
					label: '17,10 on 10x10 = 1,1',
					point: new Point(17, 10),
					page: new Point(10, 10),
					result: {x: 1, y: 1}
				}];
				checks.forEach((ch) => {
					it(ch.label, () => {
						expect(ch.point.floorPage(ch.page).getValue())
							.deep.equal(ch.result);
					});
				});
			});

			describe('.ceilPage', () => {
				it('function exists', () => {
					const point = new Point(3, 2);
					expect(point.ceilPage)
						.is.a('function');
				});

				it('return {Point}', () => {
					const point = new Point(17, 10);
					const page = new Point(10, 10);
					expect(point.ceilPage(page))
						.instanceOf(Point);
				});

				const checks = [{
					label: '17,10 on 10x10 = 2,1',
					point: new Point(17, 10),
					page: new Point(10, 10),
					result: {x: 2, y: 1}
				}];
				checks.forEach((ch) => {
					it(ch.label, () => {
						expect(ch.point.ceilPage(ch.page).getValue())
							.deep.equal(ch.result);
					});
				});
			});

			describe('.modPage', () => {
				it('function exists', () => {
					const point = new Point(3, 2);
					expect(point.modPage)
						.is.a('function');
				});

				it('return {Point}', () => {
					const point = new Point(17, 10);
					const page = new Point(10, 10);
					expect(point.modPage(page))
						.instanceOf(Point);
				});

				it('17,10 on 10x10 = 7,0', () => {
					const point = new Point(17, 10);
					const page = new Point(10, 10);

					expect(point.modPage(page).getValue())
						.deep.equal({x: 7, y: 0});
				});
			});

			describe('.scalePoint()', () => {
				it('function exists', () => {
					const point = new Point(3, 2);
					expect(point.modPage)
						.is.a('function');
				});

				it('return {Point}', () => {
					const point = new Point(17, 10);
					const page = new Point(10, 10);
					expect(point.modPage(page))
						.instanceOf(Point);
				});

				it('[3,7] * [5,3] = [15,21]', () => {
					const point = new Point(3, 7);
					const page = new Point(5, 3);
					expect(point.scale(page).getValue())
						.deep.equal({x: 15, y: 21});
				});
			});
		});
	});
});
