Ext.define('ZCS.common.ZtListScrollHack', {
    requires: [
        'Ext.dom.Element'
    ]
}, function () {
    /**
     * Overrides the base implementation in Element.style.js and sencha-touch-dev.js
     * Allows for any element to engage this scroll hack.
     * Currently used for lists that have iframes within them.
     * The need for this hack, is that on mobile browser, if a parent element has translate3d,
     * and a child element is an iframe, then touch events within that iframe will have the
     * wrong target's reported.  It's a browser bug.
     */
    Ext.dom.Element.addMembers({
        translate: function() {
            var transformStyleName = 'webkitTransform' in document.createElement('div').style ? 'webkitTransform' : 'transform';

            return function(x, y, z) {

                if (this.needsScrollHack) {
                    if (!this.applyScrollHack) {
                        this.applyScrollHack = Ext.Function.createBuffered(function (dom, el, y) {
                            if (!el.isScrollHacked) {
                                if (y !== undefined) {
                                    // console.log('Applying scroll hack' + y);
                                    el.isScrollHacked = true;
                                    dom.style.position = "absolute";
                                    dom.style.top = y + "px";
                                    dom.style[transformStyleName] = 'translate3d(0px, 0px, 0px)';
                                }
                            }
                        }, 250);
                    }


                    if (this.isScrollHacked) {
                        // console.log('Removing scroll hack ' + y);
                        this.dom.style.position = "relative";
                        this.dom.style.top = "0px";
                        this.isScrollHacked = false;
                    }
                }
                this.dom.style[transformStyleName] = 'translate3d(' + (x || 0) + 'px, ' + (y || 0) + 'px, ' + (z || 0) + 'px)';

                if (this.needsScrollHack) {
                    this.applyScrollHack(this.dom, this, y);
                }
            };
        }(),

        engageScrollHack: function () {
            this.needsScrollHack = true;
        }
    });
});