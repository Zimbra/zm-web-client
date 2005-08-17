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


<!-- BEGIN SCRIPT BLOCK -->
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/core/LsCore.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/core/LsEnv.js<%=ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/core/LsException.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsCookie.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/soap/LsSoapException.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/soap/LsSoapFault.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/soap/LsSoapDoc.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/net/LsRpcRequest.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/net/LsRpc.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsWindowOpener.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsVector.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/util/LsStringUtil.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/debug/LsDebug.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/debug/LsDebugXmlDocument.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbraAjax/xml/LsXmlDoc.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbra/csfe/ZmCsfeCommand.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbra/csfe/ZmCsfeAsynchCommand.js<%= ext %>?v=<%= vers %>"></script>
<script type="text/javascript" src="<%= contextPath %>/js/zimbra/csfe/ZmCsfeException.js<%= ext %>?v=<%= vers %>"></script>
<!-- END SCRIPT BLOCK -->