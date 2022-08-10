/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option, Cell } from '@ephox/katamari';
import { CopyRows, TableFill, TableLookup } from '@ephox/snooker';
import { Element, Insert, Remove, Replication } from '@ephox/sugar';
import Tools from 'tinymce/core/api/util/Tools';
import * as Util from '../alien/Util';
import TableTargets from '../queries/TableTargets';
import CellDialog from '../ui/CellDialog';
import RowDialog from '../ui/RowDialog';
import TableDialog from '../ui/TableDialog';
import { Editor } from 'tinymce/core/api/Editor';
import { TableActions } from 'tinymce/plugins/table/actions/TableActions';
import { Selections } from 'tinymce/plugins/table/selection/Selections';
import * as Events from '../api/Events';

const each = Tools.each;

const registerCommands = function (editor: Editor, actions: TableActions, cellSelection, selections: Selections, clipboardRows: Cell<Option<Element[]>>) {
  const isRoot = Util.getIsRoot(editor);
  const eraseTable = function () {
    getSelectionStartCell()
      .orThunk(getSelectionStartCaption)
      .each((cellOrCaption) => {
        const table = TableLookup.table(cellOrCaption, isRoot);
        table.filter(Fun.not(isRoot)).each(function (table) {
          const cursor = Element.fromText('');
          Insert.after(table, cursor);
          Remove.remove(table);
          const rng = editor.dom.createRng();
          rng.setStart(cursor.dom(), 0);
          rng.setEnd(cursor.dom(), 0);
          editor.selection.setRng(rng);
        });
      });
  };

  const getSelectionStartFromSelector = (selector: string) => () => Option.from(editor.dom.getParent(editor.selection.getStart(), selector)).map(Element.fromDom);

  const getSelectionStartCaption = getSelectionStartFromSelector('caption');

  const getSelectionStartCell = getSelectionStartFromSelector('th,td');

  const getTableFromCell = function (cell: Element) {
    return TableLookup.table(cell, isRoot);
  };

  const getSize = (table) => {
    return {
      width: Util.getPixelWidth(table.dom()),
      height: Util.getPixelWidth(table.dom())
    };
  };

  const resizeChange = (editor: Editor, oldSize, table) => {
    const newSize = getSize(table);

    if (oldSize.width !== newSize.width || oldSize.height !== newSize.height) {
      Events.fireObjectResizeStart(editor, table.dom(), oldSize.width, oldSize.height);
      Events.fireObjectResized(editor, table.dom(), newSize.width, newSize.height);
    }
  };

  const actOnSelection = function (execute) {
    getSelectionStartCell().each((cell) => {
      getTableFromCell(cell)
        .each(function (table) {
          const targets = TableTargets.forMenu(selections, table, cell);
          const beforeSize = getSize(table);
          execute(table, targets).each(function (rng) {
            resizeChange(editor, beforeSize, table);
            editor.selection.setRng(rng);
            editor.focus();
            cellSelection.clear(table);
            Util.removeDataStyle(table);
          });
        });
      });
  };

  const copyRowSelection = function (execute?) {
    return getSelectionStartCell().bind((cell) => {
      return getTableFromCell(cell).bind(function (table) {
        const doc = Element.fromDom(editor.getDoc());
        const targets = TableTargets.forMenu(selections, table, cell);
        const generators = TableFill.cellOperations(Fun.noop, doc, Option.none());
        return CopyRows.copyRows(table, targets, generators);
      });
    });
  };

  const pasteOnSelection = function (execute) {
    // If we have clipboard rows to paste
    clipboardRows.get().each(function (rows) {
      const clonedRows = Arr.map(rows, function (row) {
        return Replication.deep(row);
      });
      getSelectionStartCell().each((cell) => {
        getTableFromCell(cell).each(function (table) {
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