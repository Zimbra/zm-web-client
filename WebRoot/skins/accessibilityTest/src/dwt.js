(function(){
	/* detect Zimbra's (ab-)use of Z-index to hide elements */
	skin.override.append('Dwt.setZIndex', function(htmlel, idx) {
		if (htmlel) {
			if (idx < Dwt.Z_VIEW) {
				htmlel.setAttribute('aria-hidden', true);
			} else if (htmlel.getAttribute('aria-hidden') !== null) {
				htmlel.removeAttribute('aria-hidden');
			}
		}
	});
})();
