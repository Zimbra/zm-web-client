/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2011, 2012 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

var apiPort;
var ports = [];
var loc = location.href;
var baseurl = loc.substring(0,loc.lastIndexOf('/js'));
parseQueryString = function() {
    var str = location.search;
    var objURL = {};
    str.replace(
    	new RegExp( "([^?=&]+)(=([^&]*))?", "g" ),
    	function(match, p1, offset, string ){
    		objURL[p1] = string;
    	}
    );
    return objURL;
};
var queryParams = parseQueryString();
var MAIL_ICON = baseurl + queryParams.mailIconURL;
var ICON = baseurl + queryParams.iconURL;
var CHECK_INTERVAL = 60 * 1000;

onconnect = function(e) {
    var port = e.ports[0];
    ports.push(port);
    port.onmessage = function (msgEvent)
    {
        var msg = msgEvent.data;
        if (msg.topic == "social.port-closing") {
            if (port == apiPort) {
                apiPort.close();
                apiPort = null;
            }
            return;
        }
        if (msg.topic == "social.initialize") {
            apiPort = port;
			fetchData();
			setInterval(fetchData, CHECK_INTERVAL);
        }
    }

	fetchData = function () {
		var requestStr = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header><context xmlns="urn:zimbra"><userAgent xmlns="" name="ZimbraWebClient - FF24 (Mac)"/><session xmlns=""/><format xmlns="" type="js"/></context></soap:Header><soap:Body><GetInfoRequest xmlns="urn:zimbraAccount" sections=""/></soap:Body></soap:Envelope>';

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "/service/soap/GetInfoRequest", false);
		xmlhttp.send(requestStr);

		if (xmlhttp.status == 200 || xmlhttp.status == 201) {
			var jsonResponse = JSON.parse(xmlhttp.responseText);
			var folderInfo = jsonResponse.Header.context.refresh.folder[0].folder;
			if (apiPort) {
				apiPort.postMessage({topic: 'social.user-profile', data: {
					userName: jsonResponse.Body.GetInfoResponse.name,
					displayName: jsonResponse.Body.GetInfoResponse.name,
					portrait: ICON,
					profileURL: jsonResponse.Body.GetInfoResponse.publicURL
				}});
				for (var i = 0; i < folderInfo.length; i++) {
					if (folderInfo[i].absFolderPath === "/Inbox") {
						apiPort.postMessage({topic: 'social.ambient-notification',
							data: {
								name: "mail",
								iconURL: MAIL_ICON,
								counter: folderInfo[i].u || 0,
								label: "Unread Mail"
							}});
						break;
					}
				}

			}
		} else {
			apiPort.postMessage({topic: 'social.user-profile', data: {}});
		}
	}
}

