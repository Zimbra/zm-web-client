<%@ tag body-content="empty" %>
<%@ attribute name="theBody" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="parentId" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="iframeUrl" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<noscript>
	<iframe style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" frameBorder="0" src="${fn:escapeXml(iframeUrl)}"/>
</noscript>
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
					iframe.style.width = b.scrollWidth + "px";
				}
				iframe.style.height = b.scrollHeight + 30 + "px";
			}
		};
		document.getElementById("${parentId}").appendChild(iframe);
		var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
		doc.open();
		doc.write("${zm:jsEncode(theBody)}");
		doc.close();
		try {
			if (YAHOO && zimbraKeydownHandler && zimbraKeypressHandler) {
				YAHOO.util.Event.addListener(doc, "keydown", zimbraKeydownHandler);
				YAHOO.util.Event.addListener(doc, "keypress", zimbraKeypressHandler);
			}
		} catch (error) {
			// ignore
		}
		//if (keydownH) doc.onkeydown = keydownH;
		//if (keypressH) doc.onkeypress = keypressH;
		setTimeout(resizeIframe, 10);
		function onIframeLoad() { if (isKonqueror) setTimeout(resizeAndNullIframe, 100); else if (!isIE || iframe.readyState == "complete") resizeAndNullIframe();};
		if (isIE) iframe.onreadystatechange = onIframeLoad; else iframe.onload = onIframeLoad;
	})();
</script>

