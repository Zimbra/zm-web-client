=============================================
 BUILDING AND CUSTOMIZING TINYMCE FOR ZIMBRA
=============================================

We have a Makefile which automatically fetches TinyMCE, applies our patches to
it and builds it.

In order to build TinyMCE, you'll need a few extra packages beyond the regular
requirements of Zimbra:

- node (aka. nodejs or node-js)
- npm (occassionally included with node)
- curl
- GNU Make
- diff & patch

See the Makefile itself for further documentation on available targets. I'll
describe a few typical tasks below.

Please note that the final step prior to posting a patch to
ReviewBoard and/or submitting a change to Perforce should be:

  $ make reset

This blows away the TinyMCE sources, regenerates, patches and rebuilds
them, and finally reconciles the modifications with Perforce,
preventing any changes beyond our patches.

PATCHING TINYMCE
----------------

The process for modifying TinyMCE constists of two phases: first, you write and
test the change, and then you create the patch.

When making the change, take care to edit the original source files rather than
any compiled or inline version. Then, build TinyMCE and deploy Zimbra as usual:

  $ make
  $ ant sync -s

When your change is good, generate a patch and move it into the 'patches'
directory:

  $ make diff
  $ cp work.diff patches/01-bug_1337.diff

Make sure to use sequential numbering for the start of the patch, and that the
number is greater than the other existing patches. Otherwise, the patches may
fail to apply.


UPDATING A PATCH
----------------

If you need to update a patch, simply delete while it's applied and regerate:

  $ rm patches/01-bug_1337.diff
<HACK HACK HACK>
  $ make diff
  $ cp work.diff patches/01-bug_1337.diff

This approach is preferable to adding multiple incremental patches, as it
allows easily removing the change later on. The incremental history is
available in Perforce.


UPGRADING TINYMCE
-----------------

The 'reset' target fetches, builds and applies our patches to TinyMCE.  The
TinyMCE version is normally extracted from 'build.xml', but can also be
specified on the command line:

  $ make TINYMCE_VERS=4.x.y reset

This will be useful for testing that all patches apply to the upgraded version,
and that the upgraded version works as expected.

When they do, rename the old version to the new, update 'tinymce.version' in
'build.xml', and do a simple reset.

  $ make reset

Take care to ensure that Git tracks added and removed files correctly and commit them.
