/**
 * This class generates the JSON for contact-related SOAP requests.
 */
Ext.define('ZCS.model.contacts.ZtContactWriter', {

	extend: 'ZCS.model.ZtWriter',

	alias: 'writer.contactwriter',

	writeRecords: function(request, data) {

		var json = this.getSoapEnvelope(request, data),
			query = request.getOperation().config.query;

		if (!query) {
			// if there's no query, this is the initial load so get all contacts
			json.Body.GetContactsRequest = {
				_jsns: "urn:zimbraMail",
				sortBy: "nameDesc",
				// ask server only for the fields we need
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
			// replace the configured 'read' operation URL
			request.setUrl(ZCS.constant.SERVICE_URL_BASE + 'SearchRequest');

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
