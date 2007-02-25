<%@ tag body-content="empty" %>
<%@ attribute name="selected" rtexprvalue="true" required="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>

<table cellspacing=0 class='Tb' width=100%>
    <tr>
        <td>
            <table cellspacing=2 cellpadding=0 class='Tb'>
               <tr>
                   <c:choose>
                       <c:when test="${selected eq 'filter'}">
                           <c:choose>
                               <c:when test="${(empty param.actionFilterCancel and requestScope.filterSave ne 'success') and (not empty param.actionEditFilter or not empty param.actionNewFilter)}">
                                    <app:button  name="actionFilterSave" src="common/Save.gif" tooltip="save" text="save"/>
                                     <td><div class='vertSep'></div></td>
                                    <app:button  name="actionFilterCancel" src="common/Cancel.gif" tooltip="cancel" text="cancel"/>
                                       <input type="hidden"
                                              name="${not empty param.actionEditFilter ? 'actionEditFilter' : 'actionNewFilter'}" value="1"/>
                                   </td>
                               </c:when>
                               <c:otherwise>
                                   <app:button name="actionNewFilter" src="common/Plus.gif" tooltip="newFilter" text="newFilter"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionEditFilter" src="common/Edit.gif" tooltip="editFilter" text="editFilter"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionDeleteFilter" src="common/Delete.gif" tooltip="deleteFilter" text="deleteFilter"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionMoveFilterUp" src="arrows/UpArrow.gif" tooltip="filterMoveUp" text="filterMoveUp"/>
                                   <td><div class='vertSep'></div></td>
                                   <app:button name="actionMoveFilterDown" src="arrows/DownArrow.gif" tooltip="filterMoveDown" text="filterMoveDown"/>
                               </c:otherwise>
                           </c:choose>
                       </c:when>
                       <c:otherwise>
                           <app:button
                                   disabled="${selected eq 'shortcuts'}" name="actionSave" src="common/Save.gif" tooltip="save" text="save"/>
                       </c:otherwise>
                   </c:choose>
               </tr>
            </table>
        </td>
        <td align=right>
            &nbsp;
        </td>
    </tr>
</table>
