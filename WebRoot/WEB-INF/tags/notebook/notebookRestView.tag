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
    <c:set var="title" value="Notebook"/>
</app:handleError>

<c:set var="toolbar">
                <table cellspacing="0" cellpadding="0" class='Tb'>
                    <tr>
                        <td nowrap>&nbsp;</td>
                        <td nowrap>
                            <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                            <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="arrows/ImgRefresh.gif" altkey="refresh"/><span>&nbsp;<fmt:message key="refresh"/></span></a>
                        </td>
                        <td nowrap>&nbsp;</td>
                        <td><div class='vertSep'></div></td>
                        <td nowrap>&nbsp;</td>
                        <td nowrap>
                            <zm:currentResultUrl var="refreshUrl" value="/h/search" context="${context}" refresh="true" />
                            <a href="${fn:escapeXml(refreshUrl)}" <c:if test="${keys}"></c:if>><app:img src="startup/ImgPrint.gif" altkey="refresh"/><span>&nbsp;<fmt:message key="print"/></span></a>
                        </td>
                    </tr>
                </table>

</c:set>


<app:view mailbox="${mailbox}" title="${title}" selected='notebook' notebook="${true}" tags="true" context="${context}" keys="true">
    <c:set var="folderName" value="${context.folder.name}" />
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td class='TbTop'>
                ${toolbar}
            </td>
        </tr>
        <tr>
            <td class="list" style="padding:10px;">
                <c:set var="iframeUrl" value="/home/user1/${folderName}" />
                <iframe id="notebookIframe" style="width:100%; height:600px" scrolling="auto" marginWidth="0" marginHeight="0" frameBorder="0" src="${fn:escapeXml(iframeUrl)}"></iframe>
            </td>
        </tr>
        <tr>
            <td class='TbBottom'>
                ${toolbar}
            </td>
        </tr>
    </table>

    <script type="text/javascript">

        (function() {

            var isKonqueror = /KHTML/.test(navigator.userAgent);
            var isIE = ( /MSIE/.test(navigator.userAgent) && !/(Opera|Gecko|KHTML)/.test(navigator.userAgent) );
            var iframe = document.getElementById("notebookIframe");
            iframe.style.width = "100%";
            iframe.style.height = "20px";
            iframe.style.overflowX = "auto";
            iframe.scrolling = "no";
            iframe.marginWidth = 0;
            iframe.marginHeight = 0;
            iframe.border = 0;
            iframe.frameBorder = 0;
            iframe.style.border = "none";
            //            function resizeAndNullIframe() { resizeIframe(); iframe = null;};
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

            var _delay = isIE ? 300 : 100 ;
            setTimeout(resizeIframe, _delay);
        })();
    </script>
</app:view>