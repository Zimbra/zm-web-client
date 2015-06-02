UT.module("Toolbars");

UT.test("DwtToolBar", function() {
	UT.expect(5);

	var shell = appCtxt.getShell();
	var toolbar = new DwtToolBar({parent: shell});

	try {
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 0,
		               'no elements to begin with?');

		var sep = toolbar.addSeparator();
		var filler = toolbar.addFiller();
		var spacer = toolbar.addSpacer();
		var button = new DwtButton({parent: toolbar});

		UT.strictEqual(toolbar.getChildren().length, 4,
		               'all elements correspond to a child?');

		toolbar.removeChild(sep);
		toolbar.removeChild(filler);
		toolbar.removeChild(spacer);
		toolbar.removeChild(button);

		UT.strictEqual(toolbar.getChildren().length, 0,
		               'no children remain?');
		UT.strictEqual(toolbar._items.length, 0,
		               'no items remain?');
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 0,
		               'no elements remain?');

	} finally {
		toolbar.dispose();
	}
});

UT.test("ZmAppChooser", function() {
	UT.expect(5);

	var shell = appCtxt.getShell();
	var toolbar = new ZmAppChooser({parent: shell, buttons: {}});

	try {
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 2,
		               'just the suffix and prefix elements to begin with?');

		var butt = toolbar.addButton(Dwt.getNextId(), {
			text: 'a button',
			tooltip: 'something or other'
		});

		UT.strictEqual(toolbar.getChildren().length, 1,
		               'all elements correspond to a child?');

		toolbar.removeChild(butt);

		UT.strictEqual(toolbar.getChildren().length, 0,
		               'no children remain?');
		UT.strictEqual(toolbar._items.length, 0,
		               'no items remain?');
		UT.strictEqual(toolbar._itemsEl.childNodes.length, 2,
		               'back to square one?');

	} finally {
		toolbar.dispose();
	}
});
