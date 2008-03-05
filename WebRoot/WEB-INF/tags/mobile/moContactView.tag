<%@ tag body-content="empty" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<c:set var="id" value="${not empty id?id:(empty param.id ? context.currentItem.id : param.id)}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <zm:getContact id="${id}" var="contact"/>
    <c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
    <zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
    <zm:computeNextPrevItem var="cursor" searchResult="${context.searchResult}" index="${context.currentItemIndex}"/>
</mo:handleError>


<mo:view mailbox="${mailbox}" title="${contact.displayFileAs}" context="${null}" clazz="zo_obj_body" scale="true">


    <table width="100%" cellpadding="0" cellspacing="0" border="0" class="Stripes">
        <tr>
            <td>
                <mo:contactToolbar cid="${contact.id}" urlTarget="${context_url}" context="${context}" keys="false"/>
            </td>
        </tr>
        <tr>
            <td><br>
            	<table cellpadding="0" cellspacing="0" border="0">
                <tr>
                <td width="1%" class="Padding"><img src="<app:imgurl value='large/ImgPerson_48.gif' />" border="0" width="48" height="48" class="Padding"/></td>
                <td>
                <b>${fn:escapeXml(contact.displayFileAs)}</b>
				<br>		            
                <c:if test="${not empty contact.jobTitle}">
                   <span class="SmallText">${fn:escapeXml(contact.jobTitle)}</span>
                <br>
                </c:if>
                <c:if test="${not empty contact.company}">
                   <span class="SmallText">${fn:escapeXml(contact.company)}</span>
                </c:if>
                </td></tr>
				</table>
                <mo:displayContact contact="${contact}"/>
            </td>
        </tr>
        <tr>
            <td align="center">
                <zm:currentResultUrl var="actionUrl" value="${context_url}" context="${context}"/>
                    <form id="action" action="${fn:escapeXml(actionUrl)}" method="post">
                        <input type="hidden" name="doContactAction" value="1"/>
                        <input type="hidden" name="id" value="${contact.id}"/>
                        <input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
                                    <input type="button" onclick="zClickLink('_edit_link')"
                                           value="<fmt:message key="edit"/>"/>
                                    <input name="actionDelete" type="submit" value="<fmt:message key="delete"/>"/>					
                                <%--<tr>
                                    <td align="right"><a href="#top">&nbsp;^&nbsp;</a></td>
                                </tr>--%>
                        
                    </form>
            	<br>
            </td>
        </tr>
    </table>
</mo:view>
