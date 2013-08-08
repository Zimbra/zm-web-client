/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
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
 * @class Ext.chart.series.sprite.Area
 * @extends Ext.chart.series.sprite.StackedCartesian
 *
 * Area series sprite.
 */
Ext.define("Ext.chart.series.sprite.Area", {
    alias: 'sprite.areaSeries',
    extend: "Ext.chart.series.sprite.StackedCartesian",

    inheritableStatics: {
        def: {
            processors: {
                /**
                 * @cfg {Boolean} [step=false] 'true' if the area is represented with steps instead of lines.
                 */
                step: 'bool'
            },
            defaults: {
                step: false
            }
        }
    },

    renderClipped: function (surface, ctx, clip, clipRegion) {
        var me = this,
            attr = me.attr,
            dataX = attr.dataX,
            dataY = attr.dataY,
            dataStartY = attr.dataStartY,
            matrix = attr.matrix,
            x, y, i, lastX, lastY,
            xx = matrix.elements[0],
            dx = matrix.elements[4],
            yy = matrix.elements[3],
            dy = matrix.elements[5],
            surfaceMatrix = me.surfaceMatrix,
            markerCfg = {},
            start = Math.max(0, this.binarySearch(clip[0])),
            end = Math.min(dataX.length - 1, this.binarySearch(clip[2]) + 1);
        ctx.beginPath();

        if (attr.step) {
            lastY = dataY[start] * yy + dy;
            for (i = start; i <= end; i++) {
                x = dataX[i] * xx + dx;
                y = dataY[i] * yy + dy;
                ctx.lineTo(x, lastY);
                ctx.lineTo(x, lastY = y);
            }
        } else {
            for (i = start; i <= end; i++) {
                x = dataX[i] * xx + dx;
                y = dataY[i] * yy + dy;
                ctx.lineTo(x, y);
            }
        }

        if (dataStartY) {
            if (attr.step) {
                lastX = dataX[end] * xx + dx;
                for (i = end; i >= start; i--) {
                    x = dataX[i] * xx + dx;
                    y = dataStartY[i] * yy + dy;
                    ctx.lineTo(lastX, y);
                    ctx.lineTo(lastX = x, y);
                }
            } else {
                for (i = end; i >= start; i--) {
                    x = dataX[i] * xx + dx;
                    y = dataStartY[i] * yy + dy;
                    ctx.lineTo(x, y);
                }
            }
        } else {
            // dataStartY[i] == 0;
            ctx.lineTo(dataX[end] * xx + dx, y);
            ctx.lineTo(dataX[end] * xx + dx, dy);
            ctx.lineTo(dataX[start] * xx + dx, dy);
            ctx.lineTo(dataX[start] * xx + dx, dataY[i] * yy + dy);
        }
        if (attr.transformFillStroke) {
            attr.matrix.toContext(ctx);
        }
        ctx.fill();
        if (attr.transformFillStroke) {
            attr.inverseMatrix.toContext(ctx);
        }
        ctx.beginPath();
        if (attr.step) {
            for (i = start; i <= end; i++) {
                x = dataX[i] * xx + dx;
                y = dataY[i] * yy + dy;
                ctx.lineTo(x, lastY);
                ctx.lineTo(x, lastY = y);
                markerCfg.translationX = surfaceMatrix.x(x, y);
                markerCfg.translationY = surfaceMatrix.y(x, y);
                me.putMarker("markers", markerCfg, i, !attr.renderer);
            }
        } else {
            for (i = start; i <= end; i++) {
                x = dataX[i] * xx + dx;
                y = dataY[i] * yy + dy;
                ctx.lineTo(x, y);
                markerCfg.translationX = surfaceMatrix.x(x, y);
                markerCfg.translationY = surfaceMatrix.y(x, y);
                me.putMarker("markers", markerCfg, i, !attr.renderer);
            }
        }

        if (attr.transformFillStroke) {
            attr.matrix.toContext(ctx);
        }
        ctx.stroke();
    }
});