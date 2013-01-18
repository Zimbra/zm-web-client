/**
 * A small model to represent an action in an action menu.
 *
 * @see ZtMenu
 * TODO: Do we want to have an 'args' field?
 */
Ext.define('ZCS.model.ZtMenuItem', {
	extend: 'Ext.data.Model',
	config: {
		fields: [
			{ name: 'label', type: 'string' },      // user-visible text
			{ name: 'action', type: 'string' },     // constant for the operation to perform
			{ name: 'listener', type: 'auto' }      // function to run when the action is invoked
		]
	}
});
