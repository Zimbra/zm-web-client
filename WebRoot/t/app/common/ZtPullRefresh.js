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
 * Defines custom pull refresh logic.  The default sencha logic
 * always inserts new records at the start.  However, in our logic,
 * the new record could be at the end, so use the passed result sets
 * ordering to determine insertion position.
 *
 * @author Macy Abbey
 */
Ext.define('ZCS.common.ZtPullRefresh', {
    extend: 'Ext.plugin.PullRefresh',

    init: function () {
        this.callParent(arguments);
        this.getList().getStore().getProxy().on('exception', this.resetAfterLatestFetched, this);
    },

    /**
     * @private
     * Called after fetchLatest has finished grabbing data. Matches any returned records against what is already in the
     * Store. Remove records that are no longer present, add new records.
     */
    onLatestFetched: function(operation) {
        var store      = this.getList().getStore(),
            oldRecords = store.getData(),
            newRecords = operation.getRecords ? operation.getRecords() : [],
            length     = newRecords.length,
            recordToInsert,
            toInsert   = [],
            newRecordCollection = new Ext.util.MixedCollection(),
            newRecord, oldRecord, i;

        for (i = 0; i < length; i++) {
            newRecord = newRecords[i];
            oldRecord = oldRecords.getByKey(newRecord.getId());

            if (oldRecord) {
                oldRecord.set(newRecord.getData());
            } else {
                newRecord.properIndex = i;
                toInsert.push(newRecord);
            }

            oldRecord = undefined;
        }

        for (i = 0; i < newRecords.length; i += 1) {
            newRecordCollection.add(newRecords[i].getId(), newRecord);
        }

        //Remove non-matching old records.
        for (i = 0; i < oldRecords.length; i += 1) {
            oldRecord = oldRecords.getAt(i);
            newRecord = newRecordCollection.getByKey(oldRecord.getId());

            if (!newRecord) {
                store.remove(oldRecord);
            }
        }

        for (i = 0; i < toInsert.length; i += 1) {
            recordToInsert = toInsert[i];
            store.insert(recordToInsert.properIndex, recordToInsert);
        }

        this.resetAfterLatestFetched();
    },

    resetAfterLatestFetched: function () {
        var list       = this.getList(),
            scroller   = list.getScrollable().getScroller(),
            scrollerOffsetX = scroller.position.x,
            scrollerOffsetY = scroller.position.y;

        scroller.scrollTo(scrollerOffsetX, scrollerOffsetY);

        this.setState('loaded');
        this.fireEvent('latestfetched');
        if (this.getAutoSnapBack()) {
            this.snapBack();
        }
    }
});
