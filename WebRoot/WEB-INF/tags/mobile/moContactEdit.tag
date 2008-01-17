<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<c:set var="id" value="${id != null ?id : param.id}"/>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'mosearch'}"/>
<zm:currentResultUrl var="closeUrl" value="${context_url}" context="${context}"/>
<mo:handleError>
    <zm:getMailbox var="mailbox"/>
    <c:choose>
        <c:when test="${not empty mailbox.prefs.locale}">
            <fmt:setLocale value='${mailbox.prefs.locale}' scope='request'/>
        </c:when>
        <c:otherwise>
            <fmt:setLocale value='${pageContext.request.locale}' scope='request'/>
        </c:otherwise>
    </c:choose>
    <fmt:setBundle basename="/messages/ZhMsg" scope="session"/>
    <fmt:message var="title" key="contact"/>
    <c:choose>
        <c:when test="${!empty id or requestScope.contactId}">
            <zm:getContact var="contact" id="${id}"/>
        </c:when>
        <c:otherwise>
            <c:set var="contact" value="${null}"/>
        </c:otherwise>
    </c:choose>
</mo:handleError>

<mo:view mailbox="${mailbox}" context="${null}" title="${contact!=null?contact.firstName:''}">

<c:url var="caction" value="${closeUrl}">
    <c:if test="${param.pid!=null}">
        <c:param name="action" value="view"/>
        <c:param name="id" value="${param.pid}"/>
    </c:if>
</c:url>
<%--<c:set var="factionurl" value="${context_url}?st=contact"/>
<c:if test="${contact!=null}">
    <c:set var="factionurl" value="${caction}"/>
</c:if>--%>
<form action="${caction}" method="post" accept-charset="utf-8">
<input type="hidden" name="doContactAction" value="1"/>
<table width=100% cellpadding="0" cellspacing="0">
    <%-- <tr>
        <td>
            <table width=100% cellspacing="0" cellpadding="0">
                <tr class='zo_toolbar'>
                    <td class="searchbar">
                        <div class='zo_main_info_cont'>
                        <div class='zo_main_info'>

                        <table cellspacing="0" cellpadding="0">
                            <tr>
                                <td style='padding-left:5px' class='zo_tb_submit'>
                                    <c:if test="${contact!=null}">
                                        <input name="actionSave" type="submit" value="<fmt:message key="save"/>">
                                    </c:if>
                                    <c:if test="${contact==null}">
                                        <input name="actionAdd" type="submit" value="<fmt:message key="add"/>">
                                    </c:if>
                                </td>
                                <td style='padding-left:5px' class='zo_tb_submit'>
                                    <input name="actionCancel" ${uiv=='1'?'onclick=zClickLink("_back_to")':''} type="${uiv=='1'?'button':'submit'}" value="<fmt:message key="cancel"/>">
                                </td>
                            </tr>
                        </table>
                            </div>
                          </div>
                    </td>

                </tr>
            </table>
        </td>
    </tr>--%>
<tr>
    <td class="searchbar">
                    <span style="font-size:large;font-weight:bold;">
                        <c:if test="${contact!=null}">
                            <fmt:message key="modify"/>
                        </c:if>
                        <c:if test="${contact==null}">
                            <fmt:message key="add"/>
                        </c:if>&nbsp;<fmt:message key="contact"/>
                    </span>
                    <hr size="1"/>
        <div class='zo_main_info_cont'>
            <div class='zo_cv_cont'>
                <table cellpadding="2" cellspacing="5" width="100%" class='Compose'>
                    <tr>
                                <td class='zo_mc_fname' valign='top' width=1% align=right nowrap> <label for="firstNameField"><fmt:message key="AB_FIELD_firstName"/>&nbsp;<fmt:message key="name"/>: </label></td>
                                <td class='zo_mc_fvalue' colspan=2 nowrap>
                                    <input  id="firstNameField"style='width:100%'
                                                               name="firstName" value="${fn:escapeXml(contact.firstName)}"/>
                                </td>
                            </tr>

                    <tr>
                                <td class='zo_mc_fname' valign='top' width=1% align=right nowrap> <label for="lastNameField"><fmt:message key="AB_FIELD_lastName"/>&nbsp;<fmt:message key="name"/>: </label></td>
                                <td class='zo_mc_fvalue' colspan=2 nowrap>
                                    <input  id="lastNameField"style='width:100%'
                                                               name="lastName" value="${fn:escapeXml(contact.lastName)}"/>
                                </td>
                            </tr>
                           <tr>
                                <td class='zo_mc_fname' valign='top' width=1% align=right nowrap> <label for="emailField"><fmt:message key="email"/>: </label></td>
                                <td class='zo_mc_fvalue' colspan=2 nowrap>
                                    <input  id="emailField"style='width:100%'
                                                               name="email" value="${fn:escapeXml(contact.email)}"/>
                                </td>
                            </tr>
                            <tr>
                                <td class='zo_mc_fname' valign='top' width=1% align=right nowrap> <label for="emailField"><fmt:message key="AB_FIELD_mobilePhone"/>: </label></td>
                                <td class='zo_mc_fvalue' colspan=2 nowrap>
                                    <input  id="mobileField"style='width:100%'
                                                               name="mobilePhone" value="${fn:escapeXml(contact.mobilePhone)}"/>
                                </td>
                            </tr>
                            </table>
                        </div>
                        </div>
                </td>
            </tr>
        <tr>
                <td> <hr size="1">
                    <table width=100% cellspacing="0" cellpadding="0">
                        <tr class='zo_toolbar'>
                            <td class="searchbar">
                                <table cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td style='padding-left:5px' class='zo_tb_submit'>
                                            <c:if test="${contact!=null}">
	                                            <input name="actionSave" type="submit" value="<fmt:message key="save"/>">
											</c:if>
											<c:if test="${contact==null}">
	                                            <input name="actionAdd" type="submit" value="<fmt:message key="add"/>">
											</c:if>
                                        </td>
                                        <td style='padding-left:5px' class='zo_tb_submit'>
                                            <input name="actionCancel" onclick='zClickLink("_back_to")' type="button" value="<fmt:message key="cancel"/>">
                                        </td>
                                    </tr>
                                </table>
                            </td>

                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <input type="hidden" name="id" value="${fn:escapeXml(contact.id)}"/>
    </form>
<a href="${caction}" id="_back_to" style="display:none;visibility:hidden">back</a>
</mo:view>
