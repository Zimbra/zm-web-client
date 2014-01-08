
function ZmOfflineDB() {

}

ZmOfflineDB.init =
function (callback) {
	ZmOfflineDB.OBJECTSTORE_NAMES = [ZmApp.MAIL, ZmApp.CONTACTS, ZmApp.CALENDAR, ZmOffline.ATTACHMENT, ZmOffline.REQUESTQUEUE, ZmOffline.META_DATA];
	ZmOfflineDB.open(callback);
};

ZmOfflineDB.open =
function(callback, errorCallback, version) {
	try {
		DBG.println(AjxDebug.DBG1, "ZmOfflineDB.open");
		var loggedInUsername = appCtxt.getLoggedInUsername();
		var request = (version) ? indexedDB.open(loggedInUsername, version) : indexedDB.open(loggedInUsername);
		request.onsuccess = function() {
			DBG.println(AjxDebug.DBG1, "ZmOfflineDB.open success");
			var db = request.result;
			var objectStoreNamesToBeCreated = ZmOfflineDB.OBJECTSTORE_NAMES.filter(function(objectStoreName) {
				return db.objectStoreNames.contains(objectStoreName);
			});
			if (objectStoreNamesToBeCreated.length > 0) {
				ZmOfflineDB.db = db;
				callback && callback();
			}
			else {
				db.close();
				ZmOfflineDB.open(callback, errorCallback, db.version + 1);
			}
		};
		request.onupgradeneeded = function() {
			DBG.println(AjxDebug.DBG1, "ZmOfflineDB.open onupgradeneeded");
			var db = request.result;
			ZmOfflineDB.OBJECTSTORE_NAMES.forEach(function(objectStoreName) {
				if (!db.objectStoreNames.contains(objectStoreName)) {
					if (objectStoreName === ZmApp.MAIL) {
						var store = db.createObjectStore(objectStoreName, {keyPath: "id"});
						store.createIndex("size", "s");
						store.createIndex("folder", "l");
						store.createIndex("receiveddate", "d");
						store.createIndex("flags", "f", {multiEntry : true});
						store.createIndex("tag", "tn", {multiEntry : true});
						store.createIndex("subject", "su", {multiEntry : true});
						store.createIndex("fragment", "fr", {multiEntry : true});
						//Email index
						store.createIndex("from", "e.from");
						store.createIndex("to", "e.to", {multiEntry : true});
						store.createIndex("cc", "e.cc", {multiEntry : true});
					}
					else if (objectStoreName === ZmApp.CONTACTS) {
						var store = db.createObjectStore(objectStoreName, {keyPath: "id"});
						store.createIndex("folder", "l");
						store.createIndex("tag", "tn", {multiEntry : true});
						//Display String
						store.createIndex("fileasstr", "fileAsStr");
						//Email index
						store.createIndex("firstname", "_attrs.firstName");
						store.createIndex("lastname", "_attrs.lastName");
						store.createIndex("middlename", "_attrs.middleName");
						store.createIndex("email", "_attrs.email");
						store.createIndex("company", "_attrs.company");
						store.createIndex("jobtitle", "_attrs.jobTitle", {multiEntry : true});
					}
					else if (objectStoreName === ZmOffline.ATTACHMENT) {
						var store = db.createObjectStore(objectStoreName, {keyPath: "id"});
						//Attachment Type Index
						store.createIndex("type", "type");
						store.createIndex("name", "name");
						store.createIndex("size", "size");
						store.createIndex("mid", "mid");
					}
					else if (objectStoreName === ZmOffline.REQUESTQUEUE) {
						var store = db.createObjectStore(objectStoreName, {keyPath : "oid", autoIncrement : true});
						//Request queue index
						store.createIndex("methodName", "methodName");
						store.createIndex("id", "id");
						store.createIndex("methodName, id", ["methodName", "id"]);
					} else if (objectStoreName === ZmApp.CALENDAR) {
						// Store ZmAppts, otherwise no start and end date fields.  The rawAppts potentially represent
						// several appts (base appt info + instance), with differing startDates.  The instanceId is a
						// generated key field, storing id:startTime (time in msec)
						var store = db.createObjectStore(objectStoreName, {keyPath: "instanceId"});
						// id is non-unique, but if a appt has been exploded into multiple ZmAppt entries, it allows
						// us to access them for Update/Delete
						store.createIndex("id", "id");
						store.createIndex("invId", "invId");
						store.createIndex("startDate", "startDate");
						store.createIndex("endDate", "endDate");
					} else if (objectStoreName === ZmOffline.META_DATA) {
						var store = db.createObjectStore(objectStoreName, {keyPath: "methodname"});
					}
					else {
						var store = db.createObjectStore(objectStoreName, {keyPath: "key"});
					}
				}
			});
		};
		request.onabort = request.onblocked = request.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.open :: " + e);
	}
};

ZmOfflineDB.close =
function() {
	var db = ZmOfflineDB.db;
	if (db) {
		db.close();
	}
};

ZmOfflineDB.deleteDB =
function(callback, errorCallback) {
	try {
		var request = indexedDB.deleteDatabase(appCtxt.getLoggedInUsername());
		request.onsuccess = callback;
		request.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.deleteDB :: " + e);
	}
};

ZmOfflineDB.setItemInRequestQueue =
function(value, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.db,
            transaction = db.transaction("RequestQueue", "readwrite"),
            objectStore = transaction.objectStore("RequestQueue");

        if (AjxUtil.isObject(value) && value.update) {
            var indexAndKeyRange = ZmOfflineDB._createIndexAndKeyRange(value, objectStore),
                index = indexAndKeyRange.index,
                keyRangeArray = indexAndKeyRange.keyRangeArray;

            if (index && keyRangeArray) {
                keyRangeArray.forEach(function(keyRange) {
                    index.openCursor(keyRange).onsuccess = function(ev) {
                        var result = ev.target.result;
                        if (result) {
                            if (value.value) {
                                value.value.oid = result.primaryKey;
                                result.update(value.value);
                            }
                        }
                        else {
                            objectStore.add(value.value);
                        }
                    };
                });
            }
        }
        else if (value) {
            [].concat(value).forEach(function(val) {
                objectStore.add(val);
            });
        }
        transaction.oncomplete = callback;
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
	    DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.setItemInRequestQueue :: " + e);
    }
};

ZmOfflineDB.getItemInRequestQueue =
function(key, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.db,
            transaction = db.transaction("RequestQueue"),
            objectStore = transaction.objectStore("RequestQueue"),
            indexAndKeyRange = ZmOfflineDB._createIndexAndKeyRange(key, objectStore),
            index = indexAndKeyRange.index,
            keyRangeArray = indexAndKeyRange.keyRangeArray,
            resultArray = [];

        if (index && keyRangeArray) {
            keyRangeArray.forEach(function(keyRange) {
                index.openCursor(keyRange).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        resultArray.push(result.value);
                        result['continue']();
                    }
                };
            });
        }
        else if (key) {
            [].concat(key).forEach(function(key) {
                objectStore.get(key).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        resultArray.push(result);
                    }
                };
            });
        }
        else {
            objectStore.openCursor().onsuccess = function(ev) {
                var result = ev.target.result;
                if (result) {
                    resultArray.push(result.value);
                    result['continue']();
                }
            };
        }

        if (callback) {
            transaction.oncomplete = function() {
                callback(resultArray);
            };
        }
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
	    DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.getItemInRequestQueue :: " + e);
    }
};

ZmOfflineDB.getItemCountInRequestQueue =
function(key, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.db,
            transaction = db.transaction("RequestQueue"),
            objectStore = transaction.objectStore("RequestQueue"),
            indexAndKeyRange = ZmOfflineDB._createIndexAndKeyRange(key, objectStore),
            index = indexAndKeyRange.index,
            keyRangeArray = indexAndKeyRange.keyRangeArray,
            count = 0;

        if (index && keyRangeArray) {
            keyRangeArray.forEach(function(keyRange) {
                index.count(keyRange).onsuccess = function(ev) {
                    count += ev.target.result || 0;
                };
            });
        }
        else {
            objectStore.count().onsuccess = function(ev) {
                count = ev.target.result || 0;
            };
        }

        if (callback) {
            transaction.oncomplete = function() {
                callback(count);
            }
        }
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
	    DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.getItemCountInRequestQueue :: " + e);
    }
};

ZmOfflineDB.deleteItemInRequestQueue =
function(key, callback, errorCallback) {
    try {
        var db = ZmOfflineDB.db,
            transaction = db.transaction("RequestQueue", "readwrite"),
            objectStore = transaction.objectStore("RequestQueue"),
            indexAndKeyRange = ZmOfflineDB._createIndexAndKeyRange(key, objectStore),
            index = indexAndKeyRange.index,
            keyRangeArray = indexAndKeyRange.keyRangeArray;

        if (index && keyRangeArray) {
            keyRangeArray.forEach(function(keyRange) {
                index.openCursor(keyRange).onsuccess = function(ev) {
                    var result = ev.target.result;
                    if (result) {
                        result['delete']();
                        result['continue']();
                    }
                };
            });
        }
        else if (key) {
            [].concat(key).forEach(function(key) {
                objectStore['delete'](key);
            });
        }

        transaction.oncomplete = callback;
        transaction.onerror = errorCallback;
    }
    catch (e) {
        errorCallback && errorCallback();
	    DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.deleteItemInRequestQueue :: " + e);
    }
};

ZmOfflineDB._createIndexAndKeyRange =
function(key, objectStore) {

    var index,
        keyRangeArray = [];

    try {
        if (key.id && key.methodName) {
            index = objectStore.index("methodName, id");
            [].concat(key.methodName).forEach(function(methodName) {
                [].concat(key.id).forEach(function(id) {
                    keyRangeArray.push(IDBKeyRange.only([methodName, id]));
                });
            });
        }
        else if (key.id) {
            index = objectStore.index("id");
            [].concat(key.id).forEach(function(id) {
                keyRangeArray.push(IDBKeyRange.only(id));
            });
        }
        else if (key.methodName) {
            index = objectStore.index("methodName");
            [].concat(key.methodName).forEach(function(methodName) {
                keyRangeArray.push(IDBKeyRange.only(methodName));
            });
        }
    }
    catch (e) {
	    DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB._createIndexAndKeyRange :: " + e);
    }
    finally {
        return {
            index : index,
            keyRangeArray : keyRangeArray
        };
    }
};

ZmOfflineDB.setItem =
function(value, objectStoreName, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(objectStoreName, "readwrite");
		var objectStore = transaction.objectStore(objectStoreName);
		if (objectStoreName === ZmApp.MAIL) {
			value = ZmOffline.modifyMsg(value);
		}
		else if (objectStoreName === ZmApp.CONTACTS) {
			value = ZmOffline.modifyContact(value);
		}
		[].concat(value).forEach(function(val) {
			objectStore.put(val);
		});
		transaction.oncomplete = callback;
		transaction.onerror = errorCallback;
	} catch(e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.setItem :: " + e);
	}
};

ZmOfflineDB.getItem =
function(key, objectStoreName, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(objectStoreName);
		var objectStore = transaction.objectStore(objectStoreName);
		var resultArray = [];

		if (key) {
			[].concat(key).forEach(function(ele) {
				objectStore.get(ele).onsuccess = function(ev) {
					var result = ev.target.result;
					if (result) {
						resultArray.push(result);
					}
				};
			});
		}
		else {
			objectStore.openCursor().onsuccess = function(ev) {
				var result = ev.target.result;
				if (result) {
					resultArray.push(result.value);
					result['continue']();
				}
			};
		}

		if (callback) {
			transaction.oncomplete = function() {
				if (objectStoreName === ZmApp.MAIL) {
					resultArray = ZmOffline.recreateMsg(resultArray);
				}
				else if (objectStoreName === ZmApp.CONTACTS) {
					resultArray = ZmOffline.recreateContact(resultArray);
				}
				callback(resultArray);
			};
		}
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.getItem :: " + e);
	}
};

ZmOfflineDB.getItemCount =
function(key, objectStoreName, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(objectStoreName);
		var objectStore = transaction.objectStore(objectStoreName);
		var count = 0;

		if (key) {
			objectStore.count(key).onsuccess = function(ev) {
				count = ev.target.result || 0;
			};
		}
		else {
			objectStore.count().onsuccess = function(ev) {
				count = ev.target.result || 0;
			};
		}

		if (callback) {
			transaction.oncomplete = function() {
				callback(count);
			};
		}
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.getItemCount :: " + e);
	}
};

ZmOfflineDB.deleteItem =
function(key, objectStoreName, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(objectStoreName, "readwrite");
		var objectStore = transaction.objectStore(objectStoreName);
		if (key) {
			[].concat(key).forEach(function(ele) {
				objectStore['delete'](ele);
			});
		}
		transaction.oncomplete = callback;
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.deleteItem :: " + e);
	}
};

ZmOfflineDB.search =
function(search, callback, errorCallback) {
	if (!search) {
		return;
	}
	search = ZmOfflineDB._parseSearchObj(search);
	if (search.searchFor === ZmId.SEARCH_MAIL || search.parsedSearchFor === ZmId.SEARCH_MAIL) {
		ZmOfflineDB.searchMail(search, callback, errorCallback);
	}
	else if (search.searchFor === ZmItem.CONTACT || search.contactSource === ZmItem.CONTACT) {
		ZmOfflineDB.searchContacts(search, callback, errorCallback);
	}
};

ZmOfflineDB.searchMail =
function(search, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(ZmApp.MAIL);
		var objectStore = transaction.objectStore(ZmApp.MAIL);
		var tokens = search.parsedQuery.getTokens();
		var isSearchAttachment = false;
		tokens.forEach(function(token) {
			var indexName = token.indexName;
			var indexValue = token.indexValue;
			if (indexName && indexValue) {
				token.result = [];
				var indexArray = [];
				var rangeArray = [];
				if (indexName === "content") {
					indexArray.push(objectStore.index("subject"), objectStore.index("fragment"));
					var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
					var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
					var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
					var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
					rangeArray.push(boundKeyRangeUpper, boundKeyRangeLower);
					isSearchAttachment = true;
				}
				else if (indexName === "size") {
					indexArray.push(objectStore.index(indexName));
					if (token.op === "smaller") {
						rangeArray.push(IDBKeyRange.upperBound(indexValue, true));
					}
					else if (token.op === "larger") {
						rangeArray.push(IDBKeyRange.lowerBound(indexValue, true));
					}
				}
				else if (indexName === "type") {
					isSearchAttachment = true;
				}
				else if (indexName === "tocc") {
					indexArray.push(objectStore.index("to"), objectStore.index("cc"));
					rangeArray.push(IDBKeyRange.only(indexValue));
				}
				else if (indexName === "receiveddate") {
					indexArray.push(objectStore.index("receiveddate"));
					if (token.op === "after") {
						rangeArray.push(IDBKeyRange.lowerBound(indexValue));
					}
					else if (token.op === "before") {
						rangeArray.push(IDBKeyRange.upperBound(indexValue, true));
					}
					else if (token.op === "date") {
						var nextDay = new Date(indexValue);
						AjxDateUtil.rollToNextDay(nextDay);//This will hold next day
						if (token.arg.indexOf("<=") !== -1) {
							rangeArray.push(IDBKeyRange.upperBound(nextDay.getTime()));
						}
						else if (token.arg.indexOf(">=") !== -1) {
							rangeArray.push(IDBKeyRange.lowerBound(indexValue));
						}
						else if (token.arg.indexOf("<") !== -1) {
							rangeArray.push(IDBKeyRange.upperBound(indexValue, true));
						}
						else if (token.arg.indexOf(">") !== -1) {
							rangeArray.push(IDBKeyRange.lowerBound(nextDay.getTime()));
						}
						else {
							rangeArray.push(IDBKeyRange.bound(indexValue, nextDay.getTime(), false, true));
						}
					}
				}
				else {
					indexArray.push(objectStore.index(indexName));
					rangeArray.push(IDBKeyRange.only(indexValue));
				}
				indexArray.forEach(function(index) {
					rangeArray.forEach(function(range) {
						index.openKeyCursor(range).onsuccess = function(token, ev) {
							var result = ev.target.result;
							if (result) {
								DBG.println(AjxDebug.DBG1, result.key + " : " + result.primaryKey);
								if (token.indexName === "content") {
									if (result.key.toLowerCase().indexOf(token.indexValue.toLowerCase()) !== -1) {
										token.result.push(result.primaryKey);
									}
								}
								else {
									token.result.push(result.primaryKey);
								}
								result['continue']();
							}
							else {
								token.result = AjxUtil.uniq(token.result);
							}
						}.bind(null, token);
					});
				});
			}
		});
		transaction.oncomplete = function() {
			var searchCallback = ZmOfflineDB._searchCallback.bind(null, search, callback, errorCallback);
			if (isSearchAttachment) {
				ZmOfflineDB.searchAttachment(search, searchCallback, errorCallback);
			}
			else {
				searchCallback();
			}
		};
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.searchMail :: " + e);
	}
};

ZmOfflineDB._parseSearchObj =
function(search) {
	var tokens = search.parsedQuery.getTokens();
	tokens.forEach(function(token) {
		if (token.op === "content" || token.op === "tag") {
			token.indexName = token.op;
			token.indexValue = token.arg;
		}
		else if (token.op === "from" || token.op === "to" || token.op === "cc" || token.op === "tocc") {
			token.indexName = token.op;
			token.indexValue = token.arg.toLowerCase();
			search.parsedSearchFor = ZmId.SEARCH_MAIL;
		}
		else if (token.op === "has") {
			if (token.arg === "attachment") {
				token.indexName = "flags";
				token.indexValue = "a";
			}
		}
		else if (token.op === "is") {
			token.indexName = "flags";
			if (token.arg === "unread") {
				token.indexValue = "u";
			}
			else if (token.arg === "flagged") {
				token.indexValue = "f";
			}
			else if (token.arg === "draft") {
				token.indexValue = "d";
			}
			else if (token.arg === "sent") {
				token.indexValue = "s";
			}
			else if (token.arg === "replied") {
				token.indexValue = "r";
			}
			else if (token.arg === "forwarded") {
				token.indexValue = "w";
			}
			else if (token.arg === "received") {
				token.indexName = "from";
				token.indexValue = appCtxt.getLoggedInUsername();
			}
		}
		else if (token.op === "in") {
			token.indexName = "folder";
			var folderId = ZmFolder.QUERY_ID[token.arg];
			if (!folderId) {
				var folder = appCtxt.getTree("FOLDER");
				if (folder) {
					var folderObj = folder.getByName(token.arg);
					folderId = folderObj && folderObj.id;
				}
			}
			token.indexValue = folderId;
			if (token.indexValue) {
				token.indexValue = token.indexValue.toString();
			}
		}
		else if (token.op === "type") {
			token.indexName = token.op;
			token.indexValue = token.arg.toLowerCase();
			token.objectStoreName = ZmOffline.ATTACHMENT;
		}
		else if (token.op === "larger" || token.op === "smaller") {
			token.indexName = "size";
			if (token.arg.toLowerCase().indexOf("kb") !== -1) {
				token.indexValue = parseInt(token.arg) * 1024;
			}
			if (token.arg.toLowerCase().indexOf("mb") !== -1) {
				token.indexValue = parseInt(token.arg) * 1024 * 1024;
			}
		}
		else if (token.op === "after" || token.op === "before" || token.op === "date") {
			var time = new Date(token.arg).getTime();
			if (isNaN(time)) {
				if (token.arg.indexOf("d") !== -1) {
					var field = AjxDateUtil.DAY;
				}
				else if (token.arg.indexOf("w") !== -1) {
					var field = AjxDateUtil.WEEK;
				}
				else if (token.arg.indexOf("m") !== -1) {
					var field = AjxDateUtil.MONTH;
				}
				else if (token.arg.indexOf("y") !== -1) {
					var field = AjxDateUtil.YEAR;
				}
				if (field) {
					var rolledDate = AjxDateUtil.roll(new Date(), field, parseInt(token.arg));
					var time = rolledDate && rolledDate.getTime();
				}
			}
			else {
				if (token.op === "after") {
					var nextDay = new Date(time);
					AjxDateUtil.rollToNextDay(nextDay);//This will hold next day
					time = nextDay.getTime();
				}
			}
			if (time && !isNaN(time)) {
				token.indexValue = time;
				token.indexName = "receiveddate";
			}
		}
	});
	return search;
};

ZmOfflineDB._searchCallback =
function(search, callback, errorCallback) {
	var tokens = search.parsedQuery.getTokens();
	var resultArray = [];
	tokens.forEach(function(token, i) {
		var previousToken = tokens[i-1];
		if (token.result) {
			if (previousToken) {
				if (previousToken.op === "or") {
					resultArray = AjxUtil.union(resultArray, token.result);
				}
				else if (previousToken.op === "not") {
					resultArray = AjxUtil.arraySubtract(resultArray, token.result);
				}
				else {// default and case
					resultArray = AjxUtil.intersection(resultArray, token.result);
				}
			}
			else {
				resultArray = token.result;
			}
		}
	});
	if (search.searchFor === ZmId.SEARCH_MAIL || search.parsedSearchFor === ZmId.SEARCH_MAIL) {
		ZmOfflineDB.getItem(resultArray, ZmApp.MAIL, callback, errorCallback);
	}
	else if (search.searchFor === ZmItem.CONTACT || search.contactSource === ZmItem.CONTACT) {
		ZmOfflineDB._searchContactsCallback(resultArray, search, callback, errorCallback);
	}
};

ZmOfflineDB.searchAttachment =
function(search, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(ZmOffline.ATTACHMENT);
		var objectStore = transaction.objectStore(ZmOffline.ATTACHMENT);
		var tokens = search.parsedQuery.getTokens();
		tokens.forEach(function(token) {
			var indexName = token.indexName;
			var indexValue = token.indexValue;
			if (indexName && indexValue) {
				if (!token.result) {
					token.result = [];
				}
				var rangeArray = [];
				if (indexName === "type") {
					var index = objectStore.index(indexName);
					rangeArray.push(IDBKeyRange.only(indexValue));
				}
				else {
					var index = objectStore.index("name");
					var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
					var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
					var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
					var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
					rangeArray.push(boundKeyRangeUpper, boundKeyRangeLower);
				}
			}
			rangeArray.forEach(function(range) {
				index.openKeyCursor(range).onsuccess = function(token, ev) {
					var result = ev.target.result;
					if (result) {
						DBG.println(AjxDebug.DBG1, result.key + " : " + result.primaryKey);
						var primaryKey = result.primaryKey;
						var mid = primaryKey.substring(primaryKey.indexOf("id=") + 3, primaryKey.indexOf("&"));
						if (mid) {
							mid = parseInt(mid);
							if (isNaN(mid) === false) {
								token.result.push(mid);
							}
						}
						result['continue']();
					}
					else {
						token.result = AjxUtil.uniq(token.result);
					}
				}.bind(null, token);
			});
		});
		transaction.oncomplete = callback;
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.searchAttachment :: " + e);
	}
};

ZmOfflineDB.searchContacts =
function(search, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(ZmApp.CONTACTS);
		var objectStore = transaction.objectStore(ZmApp.CONTACTS);
		var tokens = search.parsedQuery.getTokens();
		tokens.forEach(function(token) {
			var indexName = token.indexName;
			var indexValue = token.indexValue;
			if (indexName && indexValue) {
				if (!token.result) {
					token.result = [];
				}
				var indexArray = [];
				var rangeArray = [];
				if (indexName === "content") {
					indexArray.push(objectStore.index("firstname"), objectStore.index("lastname"), objectStore.index("middlename"), objectStore.index("email"), objectStore.index("company"), objectStore.index("jobtitle"));
					var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
					var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
					var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
					var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
					rangeArray.push(boundKeyRangeUpper, boundKeyRangeLower);
				}
				else {
					indexArray.push(objectStore.index(indexName));
					rangeArray.push(IDBKeyRange.only(indexValue));
				}

				indexArray.forEach(function(index) {
					rangeArray.forEach(function(range) {
						index.openKeyCursor(range).onsuccess = function(token, ev) {
							var result = ev.target.result;
							if (result) {
								DBG.println(AjxDebug.DBG1, result.key + " : " + result.primaryKey);
								if (token.indexName === "content") {
									if (result.key.toLowerCase().indexOf(token.indexValue.toLowerCase()) !== -1) {
										token.result.push(result.primaryKey);
									}
								}
								else {
									token.result.push(result.primaryKey);
								}
								result['continue']();
							}
							else {
								token.result = AjxUtil.uniq(token.result);
							}
						}.bind(null, token);
					});
				});
			}
		});

		search.sortedResult = [];
		var index = objectStore.index("fileasstr");
		if (search.lastSortVal) {
			var endSortVal = search.endSortVal || "a";
			var range = IDBKeyRange.bound(search.lastSortVal, endSortVal, false, true);
			var request = index.openKeyCursor(range);
		}
		else {
			var request = index.openKeyCursor();
		}
		request.onsuccess = function(ev) {
			var result = ev.target.result;
			if (result) {
				DBG.println(AjxDebug.DBG1, result.key + " : " + result.primaryKey);
				search.sortedResult.push(result.primaryKey);
				result['continue']();
			}
		};

		transaction.oncomplete = function() {
			ZmOfflineDB._searchCallback(search, callback, errorCallback);
		};
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.searchContacts :: " + e);
	}
};

ZmOfflineDB._searchContactsCallback =
function(resultArray, search, callback, errorCallback) {
	if (resultArray && search.sortedResult) {
		//sort by fileasstr
		resultArray = search.sortedResult.filter(function(val) {
			if (resultArray.indexOf(val) === -1) {
				return false;
			}
			return true;
		});
	}
	ZmOfflineDB.getItem(resultArray, ZmApp.CONTACTS, callback, errorCallback);
};

ZmOfflineDB.searchContactsForAutoComplete =
function(searchStr, callback, errorCallback) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(ZmApp.CONTACTS);
		var objectStore = transaction.objectStore(ZmApp.CONTACTS);
		var indexArray = [objectStore.index("firstname"), objectStore.index("email"), objectStore.index("middlename"), objectStore.index("lastname")];
		var indexValue = searchStr;
		var capitalize = indexValue.charAt(0).toUpperCase() + indexValue.substr(1).toLowerCase();
		var boundKeyRangeUpper = IDBKeyRange.bound(indexValue.toUpperCase(), capitalize + '\uffff');
		var lowerCase = indexValue.charAt(0).toLowerCase() + indexValue.substr(1).toUpperCase();
		var boundKeyRangeLower = IDBKeyRange.bound(lowerCase, indexValue.toLowerCase() + '\uffff');
		var rangeArray = [boundKeyRangeUpper, boundKeyRangeLower];
		var resultArray = [];

		indexArray.forEach(function(index) {
			rangeArray.forEach(function(range) {
				index.openKeyCursor(range).onsuccess = function(ev) {
					var result = ev.target.result;
					if (result) {
						DBG.println(AjxDebug.DBG1, result.key + " : " + result.primaryKey);
						if (result.key.toLowerCase().indexOf(indexValue.toLowerCase()) !== -1) {
							resultArray.push(result.primaryKey);
						}
						result['continue']();
					}
				};
			});
		});
		transaction.oncomplete = function() {
			resultArray = AjxUtil.uniq(resultArray);
			ZmOfflineDB.getItem(resultArray, ZmApp.CONTACTS, callback, errorCallback);
		};
		transaction.onerror = errorCallback;
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.searchContactsForAutoComplete :: " + e);
	}
};

ZmOfflineDB.doIndexSearch =
function(search, objectStoreName, formatter, callback, errorCallback, indexName) {
	try {
		var db = ZmOfflineDB.db;
		var transaction = db.transaction(objectStoreName);
		var objectStore = transaction.objectStore(objectStoreName);
		var resultArray = [];
		var index = objectStore.index(indexName);

		// From lower (inclusive) to upper (exclusive)
		var range = null;
		if (search.length == 1) {
			range = IDBKeyRange.only(search[0]);
		} else if (search.length == 2) {
			range = IDBKeyRange.bound(search[0], search[1], false, true);
		}
		if (range == null) {
			errorCallback && errorCallback();
			DBG.println(AjxDebug.DBG1, "ZmOfflineDB.doIndexSearch : Exception : " + e);
		} else {
			index.openCursor(range).onsuccess = function(ev) {
				var result = ev.target.result;
				if (result) {
					resultArray.push(result.value);
					result['continue']();
				}
			};

			if (callback) {
				transaction.oncomplete = function() {
					if (formatter) {
						resultArray = formatter(resultArray);
					}
					callback(resultArray);
				};
			}
			transaction.onerror = errorCallback;
		}
	}
	catch (e) {
		errorCallback && errorCallback();
		DBG.println(AjxDebug.DBG1, "Exception ZmOfflineDB.doIndexSearch :: " + e);
	}
};
