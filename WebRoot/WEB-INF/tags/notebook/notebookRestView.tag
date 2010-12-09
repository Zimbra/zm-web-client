<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2008, 2009, 2010 Zimbra, Inc.
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
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<app:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:choose>
        <c:when test="${not empty mailbox.prefs.locale}">
            <fmt:setLocale value='${mailbox.prefs.locale}' scope='request' />
        </c:when>
        <c:otherwise>
            <fmt:setLocale value='${pageContext.request.locale}' scope='request' />
        </c:otherwise>
    </c:choose>
    <fmt:setBundle basename="/messages/ZhMsg" scope="request"/>
    <fmt:message var="title" key="notebook"/>
    <c:set var="folderPath" value="${context.folder.path}" />
    <c:set var="iframeUrl" value="/home/${mailbox.name}/${folderPath}" />
</app:handleError>

<c:set var="toolbar">
                <table cellspacing="0" cellpadding="0" class='Tb'>
                    <tr>
                        <td nowrap>&nbsp;</td>
                        <td nowrap>
                            <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                            <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgRefresh.png" altkey="refresh"/><span>&nbsp;<fmt:message key="refresh"/></span></a>
                        </td>
                        <td nowrap>&nbsp;</td>
                        <td><div class='vertSep'></div></td>
                        <td nowrap>&nbsp;</td>
                        <td nowrap>
                            <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                            <a href="${fn:escapeXml(iframeUrl)}" target="_blank" <c:if test="${keys}"></c:if>><app:img src="startup/ImgPrint.png" altkey="refresh"/><span>&nbsp;<fmt:message key="print"/></span></a>
                        </td>
                    </tr>
                </table>

</c:set>


<app:view mailbox="${mailbox}" title="${title}" selected='wiki' notebook="${true}" tags="true" context="${context}" keys="true">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td class='TbTop'>
                ${toolbar}
            </td>
        </tr>
        <tr>
            <td class="list" style="padding:10px;">
                <iframe onload="resizeIframe();" id="notebookIframe" style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" frameBorder="0" src="${fn:escapeXml(iframeUrl)}"></iframe>
            </td>
        </tr>
        <tr>
            <td class='TbBottom'>
                ${toolbar}
            </td>
        </tr>
    </table>

    <script type="text/javascript">

        var isKonqueror = /KHTML/.test(navigator.userAgent);
        var isIE = ( /MSIE/.test(navigator.userAgent) && !/(Opera|Gecko|KHTML)/.test(navigator.userAgent) );
        var iframe = document.getElementById("notebookIframe");
        iframe.style.width = "100%";
        iframe.style.height = "100px";
        iframe.style.overflowX = "auto";
        iframe.scrolling = "no";
        iframe.marginWidth = 0;
        iframe.marginHeight = 0;
        iframe.border = 0;
        iframe.frameBorder = 0;
        iframe.style.border = "none";

        var resizeIframe = function() {
            if (iframe !=null) {
                var w = iframe.offsetWidth, b = iframe.contentWindow.document.body;
                if (b.scrollWidth > w) {
                    b.style.overflow = "auto";
                    b.style.width = w + "px";
                } else {
                    iframe.style.width = b.scrollWidth - 20 + "px";
                }
                iframe.style.height = b.scrollHeight + 30 + "px";
            }
        }

    </script>
</app:view>