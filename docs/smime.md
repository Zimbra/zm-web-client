Title:     S/MIME in Zimbra
Author:    Dan Villiom Podlaski Christiansen
Email:     dchristiansen@zimbra.com
Copyright: Copyright (c) 2016 Synacor Inc.
CSS:       styles.css

# S/MIME in Zimbra #

Zimbra currently offers an *S/MIME Zimlet* that enables secure email from
within the AJAX client. Unfortunately, some design choices made this zimlet
unsuitable as a long term solution.

One issue affecting quality is that the Zimlet relies on [monkey patching]
--- overriding methods at runtime --- leading to a fragile codebase where the
Zimlet makes assumptions about the Zimbra codebase which may not hold as time
passes. The original motivation for this was that the Zimlet was originally
written outside of Zimbra; we had no other choice, since we couldn't modify
Zimbra itself. Fortunately, this won't be the case a second time around, and so
fixing this will be a relatively simple matter.

[monkey patching]: https://en.wikipedia.org/wiki/Monkey_patch

The other, and more important, issue is that it relies on a Java applet. As of
January 2016 only three browsers support Java applets: *Internet Explorer*,
*Mozilla Firefox* and *Safari*. *Google Chrome* dropped support for Java some
time ago, and *Microsoft Edge*, the successor to *Internet Explorer*, similarly
dropped support. To compound matters, *Firefox* will
[drop support for Java by the end of 2016][firefox_java]. We can't
realistically claim to support a feature unless it actually works in most of
the common browsers; *Chrome*, *Internet Explorer*, *Firefox*, *Safari* and
*Edge*. To top it off, Oracle recently announced their [deprecation] of the
Java plugin --- meaning that they'll remove it sometime after Java 9. Combined
with the fact that Java never worked on mobile platforms, the actual value of
our Zimlet is quite low.

[firefox_java]: https://blog.mozilla.org/futurereleases/2015/10/08/npapi-plugins-in-firefox/
[deprecation]: https://blogs.oracle.com/java-platform-group/entry/moving_to_a_plugin_free

We need a path forward, but first, I'd like to describe how we got to where we
are.

## A brief history ##

The *S/MIME* effort originated in 2010 as a sort of skunkworks project at Cabo,
a Danish company contracting for Zimbra. Denmark had rolled out an official
digital signature in a rather unusual server-based solution where users never
obtained their actual key. We wanted to allow users to sign messages using
their official IDs, and figured Zimbra would be interested in this if we proved
we could make it work. Incidentally, Zimbra was also interested in selling to
the U.S. government, specifically the *Department of Defense*, where *S/MIME*
support was a requirement, and where they used smart cards for key storage.

First, we considered our options. The requirement to work with tokens, such as
the Danish ID and smart cards, ruled out a server-based implementation as well
as any exclusively browser-based solution; then, as now, browsers offer no
reliable, cross-platform API for accessing their secure certificate store. The
only alternatives were a custom plugin, browser extensions, or a Java applet
with native code. We quickly ruled out a custom browser plugin due to the
likely massive effort involved for each browser. Browser extensions involved
writing custom code for each browser as well as a separate download.
Furthermore, in addition to require one extension and installation for each
browser, we might even have to fall back to using plugins for the native code
on some browsers, leading back to the issue of significant amounts of code and
testing. As a result, we ruled out browser extensions based primarily on the
level-of-effort required: although they'd likely result in a more pleasant
experience for end users, we'd have to write one extension for each browser. We
considered this prohibitive, and combined with the fact that not all browsers
offered a suitable extension API --- and they still don't --- we went for Java.
Although Java's track record wasn't great, even then, at least it worked in all
browsers, and would allow us to share the vast majority of the code, and thus
effort, between all browsers.

Something was better than nothing, so we chose Java as the lesser evil; it was
the one option that allowed us to achieve a working *S/MIME* implementation
with the resources available. We settled on writing a Zimlet that intercepted
the necessary calls to pass mail messages through a Java applet, which accessed
the browser key store directly.

With the Java applet, we could share most of the code between the various
platforms; the one exception being the layer that integrated with the native
cryptography layer. So we ended up with one applet and three implementations of
the native code: OS X, Windows and Firefox/NSS. Due to the desire to sell
*S/MIME* to the U.S. government, we added support for using FIPS validated
cryptography with Firefox and Windows, and had the code reviewed by RSA.

Security-wise, the main benefit of the Java applet was that it kept keys
secure; an attacker could alter what you signed or encrypted, but could never
extract your keys. Due to code signing, users could even ensure that the applet
and native code were exactly as shipped by Zimbra. The main downside, of
course, was that it relied on the Java plugin with its less-than-stellar
security record.

### Current status ###

As you may know, the Java situation has only worsened since then: Plagued with
security problems, most browser developers have either disabled the Java
plugin, or announced that they will do so. The only exceptions are Apple, who
never announce long term plans, not even for Safari, and Microsoft, who keep
Java alive in IE11. Safari, however, sandboxes applets by default, requiring
users to go into the browser preferences and explicitly grant us permissions
--- which causes a small warning triangle. As mentioned earlier, even Oracle
themselves are abandoning the Java plugin.

The best option for extensions has even become untenable, since Mozilla
[deprecated their extensive XUL API][dead-xul], switching to a [replacement
API](WebExtensions) based on Chrome's API. Although this API does offer a
[platformKeys] API useful for implementing *S/MIME*, that API is only available
on ChromeOS. In other words, it's of no use to us.

[dead-xul]: https://blog.mozilla.org/addons/2015/08/21/the-future-of-developing-firefox-add-ons/
[WebExtensions]: https://developer.mozilla.org/en-US/Add-ons/WebExtensions
[platformKeys]: https://developer.chrome.com/extensions/platformKeys

## A (quick) primer on S/MIME ##

The core primitive in *S/MIME* is *public key cryptography*, where you have two
keys: one public, and the other private. The two keys correspond to each other,
so that anything you encrypt with the public key decrypts with the private key
--- and vice versa. This means that you can encrypt information with the public
key, and only the owner of the private key may read it. Likewise, you can
decrypt something with the public key, and know that only someone with the
private key could have written it --- this is the basis for signatures.

*S/MIME* comprises a set of standards for sending and receiving secure email,
i.e. signed and/or encrypted email. Whereas a simplistic implementation of the
primary alternative, PGP, can get away with requiring users to obtain keys
themselves, *S/MIME* builds on the usual *X.509* certificate infrastructure
with trusted roots, certificate validation, revocation and so on. Some
implementations require users to explicitly add certificates to use for
encryption; all require full validation of signatures.

As an example, in order to verify an *S/MIME* signature, a software
implementation will need to:

*   Parse the message and determine, from the *MIME* types, that it's signed.
*   Convert the signed portion into a canonical form for verification.
*   Extract signature and certificate from the *Cryptographic Message Syntax*,
	*or CMS*, blob in the message.
*   Convert the message to a canonical form specified by the *CMS* standard.
*   Verify the signature using the public key in the certificate:
    * Extract the certificate from the signature.
    * Extract a trusted timestamp from the message, if provided, and verify its
      signature.
    * Check if the certificate is trusted for signing — i.e. either it is either
      explicitly marked trusted or signed by another trusted certificate, and
      remains valid at the time of signing, or now.
    * Check for revocation using any online validity providers listed in the
      certificate.
    * Calculate a cryptographic checksum of the message in its canonical form.
    * Decrypt the signature using the public key in the certificate, extracting
	  a checksum.
    * If the checksum in the message corresponds to what we calculated: Voila,
	  the message is signed and valid!

Signing a message is essentially the same process in reverse, using the private
key to encrypt the checksum. All certificates include their public key, but
only the owner of the certificate has access to the private key. A certificate
paired with the corresponding private key is frequently called an *identity
certificate*.

Some items in an *S/MIME* implementation are particularly critical for trust.
Obviously, the private key is crucial, and is sometimes even stored in a
tamper-proof cryptographic accelerator or a smart card. The set of base trusted
certificates, or *roots*, is similarly critical; if you control them, you can
cause any certificate to be marked trusted.

### On trust ###

One notion is crucial when speaking of secure systems: **trust**. Whom do
you trust? What do you trust?

As an example, and a given, we have to assume that our users place some level
of trust in us. They trust us not to write malicious code, but they won't trust
us with their private keys and certificates. Similarly, some might consider the
end-user workstation a convenient and secure location for keys; others might
not trust *any* software solution with the keys, storing them in smart cards,
tokens or secure cryptoprocessors instead.

Another important point is that for *S/MIME* with the Zimbra AJAX UI, users
have no choice but to trust the server to a certain extent. Since the server
delivers the JavaScript code that renders the UI, an attacker could modify this
code to lie about certain messages, sign unintended data, leak sensitive data
or worse. We have no means whatsoever of preventing this.

## The path forward ##

Our options today are rather limited. If we want to offer *S/MIME* going forward,
we essentially have three choices, which I will enumerate in sections below.

1.  Implement *S/MIME* fully in JavaScript.
2.  Work with browser developers to expose extension APIs that allow us to
    implement *S/MIME* securely.
3.  Implement *S/MIME* using server-side cryptography.

### Client-side implementation ###

Technically, there's no reason why we couldn't implement *S/MIME* in JavaScript
within a browser session. We even have libraries we could use, such as
[PKI.JS](https://pkijs.org); demos on their site includes an *S/MIME* demo.

The main issue, however, is certificate storage. As an example, the PGP Zimlet
stores keys encrypted, but decrypts them in memory. In effect, this means that
keys are only as secure as the JavaScript session, and any malicious script
could intercept them and send them elsewhere. Furthermore, we couldn't support
keys stored in smart cards and tokens, which are quite common among business
and government users.

As such, we'd only support a relatively limited set of certificates, and a
somewhat weak trust model. It's easy to do, but would customers accept it?

### Extending browsers ###

Essentially, this involves extending browsers to the point where either the
regular DOM APIs or their extension APIs allow us to do what current the
*S/MIME* applet does. We could probably use a client-side effort as a starting
point. Although it'd arguably result in the best user experience, the effort
involved is considerable, and extends beyond Zimbra developers' regular areas
of expertise. We'd have to work with one or more browser vendors, and possibly
even with standardisation bodies; we won't know upfront whether vendors would
find this interesting, or how much help we'd receive from them or elsewhere, if
any at all.

That being said, if we elected to restrict our work to one browser, e.g.
Firefox, I believe we would be able to offer a good product with a reasonable
security model. First, we'd write an extension, and once that was in good shape
we could look to other browsers either through the standards track or similar
extension efforts.

Although the effort involved is considerable, it's the only way we have for
working with smart cards and tokens --- which remain important in many
corporate scenarios.

### Server-side implementation ###

In this approach, we'd extend the server to be able to recognise and process
*S/MIME* messages. At first, we'd just store all certificates on the server, and
make sure that it works. Later, we'd add support for storing keys in a [secure
cryptoprocessor], meaning that a server compromise could never *extract* the
keys, only *use* them.

[secure cryptoprocessor]: https://en.wikipedia.org/wiki/Secure_cryptoprocessor

If the server itself was sufficiently secured, this might be sufficient for
security conscientious customers. We have two solutions that can help here:
two-factor authentication and client certificate authentication. The latter, in
particular, provides very strong security.

The major advantage to this approach is that it stays within our field of
expertise. We have people who know the server-side Java code, and could either
reuse the applet *S/MIME* code or adopt libraries from [Bouncy Castle] or a
similar third-party project. Then, we'd simply use flags and fields in the SOAP
requests for communicating the security status of a message to the UI --- the
same way the rest of Zimbra operates. As an added bonus, we could even make
this work across all UIs. As a further security enhancement, we could add
support for a dedicated key server.

[Bouncy Castle]: https://bouncycastle.org

The disadvantage, however, is that it's a somewhat novel approach compared to
what we have: Storing keys on the server might be attractive or acceptable to
some customers, but how many? Would our current customers accept this? Can we
sell it to others?

As a developer, I cannot answer these questions, but I can offer a few
arguments in favour of a server-side solution. First of all, we have no choice
but to trust the server somewhat, so this builds on it and reduces the need to
trust the workstation. Second, we do have an excellent answer for anyone
wanting to use client-side tokens: use *S/MIME* in Outlook, Thunderbird or
Apple Mail. Zimbra works very well with them!
