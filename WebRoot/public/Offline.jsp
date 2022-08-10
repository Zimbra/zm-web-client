<!--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013, 2014, 2016 Synacor, Inc.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software Foundation,
 * version 2 of the License.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 * ***** END LICENSE BLOCK *****
-->
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<c:if test="${not empty param.isFirefox && param.isFirefox eq 'true'}">
	<c:set var="overrideCacheControl" value="true" scope="session" />
</c:if>
<html manifest="${fn:escapeXml(param.url)}">
<head>
	<script>
			var retryOnError = ${param.retryOnError eq 'true'};
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
				// If error event is fired reload the application cache after 2 seconds.
				if (retryOnError) {
					AjxDebug.println(AjxDebug.OFFLINE, "Reloading Application Cache due to error :: " + AjxDebug._getTimeStamp());
					setTimeout(parent.appCtxt.reloadAppCache.bind(parent.appCtxt, false, false), 2000);
				}
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
