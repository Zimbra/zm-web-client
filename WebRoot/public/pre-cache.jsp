<%String contextPath = request.getContextPath();%>
<script type="text/javascript" language="JavaScript">
var zImgLoading = (new Date()).getTime();
</script>
<div style='position:absolute;width:1px;height:1px;visibility:hidden;overflow:hidden;'>
<jsp:include page='CacheLoRes.html'/>
</div>
<script type="text/javascript" language="JavaScript">
zImgLoading = (new Date()).getTime() - zImgLoading;
</script>