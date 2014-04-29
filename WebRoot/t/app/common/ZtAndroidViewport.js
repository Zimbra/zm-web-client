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
    },

    doPreventZooming: function (e) {
        // Don't prevent right mouse event
        if ('button' in e && e.button !== 0) {
            return;
        }

        var target = e.target,
            targetIsEditable = Ext.fly(target).getAttribute('contenteditable');

        if (target && target.nodeType === 1 && !this.isInputRegex.test(target.tagName) && !this.focusedElement && !targetIsEditable) {
            e.preventDefault();
        }
    }
});