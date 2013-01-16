/**
 * This class represents an email address. It will have at least an email, and may also have
 * a type, a name, and a display name (short version of name).
 */
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
			var type = ZCS.constant.FROM_SOAP_TYPE[node.t];
			return new ZCS.model.ZtEmailAddress(type, node.a, node.p, node.d);
		}
	},

	/**
	 * Returns a full email address string. If a name is available, it will be quoted and the email
	 * will be in angle brackets.
	 */
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
	},

	/**
	 * Returns a full email string, with name and email parts.
	 * @return {string}     email string
	 */
	toString: function() {
		return this.getFullEmail();
	}
});
