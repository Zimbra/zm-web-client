<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014 Zimbra, Inc.
 * 
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
-->
<%@ page import="org.apache.commons.lang.StringEscapeUtils" %>
<html manifest="<%=StringEscapeUtils.escapeHtml(request.getParameter("url"))%>">
<head>
	<script>
			var appCache = window.applicationCache;
			// Checking for an update. Always the first event fired in the sequence.
			appCache.addEventListener('checking', function() {
                var AjxDebug = parent.AjxDebug;
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: checking :: " + AjxDebug._getTimeStamp());
                parent.ZmOffline.refreshStatusIcon(true);
			}, false);
			// Fired after the first cache of the manifest.
			appCache.addEventListener('cached', function() {
                var AjxDebug = parent.AjxDebug;
                AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: cached :: " + AjxDebug._getTimeStamp());
                parent.ZmOffline.refreshStatusIcon(false);
			}, false);
			// Fired when the manifest resources have been newly redownloaded.
			appCache.addEventListener('updateready', function() {
                var AjxDebug = parent.AjxDebug;
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: updateready :: " + AjxDebug._getTimeStamp());
                parent.ZmOffline.refreshStatusIcon(false);
			}, false);
			// Fired after the first download of the manifest.
			appCache.addEventListener('noupdate', function() {
                var AjxDebug = parent.AjxDebug;
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: noupdate :: " + AjxDebug._getTimeStamp());
                parent.ZmOffline.refreshStatusIcon(false);
			}, false);
			// The manifest returns 404 or 410, the download failed,
			// or the manifest changed while the download was in progress.
			appCache.addEventListener('error', function(ev) {
                var AjxDebug = parent.AjxDebug;
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: error :: " + JSON.stringify(ev) + " :: " + AjxDebug._getTimeStamp());
                parent.ZmOffline.refreshStatusIcon(false);
			}, false);
			// Fired if the manifest file returns a 404 or 410.
			// This results in the application cache being deleted.
			appCache.addEventListener('obsolete', function() {
                var AjxDebug = parent.AjxDebug;
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: obsolete :: " + AjxDebug._getTimeStamp());
                parent.ZmOffline.refreshStatusIcon(false);
			}, false);
			// Fired for each resource listed in the manifest as it is being fetched.
			appCache.addEventListener('progress', function(ev) {
				if (ev && ev.lengthComputable && ev.loaded == ev.total) {
                    var AjxDebug = parent.AjxDebug;
					AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: progress :: loaded :: " + ev.loaded + " :: " + AjxDebug._getTimeStamp());
				}
			}, false);
	</script>
</head>
	<body></body>
</html>
