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

<jsp:include page="Liquid-net.jsp"/>

<!-- BEGIN SCRIPT BLOCK -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/config/data/LsConfig.js<%= ext %>?v=<%= vers %>"></script>

<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/core/LsEnv.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/core/LsImg.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/core/LsException.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsTimedAction.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/events/LsEvent.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/events/LsEventMgr.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsCallback.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/events/LsListener.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsDateUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsStringUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsVector.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsSelectionManager.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/net/LsPost.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsBuffer.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->
