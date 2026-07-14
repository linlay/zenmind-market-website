# Publish File Input Compatibility Design

## Problem

The publish form checks selected uploads with `value instanceof File`. Some
Desktop/WebView runtimes replace the global `File` binding with a non-callable
value. Evaluating `instanceof File` then throws before the request and before
the existing request error handler, leaving the user without feedback.

## Design

Read each upload directly from its file input element through `files[0]`.
Expose this behavior as a small DOM-independent helper that accepts a form-like
object and a field name, so it can be verified without a browser test runtime.
An upload is selected when the returned value exists and has a positive numeric
`size`; no global `File` or `Blob` constructor is consulted.

Move all publish-form extraction and metadata construction inside the existing
publish operation error boundary. Validation failures continue to use their
specific messages. Unexpected client-side failures use the standard publish
failure toast, and `isPublishing` is always restored.

## Compatibility

The helper supports standard `HTMLFormElement.elements.namedItem(name)` file
controls. It also falls back to `FormData.get(name)` so existing form behavior
continues to work in ordinary browsers and the change remains narrowly scoped.

## Verification

Add a Node built-in test for file extraction and selection that runs while the
global `File` value is non-callable. Verify empty and missing controls are not
treated as selected. Run the regression test and the production Vite build.
