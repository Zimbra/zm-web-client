<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


<table cellspacing="0" class='Tb' width="100%">
    <tr>
        <td class='TbBt'>
            <table cellspacing="0" cellpadding="0" class='Tb'>
               <tr>
                   <c:choose>
                       <c:when test="${selected eq 'filter'}">
                           <c:set var="rules" value="${empty param.ruleName ? mailbox.filterRulesReload : mailbox.filterRules}"/>
                           <c:if test="${empty rules}">
                               <c:set var="disabled" value="true"/>
                           </c:if>
                           <c:choose>
                               <c:when test="${(not zm:actionSet(param, 'actionFilterCancel') and requestScope.filterSave ne 'success') and (zm:actionSet(param, 'actionEditFilter') or zm:actionSet(param, 'actionNewFilter'))}">
                                    <app:button  name="actionFilterSave" src="common/ImgSave.gif" tooltip="save" text="save"/>
                                     <td><div class='vertSep'></div></td>
                                    <app:button  name="actionFilterCancel" src="common/ImgCancel.gif" tooltip="cancel" text="cancel"/>
                                       <input type="hidden"
                                              name="${zm:actionSet(param, 'actionEditFilter') ? 'actionEditFilter' : 'actionNewFilter'}" value="1"/>
                                   </td>
                               </c:when>
                               <c:otherwise>
                                   <app:button name="actionNewFilter" src="startup/ImgPlus.gif" tooltip="newFilter" text="newFilter"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionEditFilter" src="startup/ImgEdit.gif" tooltip="editFilter" text="editFilter" disabled="${disabled}"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionDeleteFilter" src="startup/ImgDelete.gif" tooltip="deleteFilter" text="deleteFilter" disabled="${disabled}"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionMoveFilterUp" src="arrows/ImgUpArrow.gif" tooltip="filterMoveUp" text="filterMoveUp"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionMoveFilterDown" src="arrows/ImgDownArrow.gif" tooltip="filterMoveDown" text="filterMoveDown"/>
                               </c:otherwise>
                           </c:choose>
                       </c:when>
                       <c:otherwise>
                           <c:if test="${selected ne 'shortcuts'}">
                                <app:button name="actionSave" src="common/ImgSave.gif" tooltip="save" text="save"/>
                           </c:if>
                       </c:otherwise>
                   </c:choose>
               </tr>
            </table>
        </td>
        <td align="right">
            &nbsp;
        </td>
    </tr>
</table>
