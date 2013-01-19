Ext.define('ZCS.model.ZtSetting', {

	config: {
		name: null,
		type: ZCS.constant.TYPE_STRING,
		value: null
	},

	constructor: function(config) {
		this.initConfig(config);
	}
});
