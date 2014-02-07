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
            // Fired after the first cache of the manifest.
            appCache.addEventListener('cached', function() {
                window.parent.ZmOffline.setAppCacheStatus(true);
            }, false);

            // Fired after the first download of the manifest.
            appCache.addEventListener('noupdate', function() {
                window.parent.ZmOffline.setAppCacheStatus(true);
            }, false);

            // The manifest returns 404 or 410, the download failed,
            // or the manifest changed while the download was in progress.
            appCache.addEventListener('error', function() {
                window.parent.ZmOffline.setAppCacheStatus(false);
            }, false);
        }, false);
</script>
</head>
    <body></body>
</html>
