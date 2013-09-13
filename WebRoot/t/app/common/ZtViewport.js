Ext.define('ZCS.common.ZtViewport', {
    override: 'Ext.viewport.Default',
    /**
     * Fixing bug in sencha touch where a content editable div improperly loses focus on taps within itself, including
     * tapholds to copy/paste.
     *
     */
    doBlurInput: function (e) {
        var target = e.target,
            focusedElement = this.focusedElement;

        //In IE9/10 browser window loses focus and becomes inactive if focused element is <body>. So we shouldn't call blur for <body>
        if (focusedElement && focusedElement.nodeName.toUpperCase() != 'BODY' && !this.isInputRegex.test(target.tagName) && !target.attributes['contenteditable']) {
            delete this.focusedElement;
            focusedElement.blur();
        }
    }
});