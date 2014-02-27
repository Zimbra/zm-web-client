/* The _handleEditorKeyEvent by default stops propagation of TAB,
 * and inserts four spaces, when the TinyMCE editor is open.
 * This is a modified copy of that function, changed to remove capturing TAB.
 * This makes TAB-navigation work
*/
skin.override('ZmHtmlEditor.prototype._handleEditorKeyEvent', function(ev) {
	var ed = this.getEditor();
	var retVal = true;

	if (DwtKeyboardMgr.isPossibleInputShortcut(ev)) {
		// pass to keyboard mgr for kb nav
		retVal = DwtKeyboardMgr.__keyDownHdlr(ev);
	}
	else if (ev.keyCode === DwtKeyEvent.KEY_TAB) { //Tab key handling
		retVal = DwtKeyboardMgr.__keyDownHdlr(ev);
	}	

	if (window.DwtIdleTimer) {
		DwtIdleTimer.resetIdle();
	}	

	return retVal;
});

skin.override(['ZmHtmlEditor._spellCheckAgain', 'ZmLiteHtmlEditor._spellCheckAgain'], function() {
	var editor = Dwt.getObjectFromElement(this);
	editor._spellCheckHideModeDiv();
	return arguments.callee.func.apply(this, arguments);
});
