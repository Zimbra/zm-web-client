/**
 * TableCommands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import { CopyRows, TableFill, TableLookup } from '@ephox/snooker';
import { Element, Insert, Remove, Replication } from '@ephox/sugar';
import Tools from 'tinymce/core/api/util/Tools';
import Util from '../alien/Util';
import TableTargets from '../queries/TableTargets';
import CellDialog from '../ui/CellDialog';
import RowDialog from '../ui/RowDialog';
import TableDialog from '../ui/TableDialog';

const each = Tools.each;

const registerCommands = function (editor, actions, cellSelection, selections, clipboardRows) {
  const isRoot = Util.getIsRoot(editor);
  const eraseTable = function () {
    const cell = Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
    const table = TableLookup.table(cell, isRoot);
    table.filter(Fun.not(isRoot)).each(function (table) {
      const cursor = Element.fromText('');
      Insert.after(table, cursor);
      Remove.remove(table);
      const rng = editor.dom.createRng();
      rng.setStart(cursor.dom(), 0);
      rng.setEnd(cursor.dom(), 0);
      editor.selection.setRng(rng);
    });
  };

  const getSelectionStartCell = function () {
    return Element.fromDom(editor.dom.getParent(editor.selection.getStart(), 'th,td'));
  };

  const getTableFromCell = function (cell) {
    return TableLookup.table(cell, isRoot);
  };

  const actOnSelection = function (execute) {
    const cell = getSelectionStartCell();
    const table = getTableFromCell(cell);
    table.each(function (table) {
      const targets = TableTargets.forMenu(selections, table, cell);
      execute(table, targets).each(function (rng) {
        editor.selection.setRng(rng);
        editor.focus();
        cellSelection.clear(table);
      });
    });
  };

  const copyRowSelection = function (execute?) {
    const cell = getSelectionStartCell();
    const table = getTableFromCell(cell);
    return table.bind(function (table) {
      const doc = Element.fromDom(editor.getDoc());
      const targets = TableTargets.forMenu(selections, table, cell);
      const generators = TableFill.cellOperations(Fun.noop, doc, Option.none());
      return CopyRows.copyRows(table, targets, generators);
    });
  };

  const pasteOnSelection = function (execute) {
    // If we have clipboard rows to paste
    clipboardRows.get().each(function (rows) {
      const clonedRows = Arr.map(rows, function (row) {
        return Replication.deep(row);
      });
      const cell = getSelectionStartCell();
      const table = getTableFromCell(cell);
      table.bind(function (table) {
        const doc = Element.fromDom(editor.getDoc());
        const generators = TableFill.paste(doc);
        const targets = TableTargets.pasteRows(selections, table, cell, clonedRows, generators);
        execute(table, targets).each(function (rng) {
          editor.selection.setRng(rng);
          editor.focus();
          cellSelection.clear(table);
        });
      });
    });
  };

  // Register action commands
  each({
    mceTableSplitCells () {
      actOnSelection(actions.unmergeCells);
    },

    mceTableMergeCells () {
      actOnSelection(actions.mergeCells);
    },

    mceTableInsertRowBefore () {
      actOnSelection(actions.insertRowsBefore);
    },

    mceTableInsertRowAfter () {
      actOnSelection(actions.insertRowsAfter);
    },

    mceTableInsertColBefore () {
      actOnSelection(actions.insertColumnsBefore);
    },

    mceTableInsertColAfter () {
      actOnSelection(actions.insertColumnsAfter);
    },

    mceTableDeleteCol () {
      actOnSelection(actions.deleteColumn);
    },

    mceTableDeleteRow () {
      actOnSelection(actions.deleteRow);
    },

    mceTableCutRow (grid) {
      clipboardRows.set(copyRowSelection());
      actOnSelection(actions.deleteRow);
    },

    mceTableCopyRow (grid) {
      clipboardRows.set(copyRowSelection());
    },

    mceTablePasteRowBefore (grid) {
      pasteOnSelection(actions.pasteRowsBefore);
    },

    mceTablePasteRowAfter (grid) {
      pasteOnSelection(actions.pasteRowsAfter);
    },

    mceTableDelete: eraseTable
  }, function (func, name) {
    editor.addCommand(name, func);
  });

  // Register dialog commands
  each({
    mceInsertTable: Fun.curry(TableDialog.open, editor),
    mceTableProps: Fun.curry(TableDialog.open, editor, true),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
  }, function (func, name) {
    editor.addCommand(name, function (ui, val) {
      func(val);
    });
  });
};

export default {
  registerCommands
};