# ***** BEGIN LICENSE BLOCK *****
# Zimbra Collaboration Suite Web Client
# Copyright (C) 2013, 2014 Zimbra Software, LLC.
#
# The contents of this file are subject to the Zimbra Public License
# Version 1.4 ("License"); you may not use this file except in
# compliance with the License.  You may obtain a copy of the License at
# http://www.zimbra.com/license.
#
# Software distributed under the License is distributed on an "AS IS"
# basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
# ***** END LICENSE BLOCK *****

RM = rm -rf
TEE = tee

CURL = curl
NODE = node
NPM = npm --loglevel error --color false
TAR = tar
ANT = ant -emacs
P4 = p4
PATCH = patch
DIFF = diff -Naur

TINYMCE_VERS := $(shell $(ANT) -q -f ../build.xml get-tinymce-version | head -1)
TINYMCE_URL = https://github.com/tinymce/tinymce/archive/$(TINYMCE_VERS).tar.gz
JAKE = $(shell cd $(TINYMCEDIR) && npm bin)/jake

TINYMCEDIR = tinymce-$(TINYMCE_VERS)
NPMBINDIR = $(shell npm bin)

.PHONY:

all: build


#
# install required Node packages locally and build TinyMCE
#
build:
	cd $(TINYMCEDIR) && $(NPM) install
	cd $(TINYMCEDIR) && $(JAKE)

#
# remove anything that shouldn't be checked into Perforce, such as build
# requirements.
#
clean:
	$(RM) $(TINYMCEDIR)/node_modules

#
# generate a patch comparing a raw TinyMCE with our patches with the contents
# of the current TinyMCE directory.
#
diff: build
	$(MAKE) TINYMCEDIR=$(TMPDIR)/$(TINYMCEDIR) patch
	cd $(TINYMCEDIR) && $(JAKE) clean
	$(DIFF) -x node_modules $(TMPDIR)/$(TINYMCEDIR) $(TINYMCEDIR) | $(TEE) work.diff
	@$(RM) TINYMCEDIR=$(TMPDIR)/$(TINYMCEDIR)

#
# fetch TinyMCE anew and reapply patches
#
patch:
	$(RM) $(TINYMCEDIR)
	$(CURL) -fL $(TINYMCE_URL) | $(TAR) zxC $(dir $(TINYMCEDIR))

define applypatch
	$(PATCH) -p1 -d $(TINYMCEDIR) < $1

endef

	$(foreach p, $(wildcard patches/*.diff), $(call applypatch,$p))

#
# fetch TinyMCE anew and rebuild it
#
reset:
	$(MAKE) patch
	$(MAKE) build
	$(MAKE) clean

	-$(P4) reconcile $(TINYMCEDIR)/...
