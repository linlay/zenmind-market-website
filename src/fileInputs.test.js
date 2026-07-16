import assert from 'node:assert/strict';
import test from 'node:test';

import { selectedFormFile } from './fileInputs.js';

function formWithFile(name, file) {
  return {
    elements: {
      namedItem(fieldName) {
        return fieldName === name ? { files: file ? [file] : [] } : null;
      },
    },
  };
}

test('reads a selected file without relying on the global File constructor', () => {
  const originalFile = globalThis.File;
  globalThis.File = { overriddenByDesktopRuntime: true };

  try {
    const upload = { name: 'component.zip', size: 128 };
    const form = formWithFile('artifact', upload);

    assert.equal(selectedFormFile(form, null, 'artifact'), upload);
  } finally {
    globalThis.File = originalFile;
  }
});

test('falls back to FormData-compatible values', () => {
  const upload = { name: 'adp.yml', size: 64 };
  const formData = { get: (name) => (name === 'adpManifest' ? upload : null) };

  assert.equal(selectedFormFile(null, formData, 'adpManifest'), upload);
});

test('ignores missing and empty file selections', () => {
  assert.equal(selectedFormFile(formWithFile('artifact', null), null, 'artifact'), null);
  assert.equal(selectedFormFile(formWithFile('artifact', { size: 0 }), null, 'artifact'), null);
  assert.equal(selectedFormFile(null, null, 'artifact'), null);
});
