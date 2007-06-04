<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<zm:getUserAgent var="ua"/>
<c:set var="suffix" value="${ua.isOsWindows ? '.win' : ua.isOsMac ? '.mac' : ua.isOsLinux ? '.linux' :  ''}"/>
<fmt:bundle basename="/keys/ZhKeys">
    <fmt:message var="sections" key="sections"/>
    <table border="0" cellpadding="0" cellspacing="4" width=100%>
        <tbody>
            <c:forEach var="section" items="${fn:split(sections,',')}">
                <tr>
                    <td>
                    <table class='shortcutList' cellspacing=0 cellpadding=0>
                        <tr>
                            <td class='shortcutListHeader' colspan=2>
                                <div class='PanelHead'>
                                    <fmt:message var="desc" key="${section}.description"/>
                                    <c:out value="${desc}"/>
                                </div>
                            </td>
                        </tr>

                        <fmt:message var="keys" key="${section}.keys"/>
                        <c:forEach var="msgkey" items="${fn:split(keys,',')}">
                            <c:set var="msgkey" value="${fn:trim(msgkey)}"/>
                            <fmt:message var="keyseqlist" key="${msgkey}${suffix}"/>
                            <c:if test="${fn:startsWith(keyseqlist, '???')}">
                                <fmt:message var="keyseqlist" key="${msgkey}"/>
                            </c:if>
                            <fmt:message var="msgkeyDesc" key="${msgkey}.description"/>
                            <c:if test="${not empty msgkeyDesc and not fn:startsWith(keyseqlist, '???')}">
                                <tr>
                                    <td width="30%" class='shortcutKeys'>
                                        <c:set var="keyseqlist" value="${fn:trim(keyseqlist)}"/>
                                        <c:forEach var="keyseq" items="${fn:split(keyseqlist, ';')}" varStatus="keyseqStatus">
                                            <c:set var="keyseq" value="${fn:trim(keyseq)}"/>
                                                <c:if test="${not keyseqStatus.first}">
                                                    <fmt:message key="keyseq.or"/>
                                                </c:if>
                                                <span class='shortcutKeyCombo'>
                                                    <c:forEach var="key" items="${fn:split(keyseq, ',')}" varStatus="keyStatus">
                                                        <c:set var="key" value="${fn:trim(key)}"/>
                                                        <c:if test="${fn:contains(key, 'Alt+')}">
                                                            <span class='shortcutKey'><fmt:message key="key.Alt"/></span>
                                                            <c:set var="key" value="${fn:replace(key,'Alt+','')}"/>
                                                            <fmt:message key="keyseq.plus"/>
                                                        </c:if>
                                                        <c:if test="${fn:contains(key, 'Ctrl+')}">
                                                            <span class='shortcutKey'><fmt:message key="key.Ctrl"/></span>
                                                            <c:set var="key" value="${fn:replace(key,'Ctrl+','')}"/>
                                                            <fmt:message key="keyseq.plus"/>
                                                        </c:if>
                                                        <c:if test="${fn:contains(key, 'Meta+')}">
                                                            <span class='shortcutKey'><fmt:message key="key.Meta"/></span>
                                                            <c:set var="key" value="${fn:replace(key,'Meta+','')}"/>
                                                            <fmt:message key="keyseq.plus"/>
                                                        </c:if>
                                                        <c:if test="${fn:contains(key, 'Shift+')}">
                                                            <span class='shortcutKey'><fmt:message key="key.Shift"/></span>
                                                            <c:set var="key" value="${fn:replace(key,'Shift+','')}"/>
                                                            <fmt:message key="keyseq.plus"/>
                                                        </c:if>

                                                        <fmt:message var="keyMsg" key="key.${key}"/>
                                                        <c:if test="${fn:startsWith(keyMsg,'???')}">
                                                            <c:set var="keyMsg" value="${fn:escapeXml(fn:toLowerCase(key))}"/>
                                                        </c:if>
                                                        <span class='shortcutKey'>
                                                                ${keyMsg}
                                                        </span>
                                                    </c:forEach>
                                                </span>
                                        </c:forEach>
                                    </td>
                                    <td class='shortcutDescription'>
                                        ${msgkeyDesc}
                                    </td>
                                </tr>
                            </c:if>
                        </c:forEach>
                    </table>
                    </td>
                </tr>
            </c:forEach>
        </tbody>
    </table>
</fmt:bundle>