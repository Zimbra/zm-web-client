<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %>
<%@ attribute name="id" rtexprvalue="true" required="false" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="mo" uri="com.zimbra.mobileclient" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<c:set var="id" value="${id != null ?id : param.id}"/>
<c:set var="context_url" value="${requestScope.baseURL!=null?requestScope.baseURL:'zmain'}"/>
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
    <fmt:setBundle basename="/messages/ZhMsg" scope='request'/>
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
<fmt:message var="addedit" key="${empty contact ? 'add' : 'edit'}"/>
<c:set var="title" value="${title} : ${addedit}"  scope="request"/>
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
<form action="" method="post" accept-charset="utf-8">
<%--<c:if test="${not empty param.folderid}">
<input type="hidden" name="folderid" value="${fn:escapeXml(param.folderid)}"/>
</c:if>--%>
<input type="hidden" name="doContactAction" value="1"/>
<input type="hidden" name="crumb" value="${fn:escapeXml(mailbox.accountInfo.crumb)}"/>
<div class="Toolbar table">
    <div class="table-row">
        <span class='zo_tb_submit table-cell'>
            <input class="zo_button" id='actionCancel' name="actionCancel"
                               style="display:none;" onclick="zClickLink('_back_to')"
                               type="button" value="<fmt:message key="cancel"/>">
            <noscript><a href="${caction}" class="zo_button"><fmt:message key="cancel"/></a></noscript>
            <script type="text/javascript">document.getElementById('actionCancel').style.display = '';</script>
            <%--<c:if test="${contact!=null}">--%>
                <input class="zo_button" name="actionSave" type="submit" value="<fmt:message key="save"/>">
            <%--</c:if>
            <c:if test="${contact==null}">
                <input class="zo_button" name="actionAdd" type="submit" value="<fmt:message key="add"/>">
            </c:if>--%>

        </span>
    </div>
</div>
<div class="Stripes cont_view">
<c:if test="${contact!=null}">
    <div class="View">
            <div class="table cont_sum_table">
            <div class="table-row">
                <span class="table-cell Person48">&nbsp;
                     <%--<img id="cont-img" src="<app:imgurl value='large/ImgPerson_48.gif' />" border="0"
                                       class=""/>--%>
                 </span>
                <span class="table-cell">
                   <div>
                       <b>${fn:escapeXml(contact.displayFileAs)}</b>
                   </div>
                   <c:if test="${not empty contact.jobTitle}">
                        <div>${fn:escapeXml(contact.jobTitle)}</div>
                   </c:if>
                   <c:if test="${not empty contact.company}">
                        <div>${fn:escapeXml(contact.company)}</div>
                    </c:if>
             </span>
            </div>
            </div>
            <c:if test="${contact.isFlagged || (contact.hasTags && mailbox.features.tagging)}">
            <div class="table">
            <div class="table-row">
                <span class="table-cell">
                <c:if test="${contact.isFlagged}">
                                &nbsp;<mo:img src="startup/ImgFlagRed.gif" alt="flag"/></c:if>
                <c:if test="${contact.hasTags and mailbox.features.tagging}">
                        <c:set var="tags" value="${zm:getTags(pageContext, contact.tagIds)}"/>
                        <c:forEach items="${tags}" var="tag">
                        <span><mo:img src="${tag.miniImage}" alt='${fn:escapeXml(tag.name)}'/>
                                ${fn:escapeXml(tag.name)}</span>
                        </c:forEach>
                </c:if>
                </span>
            </div>
          </div>
          </c:if>
    </div>
</c:if>
<c:if test="${contact==null}">
    <div class="View">
        <fmt:message key="newContact"/>
    </div>
</c:if>
<div class="View">
    <div class="table">
        <mo:contactEditField label="AB_FIELD_lastName" contact="${contact}" field="lastName"/>
        <mo:contactEditField label="AB_FIELD_firstName" contact="${contact}" field="firstName"/>
        <mo:contactEditField label="AB_FIELD_jobTitle" contact="${contact}" field="jobTitle"/>
        <mo:contactEditField label="AB_FIELD_company" contact="${contact}" field="company"/>
<%--    </div>
</div>
<div class="View">
    <div class="table">--%>
        <mo:contactEditField label="AB_FIELD_email" contact="${contact}" field="email"/>
        <mo:contactEditField label="AB_FIELD_email2" contact="${contact}" field="email2"/>
        <mo:contactEditField label="AB_FIELD_email3" contact="${contact}" field="email3"/>
        <mo:contactEditField label="AB_FIELD_mobilePhone" contact="${contact}" field="mobilePhone"/>
        <div class="table-row">
            <span class="table-cell label"><label for="folderSelect"><fmt:message key="addressBook"/> :</label></span>
            <span class="table-cell">
                <input type="hidden" name="origFolderId" value="${empty contact ? '': contact.folderId}"/>
                <select name="folderid" id="folderSelect">
                    <zm:forEachFolder var="folder">
                        <c:if test="${folder.isContactCreateTarget}">
                            <option <c:if test="${(empty contact and ((context.selectedId eq folder.id) or param.folderid eq folder.id or (empty context.selectedId and folder.isContacts))) or (!empty contact and contact.folderId eq folder.id)}">selected="selected"</c:if> value="${folder.id}" />
                            ${fn:escapeXml(folder.rootRelativePath)}
                        </c:if>
                    </zm:forEachFolder>
                </select>
            </span>
        </div>

        <div class="table-row">
            <span class="table-cell">&nbsp;</span>
            <span class="table-cell">
                <span class="right" style="display:none;" id="showHide">
                <a id="showHideLink" href="javascript:void(0);" onclick="showHidemore()"><fmt:message
                key="more"/> </a></span>
            </span>
        </div>
    </div>
</div>
<div id="dtls_div">
<div class="View">
    <div class="table">
        <mo:contactEditField label="AB_FIELD_workPhone" contact="${contact}" field="workPhone"/>
        <mo:contactEditField label="AB_FIELD_workPhone2" contact="${contact}" field="workPhone2"/>
        <%--<mo:contactEditField label="AB_FIELD_workFax" contact="${contact}" field="workFax"/>
        <mo:contactEditField label="AB_FIELD_assistantPhone" contact="${contact}" field="assistantPhone"/>
        <mo:contactEditField label="AB_FIELD_companyPhone" contact="${contact}" field="companyPhone"/>
        <mo:contactEditField label="AB_FIELD_callbackPhone" contact="${contact}" field="callbackPhone"/>--%>
        <mo:contactEditField label="AB_FIELD_workStreet" contact="${contact}" field="workStreet" address="true"/>
        <mo:contactEditField label="AB_FIELD_workCity" contact="${contact}" field="workCity"/>
        <mo:contactEditField label="AB_FIELD_workState" contact="${contact}" field="workState"/>
        <mo:contactEditField label="AB_FIELD_workPostalCode" contact="${contact}" field="workPostalCode"/>
        <mo:contactEditField label="AB_FIELD_workCountry" contact="${contact}" field="workCountry"/>
        <mo:contactEditField label="AB_FIELD_workURL" contact="${contact}" field="workURL"/>
    </div>
</div>
<div class="View">
    <div class="table">
        <mo:contactEditField label="AB_FIELD_homePhone" contact="${contact}" field="homePhone"/>
        <mo:contactEditField label="AB_FIELD_homePhone2" contact="${contact}" field="homePhone2"/>
        <%--<app:contactEditField label="AB_FIELD_homeFax" contact="${contact}" field="homeFax"/>
        <app:contactEditField label="AB_FIELD_mobilePhone" contact="${contact}" field="mobilePhone"/>
        <app:contactEditField label="AB_FIELD_pager" contact="${contact}" field="pager"/>
        <app:contactEditField label="AB_FIELD_carPhone" contact="${contact}" field="carPhone"/>
        --%>
        <mo:contactEditField label="AB_FIELD_homeStreet" contact="${contact}" field="homeStreet" address="true"/>
        <mo:contactEditField label="AB_FIELD_homeCity" contact="${contact}" field="homeCity"/>
        <mo:contactEditField label="AB_FIELD_homeState" contact="${contact}" field="homeState"/>
        <mo:contactEditField label="AB_FIELD_homePostalCode" contact="${contact}" field="homePostalCode"/>
        <mo:contactEditField label="AB_FIELD_homeCountry" contact="${contact}" field="homeCountry"/>
        <mo:contactEditField label="AB_FIELD_homeURL" contact="${contact}" field="homeURL"/>
    </div>
</div>
</div> <%-- Wrapper show hide div--%>
</div>

<div class="Toolbar table">
    <div class="table-row">
        <span class='zo_tb_submit table-cell'>
            <input class="zo_button" id='actionCancel1' name="actionCancel1"
                               style="display:none;" onclick="zClickLink('_back_to')"
                               type="button" value="<fmt:message key="cancel"/>">
            <noscript><a href="${caction}" class="zo_button"><fmt:message key="cancel"/></a></noscript>
            <script type="text/javascript">document.getElementById('actionCancel1').style.display = '';</script>
            <%--<c:if test="${contact!=null}">--%>
                <input class="zo_button" name="actionSave" type="submit" value="<fmt:message key="save"/>">
            <%--</c:if>
            <c:if test="${contact==null}">
                <input class="zo_button" name="actionAdd" type="submit" value="<fmt:message key="add"/>">
            </c:if>--%>

        </span>

    </div>
</div>
<input type="hidden" name="id" value="${fn:escapeXml(contact.id)}"/>
<a href="${caction}" id="_back_to" style="display:none;visibility:hidden">back</a>
</form>
<script type="text/javascript">
    var showHidemore = function() {
        var e = document.getElementById('dtls_div');
        if (e.style.display == 'none') {
            e.style.display = 'block';
                //document.getElementById('showHideLink').innerHTML="Less...";
        } else {
            e.style.display = 'none';
                //document.getElementById('showHideLink').innerHTML='More...';
        }
        return false;

    };
    <c:if test="${empty param.more}">
    document.getElementById('dtls_div').style.display = 'none';
    </c:if>
    document.getElementById('showHide').style.display = '';
</script>

