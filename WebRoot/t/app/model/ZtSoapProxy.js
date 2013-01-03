Ext.define('ZCS.model.ZtSoapProxy', {

	extend: 'Ext.data.proxy.Ajax',

	alias: 'proxy.soapproxy',

	doRequest: function(operation, callback, scope) {

		var me = this,
			inlineResults = ZCS.common.ZtUserSession.getInitialSearchResults();

		if (inlineResults) {
			var request = me.buildRequest(operation),
				response;

			request.setConfig({
				headers  : me.getHeaders(),
				timeout  : me.getTimeout(),
				method   : me.getMethod(request),
				callback : me.createRequestCallback(request, operation, callback, scope),
				scope    : me,
				proxy    : me
			});

			/*
			 Date: Fri, 21 Dec 2012 06:14:01 GMT
			 Content-Length: 13322
			 Content-Type: text/javascript; charset=utf-8
			 Cache-Control: no-store, no-cache
			 */

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
			ZCS.common.ZtUserSession.setInitialSearchResults(null);
		}
		else {
			return me.callParent(arguments);
		}
	}

//	processResponse: function(success, operation, request, response, callback, scope) {
//		if (success === true && (request.getUrl().indexOf('SendMsgResponse') !== -1)) {
//			return;
//		}
//		else {
//			this.callParent(arguments);
//		}
//	}
});
