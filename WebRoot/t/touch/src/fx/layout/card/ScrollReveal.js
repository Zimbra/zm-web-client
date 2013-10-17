/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */
/**
 * @private
 */
Ext.define('Ext.fx.layout.card.ScrollReveal', {
    extend: 'Ext.fx.layout.card.Scroll',

    alias: 'fx.layout.card.scrollreveal',

    onActiveItemChange: function(cardLayout, inItem, outItem, options, controller) {
        var containerElement, containerSize, xy, animConfig,
            outTranslate, inTranslate;

        this.lastController = controller;
        this.outItem = outItem;
        this.inItem = inItem;

        if (inItem && outItem) {
            containerElement = this.getLayout().container.innerElement;

            containerSize = containerElement.getSize();
            xy = this.calculateXY(containerSize);
            animConfig = {
                easing: this.getEasing(),
                duration: this.getDuration()
            };

            outTranslate = outItem.setTranslatable(true).getTranslatable();
            inTranslate = inItem.setTranslatable(true).getTranslatable();
            outTranslate.getWrapper().dom.style.setProperty('z-index', '100', 'important');
            outTranslate.translate({ x: 0, y: 0});
            inTranslate.translate({ x: 0, y: 0});

            inItem.show();

            outTranslate.on({
                animationend: 'onOutAnimationEnd',
                scope: this
            });

            outTranslate.translateAnimated({ x: xy.x, y: xy.y}, animConfig);

            controller.pause();
        }
    },

    onOutAnimationEnd: function() {
        this.outItem.getTranslatable().getWrapper().dom.style.removeProperty('z-index'); // Remove this when we can remove translatable
//        this.outItem.setTranslatable(null);
        this.lastController.resume();
    }
});
