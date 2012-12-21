/**
 * Store some connection-related session properties. Hard-coded till we have login.
 */
Ext.define('ZCS.common.ZtUserSession', {
	singleton: true,
	config: {
		sessionId: 12,
		accountName: "user1@cdamon-mbpro.local",
		notifySeq: 0,
		initialSearchResults: null,
		settings: null
	},
	constructor : function(config) {
		this.initConfig(config);
		this.callParent([config]);
	}
});
