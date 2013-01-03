Ext.define('ZCS.model.contacts.ZtContactWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.contactwriter',

	writeRecords: function(request, data) {

		var json = this.getSoapEnvelope(request, data),
			query = request.getOperation().config.query;

		if (!query) {
			json.Body.GetContactsRequest = {
				_jsns: "urn:zimbraMail",
				sortBy: "nameDesc",
				a: [
					{ n: 'firstName' },
					{ n: 'lastName' },
					{ n: 'email' },
					{ n: 'company' },
					{ n: 'fileAs' }
				]
			};
		}
		else {
			request.setUrl(ZCS.common.ZtConstants.SERVICE_URL_BASE + 'SearchRequest');
			json.Body.SearchRequest = {
				_jsns: "urn:zimbraMail",
				sortBy: "dateDesc",
				offset: 0,
				limit: 20,
				query: query,
				types: 'contact'
			};
		}

		request.setJsonData(json);
		return request;
	}
});
