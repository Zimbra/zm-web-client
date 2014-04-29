Ext.define('ZCS.common.ZtViewport', {
    override: 'Ext.viewport.Default',
    /**
     * Fixing bug in sencha touch where a content editable div improperly loses focus on taps within itself, including
     * tapholds to copy/paste.
     *
     */
    doBlurInput: function (e) {
        var target = e.target,
            focusedElement = this.focusedElement,
            targetIsEditable = Ext.fly(e.target).getAttribute('contenteditable');

        //In IE9/10 browser window loses focus and becomes inactive if focused element is <body>. So we shouldn't call blur for <body>
        if (focusedElement && focusedElement.nodeName.toUpperCase() != 'BODY' && !this.isInputRegex.test(target.tagName) && !targetIsEditable) {
            delete this.focusedElement;
            focusedElement.blur();
        }
    },

    doPreventZooming: function(e) {
        // Don't prevent right mouse event
        if ('button' in e && e.button !== 0) {
            return;
        }

        var target = e.target,
            targetIsEditable = Ext.fly(e.target).getAttribute('contenteditable');

        if (target && target.nodeType === 1 && !this.isInputRegex.test(target.tagName) && !targetIsEditable) {
            e.preventDefault();
        }
    }
});