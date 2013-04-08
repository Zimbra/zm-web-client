/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 VMware, Inc.
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.3 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */
/**
 * @private
 */
Ext.define('Ext.fx.animation.Cube', {
    extend: 'Ext.fx.animation.Abstract',

    alias: 'animation.cube',

    config: {
        /**
         * @cfg
         * @inheritdoc
         */
        before: {
//            'transform-style': 'preserve-3d'
        },

        after: {},

        /**
         * @cfg {String} direction The direction of which the slide animates
         * @accessor
         */
        direction: 'right',

        out: false
    },

//    getData: function() {
//        var to = this.getTo(),
//            from = this.getFrom(),
//            out  = this.getOut(),
//            direction  = this.getDirection(),
//            el = this.getElement(),
//            elW = el.getWidth(),
//            elH = el.getHeight(),
//            halfWidth = (elW / 2),
//            halfHeight = (elH / 2),
//            fromTransform = {},
//            toTransform = {},
//            originalFromTransform = {
//                rotateY: 0,
//                translateX: 0,
//                translateZ: 0
//            },
//            originalToTransform = {
//                rotateY: 90,
//                translateX: halfWidth,
//                translateZ: halfWidth
//            },
//            originalVerticalFromTransform = {
//                rotateX: 0,
//                translateY: 0,
//                translateZ: 0
//            },
//            originalVerticalToTransform = {
//                rotateX: 90,
//                translateY: halfHeight,
//                translateZ: halfHeight
//            },
//            tempTransform;
//
//        if (direction == "left" || direction == "right") {
//            if (out) {
//                toTransform = originalToTransform;
//                fromTransform = originalFromTransform;
//            } else {
//                toTransform = originalFromTransform;
//                fromTransform = originalToTransform;
//                fromTransform.rotateY *= -1;
//                fromTransform.translateX *= -1;
//            }
//
//            if (direction === 'right') {
//                tempTransform = fromTransform;
//                fromTransform = toTransform;
//                toTransform = tempTransform;
//            }
//        }
//
//        if (direction == "up" || direction == "down") {
//            if (out) {
//                toTransform = originalVerticalFromTransform;
//                fromTransform = {
//                    rotateX: -90,
//                    translateY: halfHeight,
//                    translateZ: halfHeight
//                };
//            } else {
//                fromTransform = originalVerticalFromTransform;
//                toTransform = {
//                    rotateX: 90,
//                    translateY: -halfHeight,
//                    translateZ: halfHeight
//                };
//            }
//
//            if (direction == "up") {
//                tempTransform = fromTransform;
//                fromTransform = toTransform;
//                toTransform = tempTransform;
//            }
//        }
//
//        from.set('transform', fromTransform);
//        to.set('transform', toTransform);
//
//        return this.callParent(arguments);
//    },

    getData: function() {
        var to = this.getTo(),
            from = this.getFrom(),
            before = this.getBefore(),
            after = this.getAfter(),
            out  = this.getOut(),
            direction  = this.getDirection(),
            el = this.getElement(),
            elW = el.getWidth(),
            elH = el.getHeight(),
            origin = out ? '100% 100%' : '0% 0%',
            fromOpacity = 1,
            toOpacity = 1,
            transformFrom = {
                rotateY: 0,
                translateZ: 0
            },
            transformTo = {
                rotateY: 0,
                translateZ: 0
            };

        if (direction == "left" || direction == "right") {
            if (out) {
                toOpacity = 0.5;
                transformTo.translateZ = elW;
                transformTo.rotateY = -90;
            } else {
                fromOpacity = 0.5;
                transformFrom.translateZ = elW;
                transformFrom.rotateY = 90;
            }
        }

        before['transform-origin'] = origin;
        after['transform-origin'] = null;

        to.set('transform', transformTo);
        from.set('transform', transformFrom);

        from.set('opacity', fromOpacity);
        to.set('opacity', toOpacity);

        return this.callParent(arguments);
    }
});
