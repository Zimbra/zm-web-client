<!-- 
***** BEGIN LICENSE BLOCK *****
Version: ZPL 1.1

The contents of this file are subject to the Zimbra Public License Version 1.1 ("License");
You may not use this file except in compliance with the License. You may obtain a copy of
the License at http://www.zimbra.com/license

Software distributed under the License is distributed on an "AS IS" basis, WITHOUT WARRANTY
OF ANY KIND, either express or implied. See the License for the specific language governing
rights and limitations under the License.

The Original Code is: Zimbra Collaboration Suite.

The Initial Developer of the Original Code is Zimbra, Inc.
Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
All Rights Reserved.
Contributor(s): ______________________________________.

***** END LICENSE BLOCK *****
-->

<%@ page language="java" 
         import="java.lang.*, java.util.*" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jstl/core" %>
<% 
   String vers = (String)request.getAttribute("version");
   String ext = (String)request.getAttribute("fileExtension");
   String contextPath = (String)request.getContextPath(); 
   if (vers == null){
      vers = "";
   }
   if (ext == null){
      ext = "";
   }
%>

<jsp:include page="Zimbra-net.jsp"/>

<!-- BEGIN SCRIPT BLOCK -->
<script type="text/javascript" src="<%= contextPath %>/js/ajax/config/data/AjxConfig.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="<%= contextPath %>/js/ajax/core/AjxEnv.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/core/AjxImg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/core/AjxException.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxTimedAction.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/events/AjxEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/events/AjxEventMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxCallback.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/events/AjxListener.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxDateUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxStringUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxVector.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxSelectionManager.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/net/AjxPost.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/ajax/util/AjxBuffer.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->
