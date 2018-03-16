/**
 * ResizeHandler.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Arr, Option } from '@ephox/katamari';
import { ResizeWire, TableDirection, TableResize } from '@ephox/snooker';
import { Attr, Element, SelectorFilter } from '@ephox/sugar';
import Tools from 'tinymce/core/api/util/Tools';
import Direction from '../queries/Direction';
import TableWire from './TableWire';
import { hasTableResizeBars, hasObjectResizing } from '../api/Settings';

export default function (editor) {
  let selectionRng = Option.none();
  let resize = Option.none();
  let wire = Option.none();
  const percentageBasedSizeRegex = /(\d+(\.\d+)?)%/;
  let startW, startRawW;

  const isTable = function (elm) {
    return elm.nodeName === 'TABLE';
  };

  const getRawWidth = function (elm) {
    return editor.dom.getStyle(elm, 'width') || editor.dom.getAttrib(elm, 'width');
  };

  const lazyResize = function () {
    return resize;
  };

  const lazyWire = function () {
    return wire.getOr(ResizeWire.only(Element.fromDom(editor.getBody())));
  };

  const destroy = function () {
    resize.each(function (sz) {
      sz.destroy();
    });

    wire.each(function (w) {
      TableWire.remove(editor, w);
    });
  };

  editor.on('init', function () {
    const direction = TableDirection(Direction.directionAt);
    const rawWire = TableWire.get(editor);
    wire = Option.some(rawWire);
    if (hasObjectResizing(editor) && hasTableResizeBars(editor)) {
      const sz = TableResize(rawWire, direction);
      sz.on();
      sz.events.startDrag.bind(function (event) {
        selectionRng = Option.some(editor.selection.getRng());
      });
      sz.events.afterResize.bind(function (event) {
        const table = event.table();
        const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
        Arr.each(dataStyleCells, function (cell) {
          Attr.remove(cell, 'data-mce-style');
        });

        selectionRng.each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
        });

        editor.undoManager.add();
      });

      resize = Option.some(sz);
    }
  });

  // If we're updating the table width via the old mechanic, we need to update the constituent cells' widths/heights too.
  editor.on('ObjectResizeStart', function (e) {
    if (isTable(e.target)) {
      startW = e.width;
      startRawW = getRawWidth(e.target);
    }
  });

  editor.on('ObjectResized', function (e) {
    if (isTable(e.target)) {
      const table = e.target;

      if (percentageBasedSizeRegex.test(startRawW)) {
        const percentW = parseFloat(percentageBasedSizeRegex.exec(startRawW)[1]);
        const targetPercentW = e.width * percentW / startW;
        editor.dom.setStyle(table, 'width', targetPercentW + '%');
      } else {
        const newCellSizes = [];
        Tools.each(table.rows, function (row) {
          Tools.each(row.cells, function (cell) {
            const width = editor.dom.getStyle(cell, 'width', true);
            newCellSizes.push({
              cell,
              width
            });
          });
        });

        Tools.each(newCellSizes, function (newCellSize) {
          editor.dom.setStyle(newCellSize.cell, 'width', newCellSize.width);
          editor.dom.setAttrib(newCellSize.cell, 'width', null);
        });
      }
    }
  });

  return {
    lazyResize,
    lazyWire,
    destroy
  };
}