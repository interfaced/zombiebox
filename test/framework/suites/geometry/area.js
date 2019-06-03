import Rect from 'zb/geometry/rect';
import Area from 'zb/geometry/area';

describe('Area', () => {
	describe('Class', () => {
		it('class exists', () => {
			expect(Area)
				.is.a('function');
		});

		it('Default constructor', () => {
			expect(() => new Area([])).not.to.throw();
		});

		it('Static constructor', () => {
			expect(() => Area.create([])).not.to.throw();
		});
	});

	describe('.isEmpty()', () => {
		it('Empty area - IS empty', () => {
			const area = Area.create([]);
			expect(
				area.isEmpty()
			).equal(
				true
			);
		});

		it('One empty rect area - IS empty', () => {
			const area = Area.create([
				Rect.createEmptyRect()
			]);
			expect(
				area.isEmpty()
			).equal(
				true
			);
		});

		it('One 1x1 rect area - is NOT empty', () => {
			const area = Area.create([
				Rect.createOneUnitRect()
			]);
			expect(
				area.isEmpty()
			).equal(
				false
			);
		});

		it('Several empty - IS empty', () => {
			const area = Area.create([
				Rect.createEmptyRect(),
				Rect.createEmptyRect(),
				Rect.createEmptyRect()
			]);
			expect(
				area.isEmpty()
			).equal(
				true
			);
		});

		it('Several empty and 1x1 rect area - is NOT empty', () => {
			const area = Area.create([
				Rect.createEmptyRect(),
				Rect.createEmptyRect(),
				Rect.createOneUnitRect(),
				Rect.createEmptyRect()
			]);
			expect(
				area.isEmpty()
			).equal(
				false
			);
		});
	});

	describe('.extrapolate()', () => {
		it('Extrapolated area without rects no error', () => {
			const area = Area.create([]);
			expect(() => area.extrapolate()).not.to.throw();
		});
		it('Extrapolated area without rects returns empty rect', () => {
			const area = Area.create([]);
			expect(area.extrapolate().isEqual(Rect.createEmptyRect())).equal(true);
		});
		it('Extrapolated area with empty rects returns empty rect', () => {
			const area = Area.create([
				Rect.createEmptyRect(),
				Rect.createEmptyRect(),
				Rect.createEmptyRect()
			]);
			expect(
				area.extrapolate().isEmpty()
			).equal(
				true
			);
		});

		it('Several empty and 1x1 rect extrapolated area is equal to 1x1 rect', () => {
			const area = Area.create([
				Rect.createEmptyRect(),
				Rect.createEmptyRect(),
				Rect.createOneUnitRect(),
				Rect.createEmptyRect()
			]);
			expect(
				area.extrapolate().isEqual(Rect.createOneUnitRect())
			).equal(
				true
			);
		});

		it('Extrapolated area with big rect and small rect inside big rect is equal to big rect', () => {
			const smallRect = Rect.create({x0: 2, y0: 2, x1: 3, y1: 3});
			const bigRect = Rect.create({x0: 1, y0: 1, x1: 4, y1: 4});
			const area = Area.create([
				smallRect,
				bigRect
			]);
			expect(
				area.extrapolate().isEqual(bigRect)
			).equal(
				true
			);
		});

		it('Several rect extrapolated area is equal to rect with min x0 and y0, max x1 and y1', () => {
			const smallest = 0;
			const small = 1;
			const middle = 2;
			const big = 3;
			const biggest = 4;
			const area = Area.create([
				Rect.create({x0: smallest, y0: smallest, x1: small, y1: small}),
				Rect.create({x0: small, y0: small, x1: middle, y1: middle}),
				Rect.create({x0: middle, y0: middle, x1: big, y1: big}),
				Rect.create({x0: big, y0: big, x1: biggest, y1: biggest})
			]);
			const biggestRect = Rect.create({x0: smallest, y0: smallest, x1: biggest, y1: biggest});
			expect(
				area.extrapolate().isEqual(biggestRect)
			).equal(
				true
			);
		});
	});
});
