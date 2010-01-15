<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
--%>
<%@ tag body-content="empty" %>
<%@ attribute name="theBody" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="parentId" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="iframeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<noscript>
	<iframe style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" frameBorder="0" src="${fn:escapeXml(iframeUrl)}"></iframe>
</noscript>
<c:choose>
<c:when test="${fn:length(theBody) gt 100000 and not empty iframeUrl }">
    <iframe style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" frameBorder="0" src="${fn:escapeXml(iframeUrl)}"></iframe>    
</c:when>
    <c:otherwise>
<script type="text/javascript">
	(function() {
		var isKonqueror = /KHTML/.test(navigator.userAgent);
		var isIE = ( /MSIE/.test(navigator.userAgent) && !/(Opera|Gecko|KHTML)/.test(navigator.userAgent) );
		var iframe = document.createElement("iframe");
		iframe.style.width = "100%";
		iframe.style.height = "20px";
		iframe.style.overflowX = "auto";
        iframe.scrolling = "no";
		iframe.marginWidth = 0;
		iframe.marginHeight = 0;
		iframe.border = 0;
		iframe.frameBorder = 0;
		iframe.style.border = "none";
		function resizeAndNullIframe() { resizeIframe(); iframe = null;};
		function resizeIframe() {
			if (iframe !=null) {
				var w = iframe.offsetWidth, b = iframe.contentWindow.document.body;
                if (b.scrollWidth > w) {
					b.style.overflow = "auto";
					b.style.width = w + "px";
				} else {
					iframe.style.width = b.scrollWidth -20 + "px";
				}
                    var i_frame = iframe;
                //alert(b.scrollHeight+"|"+iframe.offsetHeight);
                var _delay = isIE ? 100 : 0 ;
                setTimeout(function(){ i_frame.style.height = b.scrollHeight + 30 + "px";}, _delay);
            }
		};
		document.getElementById("${parentId}").appendChild(iframe);
		var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
		doc.open();
		doc.write("${zm:jsEncode(theBody)}");
		doc.close();
		try {
			if (window.YAHOO && window.zimbraKeydownHandler && window.zimbraKeypressHandler) {
				YAHOO.util.Event.addListener(doc, "keydown", zimbraKeydownHandler);
				YAHOO.util.Event.addListener(doc, "keypress", zimbraKeypressHandler);
			}
		} catch (error) {
			// ignore
		}
		//if (keydownH) doc.onkeydown = keydownH;
		//if (keypressH) doc.onkeypress = keypressH;
        var _delay = isIE ? 300 : 10 ;
        setTimeout(resizeIframe, _delay);
		function onIframeLoad() { if (isKonqueror) setTimeout(resizeAndNullIframe, 100); else if (!isIE || iframe.readyState == "complete") resizeAndNullIframe();};
		if (isIE) iframe.onreadystatechange = onIframeLoad; else iframe.onload = onIframeLoad;
	})();
</script>
</c:otherwise>
</c:choose>