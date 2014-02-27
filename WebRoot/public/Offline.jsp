<!--
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
-->
<html manifest="<%=request.getParameter("url")%>">
<head>
	<script>
		window.addEventListener('load', function(e) {
			var appCache = window.applicationCache;
			var parent = window.parent;
			var ZmOffline = parent.ZmOffline;
			var AjxDebug = parent.AjxDebug;
			// Checking for an update. Always the first event fired in the sequence.
			appCache.addEventListener('checking', function() {
				ZmOffline.refreshStatusIcon(true);
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: checking");
			}, false);
			// Fired after the first cache of the manifest.
			appCache.addEventListener('cached', function() {
				ZmOffline.setAppCacheStatus(true);
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: cached");
			}, false);
			// Fired when the manifest resources have been newly redownloaded.
			appCache.addEventListener('updateready', function() {
				ZmOffline.setAppCacheStatus(true);
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: updateready");
			}, false);
			// Fired after the first download of the manifest.
			appCache.addEventListener('noupdate', function() {
				ZmOffline.setAppCacheStatus(true);
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: noupdate");
			}, false);
			// The manifest returns 404 or 410, the download failed,
			// or the manifest changed while the download was in progress.
			appCache.addEventListener('error', function() {
				ZmOffline.setAppCacheStatus(false);
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: error");
			}, false);
			// Fired if the manifest file returns a 404 or 410.
			// This results in the application cache being deleted.
			appCache.addEventListener('obsolete', function() {
				ZmOffline.setAppCacheStatus(false);
				AjxDebug.println(AjxDebug.OFFLINE, "Application Cache :: obsolete");
			}, false);
		}, false);
	</script>
</head>
    <body></body>
</html>
