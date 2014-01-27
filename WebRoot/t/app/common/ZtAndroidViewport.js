Ext.define('ZCS.common.ZtAndroidViewport', {
    override: 'Ext.viewport.Anroid',

    /**
     * Fixing bug in sencha touch where a content editable div improperly loses focus on taps within itself, including
     * tapholds to copy/paste.
     *
     */
    doBlurInput: function (e) {
        var target = e.target,
            focusedElement = this.focusedElement,
            targetIsEditable = Ext.fly(target).getAttribute('contenteditable'),
            dummy;


        if (focusedElement && !this.isInputRegex.test(target.tagName) && !targetIsEditable) {
            dummy = this.getDummyInput();
            delete this.focusedElement;
            dummy.focus();

            setTimeout(function() {
                dummy.style.display = 'none';
            }, 100);
        }
    }
});