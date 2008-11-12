<%@ tag body-content="empty" dynamic-attributes="dynattrs" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ attribute name="urlTarget" rtexprvalue="true" required="true" %>
<%@ attribute name="context" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.tag.SearchContext" %><%@ attribute name="isTop" rtexprvalue="true" required="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="com.zimbra.i18n" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>

<c:set var="top_stb" value="${param.top_stb eq '0' ? '0' : (empty sessionScope.top_stb ? '1' : sessionScope.top_stb)}"/>
<c:set var="btm_stb" value="${param.btm_stb eq '0' ? '0' : (empty sessionScope.btm_stb ? '1' : sessionScope.btm_stb)}"/>

<c:set var="top_tb" value="${param.top_tb eq '0' ? '0' : (empty sessionScope.top_tb ? '1' : sessionScope.top_tb)}"/>
<c:set var="btm_tb" value="${param.btm_tb eq '0' ? '0' : (empty sessionScope.btm_tb ? '1' : sessionScope.btm_tb)}"/>

<c:set var="top_fldr_select" value="${param.top_fldr_select eq '1' ? '1' : (empty sessionScope.top_fldr_select ? '0' : sessionScope.top_fldr_select)}"/> <%-- Default disabled--%>
<c:set var="btm_fldr_select" value="${param.btm_fldr_select eq '0' ? '0' : (empty sessionScope.btm_fldr_select ? '1' : sessionScope.btm_fldr_select)}"/> <%-- Default enabled--%>
<c:if test="${not empty requestScope.statusMessage && isTop}"> <%-- For search query errors --%>
    <div class="${requestScope.statusClass}">${fn:escapeXml(requestScope.statusMessage)} </div>
</c:if>
<c:if test="${isTop && '1' eq  top_stb}">
    <div class="SubToolbar table top_${context.isContactSearch ? 'cont' : (context.isMessageSearch ? 'mesg' : 'conv') }_lv_subtoolbar">
        <div class="table-row">
            <div class="table-cell">
                <c:choose>
                    <c:when test="${context.isContactSearch}">
                        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=ab"><fmt:message
                                key="addressBooks"/></a> &#171;
                        <c:if test="${top_fldr_select ne '1'}">
                                ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                        </c:if>
                        <c:if test="${top_fldr_select eq '1'}">
                        <select class="_zo_select_button" name="sfi"
                                onchange="document.location.href='?sfi='+this.value+'&amp;st=contact';">
                            <zm:forEachFolder var="fldr" skiproot="true">
                                <c:if test="${fldr.isContactView}">
                                    <option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''}
                                            value="${fldr.id}">${fn:escapeXml(fn:substring(fldr.name,0,12))}...
                                    </option>
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                        </c:if>
                    </c:when>
                    <c:otherwise>
                        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=folders"><fmt:message
                                key="folders"/></a> &#171;
                        <c:if test="${top_fldr_select ne '1'}">
                            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                        </c:if>
                        <c:if test="${top_fldr_select eq '1'}">
                        <select class="_zo_select_button" name="sfi" onchange="document.location.href='?sfi='+this.value;">
                            <zm:forEachFolder var="fldr" skiproot="true">
                                <c:if test="${fldr.isConversationView || fldr.isMessageView}">
                                    <option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''}
                                            value="${fldr.id}">${fn:escapeXml(fn:substring(fldr.name,0,12))}...
                                    </option>
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                        </c:if>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>
</c:if>
<c:if test="${(isTop && '1' eq  top_tb ) || (!isTop && '1' eq btm_tb) }">
<div class="Toolbar table ${isTop ? 'top_' : 'btm_'}${context.isContactSearch ? 'cont' : (context.isMessageSearch ? 'mesg' : 'conv') }_lv_toolbar">
<div class="table-row">
<span class="table-cell">
<span class="zo_button_group">
<c:choose>
    <c:when test="${context.searchResult.hasPrevPage}">
        <zm:prevResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
        <a accesskey="${requestScope.prev_accesskey}" href="${fn:escapeXml(url)}" class='zo_button prev_button'>
            <!--&#9668;--><fmt:message key="MO_PREV"/>
        </a>
    </c:when>
    <c:otherwise>
        <a class='zo_button_disabled prev_button'>
            <!--&#9668;--><fmt:message key="MO_PREV"/>
        </a>
    </c:otherwise>
</c:choose>
<c:choose>
    <c:when test="${context.searchResult.hasNextPage}">
        <zm:nextResultUrl var="url" value="${urlTarget}" index="0" context="${context}"/>
        <a accesskey="${requestScope.next_accesskey}" class='zo_button next_button' href="${fn:escapeXml(url)}">
           <!-- &nbsp;&#9658;--><fmt:message key="MO_NEXT"/>
        </a>
    </c:when>
    <c:otherwise>
        <a class='zo_button_disabled next_button'>
           <!-- &#9658;--><fmt:message key="MO_NEXT"/>
        </a>
    </c:otherwise>
</c:choose>
</span>
<!--</span>
<span class="table-cell">-->
<c:if test="${context.searchResult.size gt 0}">
    <span>
        <select class="zo_select_button" name="anAction" onchange="document.getElementById('actions').submit();">
            <option value="" selected="selected"><fmt:message key="moreActions"/></option>
                <%--<optgroup label="<fmt:message key="delete"/>">--%>
            <c:choose>
                <c:when test="${not context.folder.isInTrash}">
                    <option value="actionDelete"><fmt:message key="delete"/></option>
                </c:when>
                <c:otherwise>
                    <option value="actionHardDelete"><fmt:message key="delete"/></option>
                </c:otherwise>
            </c:choose>
            <!--</optgroup>-->
            <optgroup label="<fmt:message key='select'/>">
                <option value="selectAll"><fmt:message key="all"/></option>
                <option value="selectNone"><fmt:message key="none"/></option>
            </optgroup>
            
            <c:if test="${!context.isContactSearch}">
                <optgroup label="<fmt:message key="markAs"/>">
                    <option value="actionMarkRead"><fmt:message key="MO_read"/></option>
                    <option value="actionMarkUnread"><fmt:message key="MO_unread"/></option>
                    <c:choose>
                        <c:when test="${context.folder.isSpam}">
                            <option value="actionMarkUnspam"><fmt:message key="actionNotSpam"/></option>
                        </c:when>
                        <c:otherwise>
                            <option value="actionMarkSpam"><fmt:message key="actionSpam"/></option>
                        </c:otherwise>
                    </c:choose>
                </optgroup>
            </c:if>
            <c:if test="${context.isContactSearch}">
                <optgroup label="<fmt:message key="compose"/>">
                    <option value="composeTo"><fmt:message key="to"/></option>
                    <option value="composeCC"><fmt:message key="cc"/></option>
                    <option value="composeBCC"><fmt:message key="bcc"/></option>
                </optgroup>
            </c:if>
            <optgroup label="<fmt:message key="MO_flag"/>">
                <option value="actionFlag"><fmt:message key="add"/></option>
                <option value="actionUnflag"><fmt:message key="remove"/></option>
            </optgroup>

            <optgroup label="<fmt:message key="moveAction"/>">
                <c:choose>
                    <c:when test="${context.isContactSearch}">
                        <zm:forEachFolder var="folder">
                            <c:if test="${folder.id != context.folder.id and folder.isContactMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            </c:if>
                        </zm:forEachFolder>
                    </c:when>
                    <c:otherwise>
                        <zm:forEachFolder var="folder">
                            <c:if test="${folder.id != context.folder.id and folder.isMessageMoveTarget and !folder.isTrash and !folder.isSpam}">
                                <option value="moveTo_${folder.id}">${fn:escapeXml(folder.rootRelativePath)}</option>
                            </c:if>
                        </zm:forEachFolder>
                    </c:otherwise>
                </c:choose>
            </optgroup>
            <c:if test="${mailbox.features.tagging and mailbox.hasTags}">
                <c:set var="allTags" value="${mailbox.mailbox.allTags}"/>
                <optgroup label="<fmt:message key="MO_actionAddTag"/>">
                    <c:forEach var="atag" items="${allTags}">
                        <option value="addTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                    </c:forEach>
                </optgroup>
                <optgroup label="<fmt:message key="MO_actionRemoveTag"/>">
                    <c:forEach var="atag" items="${allTags}">
                        <option value="remTag_${atag.id}">${fn:escapeXml(atag.name)}</option>
                    </c:forEach>
                </optgroup>
            </c:if>
        </select>
        <noscript><input class="zo_button" name="moreActions" type="submit" value="<fmt:message key="actionGo"/>"/></noscript>
    </span>
</c:if>
<!--</span>
<span class="table-cell">-->
<span class=" f-right">
        <c:if test="${!context.isContactSearch}">
            <c:url var="composeUrl" value="${urlTarget}?st=newmail"/>
            <a accesskey="${requestScope.mainaction_accesskey}" href="${composeUrl}" class="zo_button">
                <fmt:message key="compose"/>
            </a>
        </c:if>
        <c:if test="${context.isContactSearch}">
            <c:url var="composeUrl" value="${urlTarget}">
                <c:param name="action" value="edit"/>
                <c:param name="st" value="${context.st}"/>
                <c:param name="folderid" value="${context.folder.id}"/>
            </c:url>
            <a accesskey="${requestScope.mainaction_accesskey}" href="${composeUrl}" class="zo_button">
                <fmt:message key="add"/>
            </a>
        </c:if>

</span>
</span>
</div>
</div>
</c:if>
<c:if test="${!isTop && '1' eq  btm_stb }"> <%-- no_btm_stb => no bottom sub toolbar, set this param to disable bottom subtoolbar --%>
    <div class="SubToolbar table btm_${context.isContactSearch ? 'cont' : (context.isMessageSearch ? 'mesg' : 'conv') }_lv_subtoolbar">
        <div class="table-row">
            <div class="table-cell">
                 <c:choose>
                    <c:when test="${context.isContactSearch}">
                        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=ab"><fmt:message
                                key="addressBooks"/></a> :
                        <c:if test="${btm_fldr_select eq '0'}">
                            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                        </c:if>
                        <c:if test="${btm_fldr_select ne '0'}">
                        <select class="_zo_select_button" name="sfi"
                                onchange="document.location.href='?sfi='+this.value+'&amp;st=${context.st}';">
                            <zm:forEachFolder var="fldr" skiproot="true">
                                <c:if test="${fldr.isContactView}">
                                    <option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''}
                                            value="${fldr.id}">${fn:escapeXml(fn:substring(fldr.name,0,12))}...
                                    </option>
                                </c:if>
                            </zm:forEachFolder>
                        </select>       
                        </c:if>
                    </c:when>
                    <c:otherwise>                           
                        <a accesskey="${requestScope.navlink_accesskey}" href="${urlTarget}?st=folders"><fmt:message
                                key="folders"/></a> :
                        <c:if test="${btm_fldr_select eq '0'}">
                            ${fn:escapeXml(zm:truncate(context.shortBackTo,15,true))}
                        </c:if>
                        <c:if test="${btm_fldr_select ne '0'}">
                        <select class="_zo_select_button" name="sfi" onchange="document.location.href='?sfi='+this.value+'&amp;st=${context.st}';">
                            <zm:forEachFolder var="fldr" skiproot="true">
                                <c:if test="${fldr.isConversationView || fldr.isMessageView}">
                                    <option ${param.sfi eq fldr.id || context.folder.id eq fldr.id ? 'selected="selected"' : ''}
                                            value="${fldr.id}">${fn:escapeXml(fn:substring(fldr.name,0,12))}...
                                    </option>
                                </c:if>
                            </zm:forEachFolder>
                        </select>
                        </c:if>
                    </c:otherwise>
                </c:choose>
            </div>
        </div>
    </div>
</c:if>