import {PLATFORM_NAME} from 'generated/define';
import AbstractApplication from 'zb/abstract-application';
<% const toPascalCase = (string) => _.upperFirst(_.camelCase(string)) %>
<%
platforms.forEach((platform) => {
	print(
		'import create' + toPascalCase(platform) + 'Device ' +
		'from \'' + platform + '/factory\';\n'
	);

	print(
		'import ' + platform + 'Device ' +
		'from \'' + platform + '/device\';\n'
	);
});
%>


/**
 * @abstract
 */
export default class BaseApplication extends AbstractApplication {
	/**
	 */
	constructor() {
		super();
	}

<% platforms.forEach(function(platform) { %>
	/**
	 * @return {boolean}
	 */
	isDevice<%= toPascalCase(platform) %>() {
		return this.device instanceof <%=platform%>Device;
	}
<% }); %>
	/**
	 * @override
	 */
	_createDevice() {
		let device;

		if (PLATFORM_NAME) {
			const factory = {<% platforms.forEach(function(platform) { %>
				'<%=platform%>': create<%= toPascalCase(platform) %>Device,<% }); %>
			}[PLATFORM_NAME];

			if (factory) {
				device = factory();
			}
		} else {
			device = (<% platforms.forEach(function(platform) { %>
				create<%= toPascalCase(platform) %>Device() ||<% }); %>
				null
			);
		}

		if (!device) {
			throw new Error('Can\'t detect a platform.');
		}

		return device;
	}
};
