/**
 * TableActions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import {
    CellMutations, TableDirection, TableFill, TableGridSize, TableOperations
} from '@ephox/snooker';
import { Attr, Element, Node, SelectorFilter } from '@ephox/sugar';

import Util from '../alien/Util';
import Direction from '../queries/Direction';
import { getCloneElements } from '../api/Settings';
import { fireNewCell, fireNewRow } from '../api/Events';

export default function (editor, lazyWire) {
  const isTableBody = function (editor) {
    return Node.name(Util.getBody(editor)) === 'table';
  };

  const lastRowGuard = function (table) {
    const size = TableGridSize.getGridSize(table);
    return isTableBody(editor) === false || size.rows() > 1;
  };

  const lastColumnGuard = function (table) {
    const size = TableGridSize.getGridSize(table);
    return isTableBody(editor) === false || size.columns() > 1;
  };

  // Option.none gives the default cloneFormats.
  const cloneFormats = getCloneElements(editor);

  const execute = function (operation, guard, mutate, lazyWire) {
    return function (table, target) {
      const dataStyleCells = SelectorFilter.descendants(table, 'td[data-mce-style],th[data-mce-style]');
      Arr.each(dataStyleCells, function (cell) {
        Attr.remove(cell, 'data-mce-style');
      });
      const wire = lazyWire();
      const doc = Element.fromDom(editor.getDoc());
      const direction = TableDirection(Direction.directionAt);
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      return guard(table) ? operation(wire, table, target, generators, direction).bind(function (result) {
        Arr.each(result.newRows(), function (row) {
          fireNewRow(editor, row.dom());
        });
        Arr.each(result.newCells(), function (cell) {
          fireNewCell(editor, cell.dom());
        });
        return result.cursor().map(function (cell) {
          const rng = editor.dom.createRng();
          rng.setStart(cell.dom(), 0);
          rng.setEnd(cell.dom(), 0);
          return rng;
        });
      }) : Option.none();
    };
  };

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, Fun.noop, lazyWire);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, Fun.noop, lazyWire);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.always, Fun.noop, lazyWire);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.always, Fun.noop, lazyWire);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.always, CellMutations.halve, lazyWire);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.always, CellMutations.halve, lazyWire);

  const mergeCells = execute(TableOperations.mergeCells, Fun.always, Fun.noop, lazyWire);

  const unmergeCells = execute(TableOperations.unmergeCells, Fun.always, Fun.noop, lazyWire);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.always, Fun.noop, lazyWire);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.always, Fun.noop, lazyWire);

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, lazyWire);

  return {
    deleteRow,
    deleteColumn,
    insertRowsBefore,
    insertRowsAfter,
    insertColumnsBefore,
    insertColumnsAfter,
    mergeCells,
    unmergeCells,
    pasteRowsBefore,
    pasteRowsAfter,
    pasteCells
  };
}