/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014, 2016 Synacor, Inc.
 *
 * The contents of this file are subject to the Common Public Attribution License Version 1.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.zimbra.com/license
 * The License is based on the Mozilla Public License Version 1.1 but Sections 14 and 15
 * have been added to cover use of software over a computer network and provide for limited attribution
 * for the Original Developer. In addition, Exhibit A has been modified to be consistent with Exhibit B.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and limitations under the License.
 * The Original Code is Zimbra Open Source Web Client.
 * The Initial Developer of the Original Code is Zimbra, Inc.  All rights to the Original Code were
 * transferred by Zimbra, Inc. to Synacor, Inc. on September 14, 2015.
 *
 * All portions of the code are Copyright (C) 2013, 2014, 2016 Synacor, Inc. All Rights Reserved.
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
var fetchTimer;

onconnect = function(e) {
    var port = e.ports[0];
    ports.push(port);
    port.onmessage = function (msgEvent)
    {
        var msg = msgEvent.data;
        if (!msg) {
            //onmessage called with no data
            return;
        }
        if (msg.topic === "social.port-closing") {
            if (port == apiPort) {
                apiPort.close();
                apiPort = null;
            }
            return;
        }
        if (msg.topic === "social.initialize") {
            apiPort = port;
			fetchData(msg.data.csrfToken);
			//setInterval(fetchData, CHECK_INTERVAL);
        }
        if (msg.topic === "worker.reload") {
            fetchData(msg.data.csrfToken);
        }
    }

    broadcast = function (topic, payload)
    {
        // we need to broadcast to all ports connected to this markd worker
        for (var i = 0; i < ports.length; i++) {
            try {
                ports[i].postMessage({topic: topic, data: payload});
            } catch(e) {
                ports.splice(i, 1);
            }
        }
    }

    fetchData = function (csrfToken) {
        if (fetchTimer) {
            clearTimeout(fetchTimer);
        }
        fetchTimer = setTimeout(fetchData, CHECK_INTERVAL);
		var requestStr = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Header><context xmlns="urn:zimbra"><csrfToken>' + csrfToken + '</csrfToken><userAgent xmlns="" name="ZimbraWebClient - FF24 (Mac)"/><session xmlns=""/><format xmlns="" type="js"/></context></soap:Header><soap:Body><GetInfoRequest xmlns="urn:zimbraAccount" sections=""/></soap:Body></soap:Envelope>';

		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "/service/soap/GetInfoRequest", false);
		xmlhttp.send(requestStr);

		if (xmlhttp.status == 200 || xmlhttp.status == 201) {
            broadcast("sidebar.authenticated"); //send authenticated message.
			var jsonResponse = JSON.parse(xmlhttp.responseText);
			var folderInfo = jsonResponse.Header.context.refresh.folder[0].folder;
			if (apiPort) {
				apiPort.postMessage({topic: 'social.user-profile', data: {
					userName: jsonResponse.Body.GetInfoResponse.name,
					displayName: jsonResponse.Body.GetInfoResponse.name,
					portrait: ICON,
					profileURL: baseurl
				}});
				for (var i = 0; i < folderInfo.length; i++) {
					if (folderInfo[i].absFolderPath === "/Inbox") {
						apiPort.postMessage({topic: 'social.ambient-notification',
							data: {
								name: "mail",
								iconURL: MAIL_ICON,
                                contentPanel: baseurl + "/public/launchSidebar.jsp",
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

