<div style='position:absolute;width:1px;height:1px;visibility:hidden;overflow:hidden;'>
	<%
	String contextPath = request.getContextPath();
	String hiRes = request.getParameter("hiRes");
	if (hiRes != null) { %>
	<jsp:include page='CacheHiRes.html'/>
	<jsp:include page='../skins/steel/CacheHiRes.html'/>
	<% } else { %>
	<jsp:include page='CacheLoRes.html'/>
	<jsp:include page='../skins/steel/CacheLoRes.html'/>
	<% } %>
	<img alt="" src="<%= contextPath %>/img/animated/wait_16.gif">
	<img alt="" src="<%= contextPath %>/img/animated/wait_32.gif">
	<img alt="" src="<%= contextPath %>/img/animated/wait_64.gif">
	<img alt="" src="<%= contextPath %>/img/animated/BarberPole_216.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/Critical_32.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/ButtonSmallUp__H.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/ButtonSmallDown__H.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/ButtonUpDefault__H.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/ButtonDownDefault__H.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/ButtonDown__H.gif">
	<img alt="" src="<%= contextPath %>/img/hiRes/dwt/ButtonUp__H.gif">
	<img alt="" src="<%= contextPath %>/skins/steel/images/tree_header_bg.gif">
	<img alt="" src="/favicon.ico">
</div>