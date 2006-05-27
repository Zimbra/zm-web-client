<%String contextPath = request.getContextPath();%>
<script type="text/javascript" language="JavaScript">
var zImgLoading = (new Date()).getTime();
</script>
<div style='position:absolute;width:1px;height:1px;visibility:hidden;overflow:hidden;'>
<jsp:include page='CacheLoRes.html'/>
<!-- NOTE: moved skin image loading to login.jsp so we can only load images for the correct skin -->
<img alt="" src="<%= contextPath %>/img/animated/wait_16.gif">
<img alt="" src="<%= contextPath %>/img/animated/wait_32.gif">
<img alt="" src="<%= contextPath %>/img/animated/wait_64.gif">
<img alt="" src="<%= contextPath %>/img/animated/BarberPole_216.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/Critical_32.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/ButtonSmallUp__H.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/ButtonSmallDown__H.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/ButtonUpDefault__H.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/ButtonDownDefault__H.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/ButtonDown__H.gif">
<img alt="" src="<%= contextPath %>/img/loRes/dwt/ButtonUp__H.gif">
<img alt="" src="<%= contextPath %>/skins/steel/images/tree_header_bg.gif">
</div>
<script type="text/javascript" language="JavaScript">
zImgLoading = (new Date()).getTime() - zImgLoading;
</script>