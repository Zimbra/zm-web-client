<%String contextPath = request.getContextPath();%>
<script type="text/javascript" language="JavaScript">
var zImgLoading = (new Date()).getTime();
</script>
<div style='position:absolute;width:1px;height:1px;visibility:hidden;overflow:hidden;'>
<jsp:include page='CacheLoRes.html'/>
<!-- NOTE: skin image loading is in login.jsp so we can only load images for the correct skin -->
</div>
<script type="text/javascript" language="JavaScript">
zImgLoading = (new Date()).getTime() - zImgLoading;
</script>