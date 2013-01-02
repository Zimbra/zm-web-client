Ext.define('ZCS.model.ZtEmailAddress', {
	config: {
		type: '',
		email: '',
		name: '',
		displayName: ''
	},

	constructor: function(type, email, name, displayName) {
		this.setType(type);
		this.setEmail(email);
		this.setName(name || '');
		this.setDisplayName(displayName || '');
	},

	statics: {
		fromAddressNode: function(node) {
			var type = ZCS.common.ZtConstants.FROM_SOAP_TYPE[node.t];
			return new ZCS.model.ZtEmailAddress(type, node.a, node.p, node.d);
		}
	},

	getFullEmail: function() {
		var name = this.getName(),
			email = this.getEmail();
		if (name) {
			name = name.replace(/\\+"/g, '"');  // unescape double quotes (avoid double-escaping)
			name = name.replace(/"/g,'\\"');    // escape quotes
			return ['"', name, '" <', email, '>'].join('');
		}
		else {
			return email;
		}
	}
});
