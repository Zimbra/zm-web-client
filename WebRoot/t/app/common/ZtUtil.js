Ext.define('ZCS.common.ZtUtil', {
	singleton: true,
//	constructor: function() {
//		var ua = Ext.browser.userAgent;
//		alert(ua);
//		return this;
//	},

	getAppFromObject: function(obj) {

		var path = Ext.getDisplayName(obj),
			parts = path && path.split('.');

		app = (parts.length >= 3 && parts[0] === 'ZCS' && parts[2]);
		return ZCS.constant.TAB_TITLE[app] ? app : '';
	}
});

// shortcut
ZCS.util = ZCS.common.ZtUtil;
