<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2007, 2008, 2009, 2010, 2012, 2013, 2014, 2016 Synacor, Inc.
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
--%>
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

<zm:getUserAgent var="ua" session="true"/>

<c:forEach var="part" items="${message.attachments}">
    <c:set var="cid" value="${fn:replace(part.contentId,'<' ,'')}"/>
    <c:set var="cid" value="cid:${fn:replace(cid,'>' ,'')}"/>
    <c:set var="imageUrl" value="/service/home/~/?id=${message.id}&amp;part=${part.partName}&amp;auth=co"/>
    <c:set var="theBody" value="${fn:replace(theBody,cid,imageUrl)}"/>
</c:forEach>

<c:choose>
    <c:when test="${ua.isiPhone or ua.isiPod or ua.isiPad or ua.isOsAndroid}">
        <c:choose>
            <c:when test="${body.isTextHtml}">
        <script type="text/javascript">
       (function() {
            var isKonqueror = /KHTML/.test(navigator.userAgent);
                var isIE = ( /MSIE/.test(navigator.userAgent) && !/(Opera|Gecko|KHTML)/.test(navigator.userAgent) );
                var iframe = document.createElement("iframe");
                iframe.style.width = "100%";
                iframe.style.height = "100px";
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
    </c:when>
    <c:otherwise>
        ${theBody}
    </c:otherwise>
</c:choose>
