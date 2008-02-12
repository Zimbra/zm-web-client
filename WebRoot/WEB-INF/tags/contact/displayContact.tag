<%@ tag body-content="empty" %>
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<c:set var="noDisplayAs"><fmt:message key="noDisplayAs"/></c:set>
<zm:getMailbox var="mailbox"/>
<table width="100%" cellspacing="0" cellpadding="0">
<tr>
    <td class='ZhBottomSep'>
        <table width="100%" cellspacing="0" cellpadding="0">
            <tr class='${zm:getFolder(pageContext, contact.folderId).styleColor}Bg'>
        <td width="20"><center><app:img src="${contact.isGroup ? 'contacts/ImgGroup.gif' : 'contacts/ImgContact.gif'}" altkey="${contact.imageAltKey}"/></center></td>
        <td class='contactHeader'>${fn:escapeXml(empty contact.displayFileAs ? noDisplayAs : contact.displayFileAs)}
        </td>
        <td align='right' class='Tags'>
            <c:if test="${contact.hasTags and mailbox.features.tagging}">
                <c:set var="tags" value="${zm:getTags(pageContext, contact.tagIds)}"/>
                <c:forEach items="${tags}" var="tag">
                 <span style='white-space:nowrap;'>
                    <app:img altkey="${fn:escapeXml(tag.name)}" src="${tag.miniImage}"/>${fn:escapeXml(tag.name)} </span>
                </c:forEach>
            </c:if>
        </td>
    </tr>
        </table>
    </td>
</tr>
<tr>
    <td>
        <table border="0" cellpadding="2" cellspacing="2" width="100%"><tbody>
    <tr>
        <td class="companyName" width="100%">
            <c:if test="${zm:anySet(contact,'jobTitle company')}">
                ${fn:escapeXml(contact.jobTitle)}
                <c:if test="${!((empty contact.jobTitle) or (empty contact.company))}">,&nbsp;</c:if>
                ${fn:escapeXml(contact.company)}
            </c:if>
        </td><td width="20">
        <c:set var="folderImage" value="${zm:getFolder(pageContext, contact.folderId).image}"/>
        <app:img altkey='ALT_CONTACT_FOLDER' src="${folderImage}"/>
    </td><td
            class="companyFolder">${fn:escapeXml(zm:getFolderName(pageContext, contact.folderId))}</td>
    </tr>
</tbody></table>
    </td>
</tr>
<tr>
    <td>
        <table border="0" cellspacing="3" cellpadding="${contact.isGroup ? 1 : 3}" width="100%">
<tbody>

<c:if test="${contact.isGroup}">
    <c:forEach var="member" items="${contact.groupMembers}">
        <tr>
            <td width='20px'><app:img altkey='ALT_CONTACT_GROUP_EMAIL' src="startup/ImgMessage.gif"/></td>
            <td><nobr>${fn:escapeXml(member)}</nobr></td>            
        </tr>
    </c:forEach>
    <tr><td><br></td></tr>
</c:if>

<c:if test="${zm:anySet(contact,'email email2 email3')}">
    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="email"/></td></tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td class="contactOutput">
            <app:contactLine line="${contact.email}"/>
            <app:contactLine line="${contact.email2}"/>
            <app:contactLine line="${contact.email3}"/>
        </td>
    </tr>
    <tr><td><br></td></tr>
</c:if>

<c:if test="${zm:anySet(contact,'workStreet workCity workState workPostalCode workCountry workURL workPhone workPhone2 workFax assistantPhone companyPhone callbackPhone')}">
    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="work"/></td></tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385" class="contactOutput">
                <app:contactLine line="${contact.workStreet}"/>
                <app:contactLine line="${contact.workCity}"/>
                <app:contactLine line="${contact.workState}"/>
                <app:contactLine line="${contact.workPostalCode}"/>
                <app:contactLine line="${contact.workCountry}"/>
                <c:if test="${!empty contact.workURL}">
                    <c:set var="prefix" value="${fn:contains(contact.workURL,'//') ? '' : 'http://'}"/>
                    <a target=_new href="<c:url value="${prefix}${contact.workURL}"/>">${fn:escapeXml(contact.workURL)}</a>
                </c:if>
        </td>
        <td valign="top" width="385">
            <table width="100%" border="0" cellspacing='3'>
                <tbody>
                    <app:contactPhone label="phone" phone="${contact.workPhone}"/>
                    <app:contactPhone label="phone2" phone="${contact.workPhone2}"/>
                    <app:contactPhone label="fax" phone="${contact.workFax}"/>
                    <app:contactPhone label="assistant" phone="${contact.assistantPhone}"/>
                    <app:contactPhone label="company" phone="${contact.companyPhone}"/>
                    <app:contactPhone label="AB_FIELD_callbackPhone" phone="${contact.callbackPhone}"/>
                    <tr><td></td></tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td><br></td>
    </tr>
</c:if>

<c:if test="${zm:anySet(contact,'homeStreet homeCity homeState homePostalCode homeCountry homeURL homePhone homePhone2 homeFax mobilePhone pager carPhone')}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="home"/></td>
    </tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385" class="contactOutput">
                <app:contactLine line="${contact.homeStreet}"/>
                <app:contactLine line="${contact.homeCity}"/>
                <app:contactLine line="${contact.homeState}"/>
                <app:contactLine line="${contact.homePostalCode}"/>
                <app:contactLine line="${contact.homeCountry}"/>
                <c:if test="${!empty contact.homeURL}">
                    <c:set var="prefix" value="${fn:contains(contact.homeURL,'//') ? '' : 'http://'}"/>
                    <a target=_new href="<c:url value="${prefix}${contact.homeURL}"/>">${fn:escapeXml(contact.homeURL)}</a>
                </c:if>
        </td>
        <td valign="top">
            <table width="100%" border="0" cellspacing='3'>
                <tbody>
                    <app:contactPhone label="phone" phone="${contact.homePhone}"/>
                    <app:contactPhone label="phone2" phone="${contact.homePhone2}"/>
                    <app:contactPhone label="fax" phone="${contact.homeFax}"/>
                    <app:contactPhone label="mobile" phone="${contact.mobilePhone}"/>
                    <app:contactPhone label="pager" phone="${contact.pager}"/>
                    <app:contactPhone label="AB_FIELD_carPhone" phone="${contact.carPhone}"/>
                    <tr><td></td></tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td><br></td>
    </tr>
</c:if>

<c:if test="${zm:anySet(contact,'otherStreet otherCity otherState otherPostalCode otherCountry otherURL otherPhone otherFax')}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="other"/></td>
    </tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td valign="top" width="385" class="contactOutput">
                <app:contactLine line="${contact.otherStreet}"/>
                <app:contactLine line="${contact.otherCity}"/>
                <app:contactLine line="${contact.otherState}"/>
                <app:contactLine line="${contact.otherPostalCode}"/>
                <app:contactLine line="${contact.otherCountry}"/>
                <c:if test="${!empty contact.otherURL}">
                    <c:set var="prefix" value="${fn:contains(contact.otherURL,'//') ? '' : 'http://'}"/>
                    <a target=_new href="<c:url value="${prefix}${contact.otherURL}"/>">${fn:escapeXml(contact.otherURL)}</a>
                </c:if>
        </td>
        <td valign="top" width="385">
            <table width="100%" border="0" cellspacing='3'>
                <tbody>
                    <app:contactPhone label="otherPhone" phone="${contact.otherPhone}"/>
                    <app:contactPhone label="otherFax" phone="${contact.otherFax}"/>
                    <tr><td></td></tr>
                </tbody>
            </table>
        </td>
    </tr>
    <tr>
        <td><br></td>
    </tr>
</c:if>

<c:if test="${!empty contact.notes}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="notes"/></td>
    </tr>
    <tr>
        <td colspan="4" class="contactOutput"><pre>${fn:escapeXml(contact.notes)}</pre><br><br></td>
    </tr>
</c:if>
</tbody>
</table>
    </td>
</tr>
</table>