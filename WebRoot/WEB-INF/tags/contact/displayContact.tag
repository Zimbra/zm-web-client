<%--
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2016 Synacor, Inc.
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
<%@ attribute name="contact" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZContactBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<zm:getMailbox var="mailbox"/>
<c:set var="folder" value="${zm:getFolder(pageContext, contact.folderId)}"/>
<fmt:message var="colorGray" key="colorGray"/>
<fmt:message var="colorMsg" key="${folder.rgbColorMsg}"/>
<%-- colorMsg can be set to "colorNone" in case a custom color is set for the folder. "colorNone" is not defined in ZhMsg.properties, hence the check for "???". TODO: clean up logic--%>
<c:set var="color" value="${zm:lightenColor(not empty folder.rgb ? folder.rgb : ((fn:startsWith(colorMsg,'???') ? colorGray : colorMsg)))}"/>
<table width="100%" cellspacing="0" cellpadding="0">
<tr bgcolor="${color}">
    <td class='ZhBottomSep'>
        <table width="100%" cellspacing="0" cellpadding="0" style="padding:3px;">
        <tr>
        <td rowspan="2" width="20" align="center" valign="bottom" style="padding-right:3px;">
            <c:set var="contactImage" value="${contact.imagePart != null ? contact.imagePart : ''}"/>
            <c:set var="imageUrl" value="/service/home/~/?id=${contact.id}&amp;part=${contactImage}&amp;auth=co"/>
            <app:img clazz="${not ua.isIE ? 'contactImage':'contactImage IEcontactImage' }" src="${not empty contactImage ? imageUrl : (contact.isGroup ? 'large/ImgGroupPerson_48.png' : 'large/ImgPerson_48.png')}" altkey="${contact.imageAltKey}" />
        </td>
        <td>
            <c:if test="${not contact.isGroup}">
            <c:choose>
                <c:when test="${empty contact.displayFileAs}">
                    <div class='contactHeader' style='padding:0;'>
                        <fmt:message var="noDisplayAs" key="noDisplayAs" />
                        ${fn:escapeXml(noDisplayAs)}
                    </div>
                </c:when>
                <c:otherwise>
                    <div class='contactHeader' style='padding:0;'>
                        <app:contactDisplayName contact="${contact}" />
                    </div>
                </c:otherwise>
            </c:choose>
            </c:if>
            <c:if test="${not empty contact.nickname}">
                <div class='companyName'>"${fn:escapeXml(contact.nickname)}"</div>
            </c:if>
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
        <tr>
        <td class="companyName" width="100%">
            <app:contactJobInfo contact="${contact}" />
        </td><td width="20">
        <c:if test="${not contact.isGalContact}">
            <c:set var="folderImage" value="${not empty folder ? folder.image : ''}"/>
            <c:if test="${not empty folderImage}">
               <app:img altkey='ALT_CONTACT_FOLDER' src="${folderImage}"/>
            </c:if>
        </c:if>
        </td>
        <td class="companyFolder">${not empty folder ? zm:getFolderName(pageContext, folder.id) : ''}</td>
        </tr>
        </table>
    </td>
</tr>
<tr>
    <td>
        <table border="0" cellspacing="3" cellpadding="${contact.isGroup ? 1 : 3}" width="100%">
<tbody>

<c:if test="${contact.isGroup}">
    <c:forEach var="member" items="${contact.groupMembers}">
        <c:set var="memberContact" value="${zm:groupMemberById(contact, member)}"/>
        <c:choose>
        <c:when test="${memberContact.isTypeI}">
            <tr>
                <td width="20" valign="top" align="left" style="padding-right:3px;" rowspan="1">
                    <app:img clazz="contactImage" src="large/ImgPersonInline_48.png"/>
                </td>
                <td>
                    <b>${fn:escapeXml(memberContact.id)}</b>
                </td>
            </tr>
        </c:when>
        <c:otherwise>
            <c:set var="memberContactImage" value="${memberContact.imagePart != null ? memberContact.imagePart : ''}"/>
            <c:set var="imageUrl" value="/service/home/~/?id=${memberContact.id}&amp;part=${memberContactImage}&amp;auth=co"/>
            <tr>
                <td width="20" valign="bottom" align="left" style="padding-right:3px;" rowspan="4">
                    <app:img clazz="contactImage" src="${not empty memberContactImage ? imageUrl : (memberContact.isGroup ? 'large/ImgGroupPerson_48.png' : 'large/ImgPerson_48.png')}" altkey="${memberContact.imageAltKey}" />
                </td>
                <td>
                    <b><app:contactDisplayName contact="${memberContact}" /></b>
                </td>
            </tr>
            <tr>
                <td width="100%">
                    <app:contactJobInfo contact="${memberContact}" />
                </td>
                <td width="20" class="contactOutput">
                    <app:contactEmail email="${memberContact.email}"/>
                </td>
                <c:set var="memberContactAttrs" value="${memberContact.attrs}"/>
                <td width="20" class="contactOutput" nowrap="nowrap"><c:if test="${zm:anySet(memberContact,'mobilePhone')}">${fn:escapeXml(memberContactAttrs['mobilePhone'])}</c:if></td>
            </tr>
        </c:otherwise> 
        </c:choose>
        <tr>
            <td colspan="2"><br/></td>
        </tr>
    </c:forEach>
    <tr><td><br></td></tr>
</c:if>

<c:if test="${zm:anySet(contact,'email email2 email3')}">
    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="email"/></td></tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td class="contactOutput">
            <table>
            <app:contactEmail email="${contact.email}"/>
            <app:contactEmail email="${contact.email2}"/>
            <app:contactEmail email="${contact.email3}"/>
            </table>    
        </td>
    </tr>
    <tr><td><br></td></tr>
</c:if>

<c:if test="${zm:anySet(contact, 'imAddress1 imAddress2 imAddress3')}">
    <tr><td colspan="4" class="sectionLabel" valign="top"><fmt:message key="im"/></td></tr>
    <tr>
        <td width="5">&nbsp;</td>
        <td class="contactOutput">
            <table>
            <app:contactIM address="${contact.IMAddress1}"/>
            <app:contactIM address="${contact.IMAddress2}"/>
            <app:contactIM address="${contact.IMAddress3}"/>
            </table>    
        </td>
    </tr>
    <tr><td><br></td></tr>
</c:if>

<c:if test="${zm:anySet(contact,'workStreet workCity workState workPostalCode workCountry workURL workPhone workPhone2 workFax assistantPhone companyPhone callbackPhone')}">
    <app:contactSectionInfo contact="${contact}" prefix="work" phoneFields="workPhone workPhone2 workFax assistantPhone companyPhone callbackPhone" />
</c:if>
<c:if test="${zm:anySet(contact,'homeStreet homeCity homeState homePostalCode homeCountry homeURL homePhone homePhone2 homeFax mobilePhone pager carPhone')}">
    <app:contactSectionInfo contact="${contact}" prefix="home" phoneFields="homePhone homePhone2 homeFax mobilePhone pager carPhone" />
</c:if>
<c:if test="${zm:anySet(contact,'otherStreet otherCity otherState otherPostalCode otherCountry otherURL otherPhone otherFax')}">
    <app:contactSectionInfo contact="${contact}" prefix="other" phoneFields="otherPhone otherFax" />
</c:if>

<c:if test="${!empty contact.birthday}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="AB_FIELD_birthDay"/></td>
    </tr>
    <tr>
        <td colspan="4" class="contactOutput">${zm:cook(contact.birthday)}</td>
    </tr>
    <tr><td><br></td></tr>
</c:if>
<c:if test="${!empty contact.otherAnniversary}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="AB_FIELD_otherAnniversary"/></td>
    </tr>
    <tr>
        <td colspan="4" class="contactOutput">${zm:cook(contact.otherAnniversary)}</td>
    </tr>
    <tr><td><br></td></tr>
</c:if>
<c:if test="${!empty contact.otherCustom1}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="AB_FIELD_otherCustom1"/></td>
    </tr>
    <tr>
        <td colspan="4" class="contactOutput">${zm:cook(contact.otherCustom1)}</td> 
    </tr>
    <tr><td><br></td></tr>
</c:if>
<c:if test="${!empty contact.notes}">
    <tr>
        <td colspan="4" class="sectionLabel" valign="top"><fmt:message key="notes"/></td>
    </tr>
    <tr>
        <td colspan="4" class="contactOutput">${zm:htmlNewlineEncode(fn:escapeXml(contact.notes))}</td>
    </tr>
</c:if>
</tbody>
</table>
</td>
</tr>
</table>