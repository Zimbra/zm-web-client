# ***** BEGIN LICENSE BLOCK *****
# Zimbra Collaboration Suite Web Client
# Copyright (C) 2014, 2015, 2016 Synacor, Inc.
#
# This program is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software Foundation,
# version 2 of the License.
#
# This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
# without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
# You should have received a copy of the GNU General Public License along with this program.
# If not, see <https://www.gnu.org/licenses/>.
# ***** END LICENSE BLOCK *****

RM = rm -rf
TEE = tee
MKDIR = mkdir -p

CURL = curl
NODE = node
NPM = npm --loglevel error --color false
GRUNT = $(NPMBINDIR)/grunt --no-color
TAR = tar
ANT = ant -emacs
PATCH = patch
DIFF = diff -aur

TINYMCE_VERS := $(shell $(ANT) -q -f ../build.xml get-tinymce-version | head -1)
TINYMCE_URL = https://github.com/tinymce/tinymce/archive/$(TINYMCE_VERS).tar.gz

TINYMCEDIR = tinymce-$(TINYMCE_VERS)
NPMBINDIR = $(shell cd $(TINYMCEDIR); npm bin)

# may not be set on Linux
TMPDIR ?= /tmp/$(USER)

.PHONY:

all: build


#
# install required Node packages locally and build TinyMCE
#
build:
	cd $(TINYMCEDIR) && $(NPM) install
	cd $(TINYMCEDIR) && $(GRUNT)

#
# remove anything that shouldn't be checked into Perforce, such as build
# requirements.
#
clean:
	$(RM) $(TINYMCEDIR)/node_modules
	$(RM) $(TINYMCEDIR)/tmp

#
# generate a patch comparing a raw TinyMCE with our patches with the contents
# of the current TinyMCE directory.
#
diff: build
	$(MKDIR) $(TMPDIR)
	$(MAKE) TINYMCEDIR=$(TMPDIR)/$(TINYMCEDIR) patch
	cd $(TINYMCEDIR) && $(GRUNT) clean
	$(DIFF) -x node_modules $(TMPDIR)/$(TINYMCEDIR) $(TINYMCEDIR) | $(TEE) work.diff
	@$(RM) TINYMCEDIR=$(TMPDIR)/$(TINYMCEDIR)

define applypatch
	$(PATCH) -p1 -d $(TINYMCEDIR) < $1

endef

#
# fetch TinyMCE anew and reapply patches
#
patch:
	$(RM) $(TINYMCEDIR)
	$(CURL) -fL $(TINYMCE_URL) | $(TAR) zxC $(dir $(TINYMCEDIR))

	$(foreach p, $(sort $(wildcard patches/*.diff)), $(call applypatch,$p))

#
# fetch TinyMCE anew and rebuild it
#
reset:
	$(MAKE) patch
	$(MAKE) build
	$(MAKE) clean
