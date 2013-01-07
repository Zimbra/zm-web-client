Ext.define('ZCS.model.ZtSoapProxy', {

	extend: 'Ext.data.proxy.Ajax',

	alias: 'proxy.soapproxy',

	doRequest: function(operation, callback, scope) {

		var me = this,
			inlineResults = ZCS.session.getInitialSearchResults();

		if (inlineResults) {
			var request = me.buildRequest(operation),
				response;

			operation.config.query = ZCS.session.getSetting(ZCS.constant.SETTING_INITIAL_SEARCH);

			request.setConfig({
				headers  : me.getHeaders(),
				timeout  : me.getTimeout(),
				method   : me.getMethod(request),
				callback : me.createRequestCallback(request, operation, callback, scope),
				scope    : me,
				proxy    : me
			});

			var data = {
				Body: {
					SearchResponse: inlineResults
				}
			};

			response = {
				request: request,
				requestId : request.id,
				status : 200,
				statusText : 'OK',
				getResponseHeader : function(header) {
					return '';
				},
				getAllResponseHeaders : function() {
					return {};
				},
				responseText : data
			};

			this.processResponse(true, operation, request, response, callback, scope);
			ZCS.session.setInitialSearchResults(null);
		}
		else {
			return me.callParent(arguments);
		}
	},

	processResponse: function(success, operation, request, response, callback, scope) {
		this.callParent(arguments);
		var query = operation.config.query;
		if (query && ZCS.session.getSetting(ZCS.constant.SETTING_SHOW_SEARCH)) {
			ZCS.session.getActiveSearchField().setValue(query);
		}
	}
});
