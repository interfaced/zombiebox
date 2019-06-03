import {buildQueryString} from 'zb/http/http';

describe('zb/http', () => {
	describe('buildQueryUrl', () => {
		it('Doesn\'t place trailing ? if query params argument is UNDEFINED', () => {
			const string = 'http://example.com';
			expect(buildQueryString(string)).eq(string);
		});

		it('Doesn\'t place trailing ? if query params argument is EMPTY', () => {
			const string = 'http://example.com';
			expect(buildQueryString(string, {})).eq(string);
		});
	});
});
