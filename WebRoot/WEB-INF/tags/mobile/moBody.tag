<%@ tag body-content="empty" %>
<%@ attribute name="message" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMessageBean" %>
<%@ attribute name="body" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMimePartBean" %>
<%@ attribute name="theBody" rtexprvalue="true" required="true" type="java.lang.String" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="counter" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:choose>
    <c:when test="${body.isTextHtml}">
        <c:url var="iframeUrl" value="/h/imessage">
            <c:param name="id" value="${message.id}"/>
            <c:param name="part" value="${message.partName}"/>
            <c:param name="bodypart" value="${body.partName}"/>
            <c:param name="xim" value="${param.xim}"/>
        </c:url>
        <noscript>
            <iframe style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" border="0" frameBorder="0" src="${iframeUrl}"></iframe>
        </noscript>
        <script type="text/javascript">
       (function() {
            var isKonqueror = /KHTML/.test(navigator.userAgent);
                var isIE = ( /MSIE/.test(navigator.userAgent) && !/(Opera|Gecko|KHTML)/.test(navigator.userAgent) );
                var iframe = document.createElement("iframe");
                iframe.style.width = "100%";
                iframe.style.height = "100px";
                /*iframe.style.overflowX = "auto";*/
                /*iframe.scrolling = "no";*/
                iframe.marginWidth = 0;
                iframe.marginHeight = 0;
                iframe.border = 0;
                iframe.frameBorder = 0;
                iframe.style.border = "none";
                function resizeAndNullIframe() { resizeIframe(); /*iframe = null; */};
                function resizeIframe() {
                    if (iframe !=null) {
                        iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
                        iframe.style.width = iframe.contentWindow.document.body.scrollWidth + "px";
                    }
                };
                document.getElementById("iframeBody${counter}").appendChild(iframe);
                var doc = iframe.contentWindow ? iframe.contentWindow.document : iframe.contentDocument;
                doc.open();
                doc.write("${zm:jsEncode(theBody)}");
                doc.close();
                //if (keydownH) doc.onkeydown = keydownH;
                //if (keypressH) doc.onkeypress = keypressH;
                setTimeout(resizeIframe, 500);
                function onIframeLoad() { if (isKonqueror) setTimeout(resizeAndNullIframe, 100); else if (!isIE || iframe.readyState == "complete") resizeAndNullIframe();};
                if (isIE) iframe.onreadystatechange = onIframeLoad;
                else iframe.onload = onIframeLoad;
            })();
        </script>
    </c:when>
    <c:otherwise>
        ${theBody}
    </c:otherwise>
</c:choose>
