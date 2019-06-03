import Rect from 'zb/geometry/rect';
import Point from 'zb/geometry/point';
import Direction from 'zb/geometry/direction';

describe('Rect', () => {
	it('Class', () => {
		expect(Rect).is.a('function');
	});

	it('Default constructor', () => {
		expect(() => new Rect({x0: 0, x1: 0, y0: 0, y1: 0})).not.to.throw();
	});

	it('Static constructor', () => {
		expect(() => Rect.create({x0: 0, x1: 0, y0: 0, y1: 0})).not.to.throw();
	});

	const instance = new Rect({x0: 2, y0: 2, x1: 6, y1: 4});

	describe('.createByPoints()', () => {
		it('function', () => {
			expect(Rect.createByPoints)
				.is.a('function');
		});

		it('2,2 and 6,4 = 2,2-6,4', () => {
			expect(Rect.createByPoints(
				new Point(2, 2),
				new Point(6, 4)
			).getValue()).deep.equal(
				{x0: 2, y0: 2, x1: 6, y1: 4}
			);
		});
	});

	describe('.getPointA()', () => {
		it('function', () => {
			expect(instance.getPointA)
				.is.a('function');
		});

		it('0,4-10,8 -> 0,4', () => {
			const rect = new Rect({x0: 0, y0: 4, x1: 10, y1: 8});
			expect(rect.getPointA().getValue())
				.deep.equal(
					{x: 0, y: 4}
				);
		});
	});

	describe('.getRectPointB()', () => {
		it('function', () => {
			expect(instance.getPointB)
				.is.a('function');
		});

		it('0,4-10,8 -> 10,8', () => {
			const rect = new Rect({x0: 0, y0: 4, x1: 10, y1: 8});
			expect(rect.getPointB().getValue())
				.deep.equal(
					{x: 10, y: 8}
				);
		});
	});

	describe('.moveX()', () => {
		it('function', () => {
			expect(instance.moveX)
				.is.a('function');
		});
		it('positive', () => {
			const rect = Rect.create({x0: 10, y0: 10, x1: 20, y1: 20});
			const positiveRect = Rect.create({x0: 15, y0: 10, x1: 25, y1: 20});
			rect.moveX(5);
			expect(
				rect.isEqual(positiveRect)
			).true;
		});
		it('negative', () => {
			const rect = Rect.create({x0: 10, y0: 10, x1: 20, y1: 20});
			const negativeRect = Rect.create({x0: 5, y0: 10, x1: 15, y1: 20});
			rect.moveX(-5);
			expect(
				rect.isEqual(negativeRect)
			).true;
		});
	});

	describe('.moveY()', () => {
		it('function', () => {
			expect(instance.moveX)
				.is.a('function');
		});
		it('positive', () => {
			const rect = Rect.create({x0: 10, y0: 10, x1: 20, y1: 20});
			const positiveRect = Rect.create({x0: 10, y0: 15, x1: 20, y1: 25});
			rect.moveY(5);
			expect(
				rect.isEqual(positiveRect)
			).true;
		});
		it('negative', () => {
			const rect = Rect.create({x0: 10, y0: 10, x1: 20, y1: 20});
			const negativeRect = Rect.create({x0: 10, y0: 5, x1: 20, y1: 15});
			rect.moveY(-5);
			expect(
				rect.isEqual(negativeRect)
			).true;
		});
	});

	describe('.moveRectangleXY()', () => {
		it('function', () => {
			expect(instance.moveXY)
				.is.a('function');
		});

		it('positive', () => {
			const rect = new Rect({x0: 10, y0: 10, x1: 20, y1: 20});
			rect.moveXY(new Point(3, 2));
			expect(
				rect.getValue()
			).deep.equal(
				{x0: 13, y0: 12, x1: 23, y1: 22}
			);
		});

		it('negative', () => {
			const rect = new Rect({x0: 10, y0: 10, x1: 20, y1: 20});
			rect.moveXY(new Point(-3, -2));
			expect(
				rect.getValue()
			).deep.equal(
				{x0: 7, y0: 8, x1: 17, y1: 18}
			);
		});
	});

	describe('.isOverflowReachedInDirection()', () => {
		it('2,2,5,5 - 0,0,9,9 RIGHT = false', () => {
			expect(
				Rect.createByNumbers(2, 2, 5, 5).isOverflowReachedInDirection(
					Rect.createByNumbers(0, 0, 9, 9),
					Direction.createRight()
				)).false;
		});

		it('2,2,9,5 - 0,0,9,9 RIGHT = true', () => {
			expect(
				Rect.createByNumbers(2, 2, 9, 5).isOverflowReachedInDirection(
					Rect.createByNumbers(0, 0, 9, 9),
					Direction.createRight()
				)).true;
		});

		it('2,2,11,5 - 0,0,9,9 RIGHT = true', () => {
			expect(
				Rect.createByNumbers(2, 2, 11, 5).isOverflowReachedInDirection(
					Rect.createByNumbers(0, 0, 9, 9),
					Direction.createRight()
				)).true;
		});

		it('2,2,5,5 - 0,0,9,9 UP = false', () => {
			expect(
				Rect.createByNumbers(2, 2, 5, 5).isOverflowReachedInDirection(
					Rect.createByNumbers(0, 0, 9, 9),
					Direction.createUp()
				)).false;
		});

		it('2,0,5,5 - 0,0,9,9 UP = true', () => {
			expect(
				Rect.createByNumbers(2, 0, 5, 5).isOverflowReachedInDirection(
					Rect.createByNumbers(0, 0, 9, 9),
					Direction.createUp()
				)).true;
		});

		it('2,-2,5,5 - 0,0,9,9 RIGHT = true', () => {
			expect(
				Rect.createByNumbers(2, -2, 5, 5).isOverflowReachedInDirection(
					Rect.createByNumbers(0, 0, 9, 9),
					Direction.createUp()
				)).true;
		});
	});

	describe('.sub()', () => {
		it('Sample example', () => {
			const a = Rect.createByNumbers(1, 0, 5, 4);
			const b = Rect.createByNumbers(3, 1, 9, 3);
			expect(
				a.sub(b)
			).deep.equal([
				Rect.createByNumbers(1, 1, 3, 3),
				Rect.createByNumbers(1, 0, 5, 1),
				Rect.createByNumbers(1, 3, 5, 4)
			]);
		});
	});

	describe('.page()', () => {
		it('function', () => {
			expect(instance.page)
				.is.a('function');
		});

		it('2,4-10,8 in 3x3 => 0,1-4,3', () => {
			const rect = new Rect({x0: 2, y0: 4, x1: 10, y1: 8});
			expect(rect.page(
				new Point(3, 3)
			).getValue()).deep.equal(
				{x0: 0, y0: 1, x1: 4, y1: 3}
			);
		});
	});

	describe('.scale()', () => {
		it('function', () => {
			expect(instance.scale)
				.is.a('function');
		});

		it('0,1-3,3 * 2x4 => 0,2-6,12', () => {
			const rect = new Rect({x0: 0, y0: 1, x1: 3, y1: 3});
			expect(rect.scale(
				new Point(2, 4)
			).getValue()).deep.equal(
				{x0: 0, y0: 4, x1: 6, y1: 12}
			);
		});
	});

	describe('.splitToPoints()', () => {
		it('is function', () => {
			expect(instance.splitToPoints)
				.to.be.a('function');
		});

		it('1 point if Rect equal to Step', () => {
			const rect = new Rect({x0: 1, y0: 2, x1: 3, y1: 5});
			const step = Point.createByValue({x: 2, y: 3});
			const result = rect.splitToPoints(step);
			expect(result).to.be.an('array').length(1);
			expect(result[0].getValue()).deep.equal({x: 1, y: 2});
		});

		it('Several points in both dimensions', () => {
			const rect = new Rect({x0: 0, y0: 0, x1: 10, y1: 20});
			const step = Point.createByValue({x: 5, y: 5});
			const result = rect.splitToPoints(step);
			expect(result).to.be.an('array').length(8);
		});
	});

	describe('.isIntersects()', () => {
		const source = Rect.createByNumbers(1, 1, 5, 5);
		it('function', () => {
			expect(source.isIntersects)
				.to.be.a('function');
		});

		describe('Top', () => {
			const topLeft = Rect.createByNumbers(0, 0, 2, 2);
			const topCenter = Rect.createByNumbers(2, 0, 4, 2);
			const topRight = Rect.createByNumbers(4, 0, 6, 2);
			const topFullCover = Rect.createByNumbers(0, 0, 6, 2);
			const topTouch = Rect.createByNumbers(0, 0, 6, 1);
			const topNoTouch = Rect.createByNumbers(0, 0, 6, 0.5);

			it('topleft', () => {
				expect(source.isIntersects(topLeft)).true;
			});
			it('topCenter', () => {
				expect(source.isIntersects(topCenter)).true;
			});
			it('topRight', () => {
				expect(source.isIntersects(topRight)).true;
			});
			it('topFullCover', () => {
				expect(source.isIntersects(topFullCover)).true;
			});
			it('topTouch', () => {
				expect(source.isIntersects(topTouch)).false;
			});
			it('topNoTouch', () => {
				expect(source.isIntersects(topNoTouch)).false;
			});
		});

		describe('Middle', () => {
			const middleLeft = Rect.createByNumbers(0, 2, 2, 4);
			const middleCenter = Rect.createByNumbers(2, 2, 4, 4);
			const middleRight = Rect.createByNumbers(4, 2, 6, 4);
			const middleFullCover = Rect.createByNumbers(0, 2, 6, 4);
			const leftTouch = Rect.createByNumbers(0, 0, 1, 6);
			const leftNoTouch = Rect.createByNumbers(0, 0, 0.5, 6);
			const rightTouch = Rect.createByNumbers(5, 0, 6, 6);
			const rightNoTouch = Rect.createByNumbers(5.5, 0, 6, 6);

			it('middleLeft', () => {
				expect(source.isIntersects(middleLeft)).true;
			});
			it('middleCenter', () => {
				expect(source.isIntersects(middleCenter)).true;
			});
			it('middleRight', () => {
				expect(source.isIntersects(middleRight)).true;
			});
			it('middleFullCover', () => {
				expect(source.isIntersects(middleFullCover)).true;
			});
			it('leftTouch', () => {
				expect(source.isIntersects(leftTouch)).false;
			});
			it('leftNoTouch', () => {
				expect(source.isIntersects(leftNoTouch)).false;
			});
			it('rightTouch', () => {
				expect(source.isIntersects(rightTouch)).false;
			});
			it('rightNoTouch', () => {
				expect(source.isIntersects(rightNoTouch)).false;
			});
		});

		describe('Bottom', () => {
			const bottomLeft = Rect.createByNumbers(0, 4, 2, 6);
			const bottomCenter = Rect.createByNumbers(2, 4, 4, 6);
			const bottomRight = Rect.createByNumbers(4, 4, 6, 6);
			const bottomFullCover = Rect.createByNumbers(0, 4, 6, 6);
			const bottomTouch = Rect.createByNumbers(0, 5, 6, 6);
			const bottomNoTouch = Rect.createByNumbers(0, 5.5, 6, 6);

			it('bottomLeft', () => {
				expect(source.isIntersects(bottomLeft)).true;
			});
			it('bottomCenter', () => {
				expect(source.isIntersects(bottomCenter)).true;
			});
			it('bottomRight', () => {
				expect(source.isIntersects(bottomRight)).true;
			});
			it('bottomFullCover', () => {
				expect(source.isIntersects(bottomFullCover)).true;
			});
			it('bottomTouch', () => {
				expect(source.isIntersects(bottomTouch)).false;
			});
			it('bottomNoTouch', () => {
				expect(source.isIntersects(bottomNoTouch)).false;
			});
		});

		describe('Center', () => {
			const centerInside = Rect.createByNumbers(2, 2, 4, 4);
			const overallFullCover = Rect.createByNumbers(0, 0, 6, 6);

			it('centerInside', () => {
				expect(source.isIntersects(centerInside)).true;
			});
			it('overallFullCover', () => {
				expect(source.isIntersects(overallFullCover)).true;
			});
		});
	});

	describe('.isIntersectsGeometric()', () => {
		const source = Rect.createByNumbers(1, 1, 5, 5);
		it('function', () => {
			expect(source.isIntersectsGeometric)
				.to.be.a('function');
		});

		describe('Top', () => {
			const topLeft = Rect.createByNumbers(0, 0, 2, 2);
			const topCenter = Rect.createByNumbers(2, 0, 4, 2);
			const topRight = Rect.createByNumbers(4, 0, 6, 2);
			const topFullCover = Rect.createByNumbers(0, 0, 6, 2);
			const topTouch = Rect.createByNumbers(0, 0, 6, 1);
			const topNoTouch = Rect.createByNumbers(0, 0, 6, 0.5);

			it('topleft', () => {
				expect(source.isIntersectsGeometric(topLeft)).true;
			});
			it('topCenter', () => {
				expect(source.isIntersectsGeometric(topCenter)).true;
			});
			it('topRight', () => {
				expect(source.isIntersectsGeometric(topRight)).true;
			});
			it('topFullCover', () => {
				expect(source.isIntersectsGeometric(topFullCover)).true;
			});
			it('topTouch', () => {
				expect(source.isIntersectsGeometric(topTouch)).true;
			});
			it('topNoTouch', () => {
				expect(source.isIntersectsGeometric(topNoTouch)).false;
			});
		});

		describe('Middle', () => {
			const middleLeft = Rect.createByNumbers(0, 2, 2, 4);
			const middleCenter = Rect.createByNumbers(2, 2, 4, 4);
			const middleRight = Rect.createByNumbers(4, 2, 6, 4);
			const middleFullCover = Rect.createByNumbers(0, 2, 6, 4);
			const leftTouch = Rect.createByNumbers(0, 0, 1, 6);
			const leftNoTouch = Rect.createByNumbers(0, 0, 0.5, 6);
			const rightTouch = Rect.createByNumbers(5, 0, 6, 6);
			const rightNoTouch = Rect.createByNumbers(5.5, 0, 6, 6);

			it('middleLeft', () => {
				expect(source.isIntersectsGeometric(middleLeft)).true;
			});
			it('middleCenter', () => {
				expect(source.isIntersectsGeometric(middleCenter)).true;
			});
			it('middleRight', () => {
				expect(source.isIntersectsGeometric(middleRight)).true;
			});
			it('middleFullCover', () => {
				expect(source.isIntersectsGeometric(middleFullCover)).true;
			});
			it('leftTouch', () => {
				expect(source.isIntersectsGeometric(leftTouch)).true;
			});
			it('leftNoTouch', () => {
				expect(source.isIntersectsGeometric(leftNoTouch)).false;
			});
			it('rightTouch', () => {
				expect(source.isIntersectsGeometric(rightTouch)).true;
			});
			it('rightNoTouch', () => {
				expect(source.isIntersectsGeometric(rightNoTouch)).false;
			});
		});

		describe('Bottom', () => {
			const bottomLeft = Rect.createByNumbers(0, 4, 2, 6);
			const bottomCenter = Rect.createByNumbers(2, 4, 4, 6);
			const bottomRight = Rect.createByNumbers(4, 4, 6, 6);
			const bottomFullCover = Rect.createByNumbers(0, 4, 6, 6);
			const bottomTouch = Rect.createByNumbers(0, 5, 6, 6);
			const bottomNoTouch = Rect.createByNumbers(0, 5.5, 6, 6);

			it('bottomLeft', () => {
				expect(source.isIntersectsGeometric(bottomLeft)).true;
			});
			it('bottomCenter', () => {
				expect(source.isIntersectsGeometric(bottomCenter)).true;
			});
			it('bottomRight', () => {
				expect(source.isIntersectsGeometric(bottomRight)).true;
			});
			it('bottomFullCover', () => {
				expect(source.isIntersectsGeometric(bottomFullCover)).true;
			});
			it('bottomTouch', () => {
				expect(source.isIntersectsGeometric(bottomTouch)).true;
			});
			it('bottomNoTouch', () => {
				expect(source.isIntersectsGeometric(bottomNoTouch)).false;
			});
		});

		describe('Center', () => {
			const centerInside = Rect.createByNumbers(2, 2, 4, 4);
			const overallFullCover = Rect.createByNumbers(0, 0, 6, 6);

			it('centerInside', () => {
				expect(source.isIntersectsGeometric(centerInside)).true;
			});
			it('overallFullCover', () => {
				expect(source.isIntersectsGeometric(overallFullCover)).true;
			});
		});
	});
});
