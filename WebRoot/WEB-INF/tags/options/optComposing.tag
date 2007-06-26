<%@ tag body-content="empty" %>
<%@ attribute name="mailbox" rtexprvalue="true" required="true" type="com.zimbra.cs.taglib.bean.ZMailboxBean" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="zm" uri="com.zimbra.zm" %>
<%@ taglib prefix="app" uri="com.zimbra.htmlclient" %>


 <table border="0" cellpadding="0" cellspacing="10" width=100%>
     <tr>
        <td colspan="2" class='ZOptionsHeader' >
            <fmt:message key="optionsComposingMessages"/>
        </td>
     </tr>
     <tr>
         <td class='ZOptionsTableLabel'>
             <fmt:message key="optionsReplyReplyAll"/> :
         </td>
         <td>
             <label for="whenReply"><fmt:message key="optionsWhenReplying"/>:</label>
         </td>
     </tr>
     <tr>
         <td class='ZOptionsTableLabel'>
             &nbsp;
         </td>
         <td>
         <select name="zimbraPrefReplyIncludeOriginalText" id="whenReply">
            <option
                    <c:if test="${mailbox.prefs.replyIncludeNone}"> selected</c:if> value="includeNone">
                <fmt:message key="includeMenuNone"/>
            </option>
            <option
                    <c:if test="${mailbox.prefs.replyIncludeBody}"> selected</c:if> value="includeBody">
                <fmt:message key="includeInBody"/>
            </option>
            <option
                    <c:if test="${mailbox.prefs.replyIncludeBodyWithPrefx}"> selected</c:if> value="includeBodyWithPrefix">
                <fmt:message key="includePrefix"/>
            </option>
            <option
                    <c:if test="${mailbox.prefs.replyIncludeAsAttachment}"> selected</c:if> value="includeAsAttachment">
                <fmt:message key="includeOriginalAsAttach"/>
            </option>
        </select>            
         </td>
     </tr>
     <app:optSeparator/>     
     <tr>
         <td class='ZOptionsTableLabel'>
             <fmt:message key="optionsForward"/> :
         </td>
         <td>
             <label for="whenForward"><fmt:message key="optionsWhenForwarding"/>:</label>
         </td>
     </tr>
     <tr>
         <td class='ZOptionsTableLabel'>
             &nbsp;
         </td>
         <td>
             <select name="zimbraPrefForwardIncludeOriginalText" id="whenForward">
                 <option
                         <c:if test="${mailbox.prefs.forwardIncludeBody}"> selected</c:if> value="includeBody">
                     <fmt:message key="includeInBody"/>
                 </option>
                 <option
                         <c:if test="${mailbox.prefs.forwardIncludeBodyWithPrefx}"> selected</c:if> value="includeBodyWithPrefix">
                     <fmt:message key="includePrefix"/>
                 </option>
                 <option
                         <c:if test="${mailbox.prefs.forwardIncludeAsAttachment}"> selected</c:if> value="includeAsAttachment">
                     <fmt:message key="includeOriginalAsAttach"/>
                 </option>
             </select>
         </td>
     </tr>
     <app:optSeparator/>
     <tr>
         <td class='ZOptionsTableLabel'>
             <fmt:message key="optionsPrefixChar"/> :
         </td>
         <td>
             <label for="prefixText"><fmt:message key="prefixTextWith"/>:</label>
         </td>
     </tr>
     <tr>
         <td class='ZOptionsTableLabel'>
             &nbsp;
         </td>
         <td>
         <select name="zimbraPrefForwardReplyPrefixChar" id="prefixText">
             <option
                    <c:if test="${mailbox.prefs.forwardReplyPrefixChar eq '>'}"> selected</c:if> value="&gt;">
                &gt;
            </option>
            <option
                    <c:if test="${mailbox.prefs.forwardReplyPrefixChar eq '|'}"> selected</c:if> value="|">
                |
            </option>
        </select>
         </td>
     </tr>
     <app:optSeparator/>
    <tr>
         <td class='ZOptionsTableLabel'>
             <fmt:message key="optionsSentMessages"/> :
         </td>
         <td>
             <app:optCheckbox boxfirst="true" label="saveToSent" pref="zimbraPrefSaveToSent" checked="${mailbox.prefs.saveToSent}"/>
         </td>
     </tr>
      <tr>
        <td colspan="2">
            &nbsp;
        </td>
     </tr>
</table>
