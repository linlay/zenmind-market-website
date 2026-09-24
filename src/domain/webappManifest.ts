function findEndOfCentralDirectory(bytes: Uint8Array) {
  // The ZIP comment is capped at 64 KiB, so the end record must be in this range.
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 0xffff - 22); index -= 1) {
    if (bytes[index] === 0x50 && bytes[index + 1] === 0x4b && bytes[index + 2] === 0x05 && bytes[index + 3] === 0x06) return index;
  }
  return -1;
}

async function decodeZipEntry(bytes: Uint8Array, offset: number, compressedSize: number, compressionMethod: number) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(offset, true) !== 0x04034b50) throw new Error('发布包中的 ZIP 条目无效。');
  const nameLength = view.getUint16(offset + 26, true);
  const extraLength = view.getUint16(offset + 28, true);
  const content = bytes.slice(offset + 30 + nameLength + extraLength, offset + 30 + nameLength + extraLength + compressedSize);
  if (compressionMethod === 0) return new TextDecoder().decode(content);
  if (compressionMethod === 8 && typeof DecompressionStream !== 'undefined') {
    const stream = new Blob([content]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).text();
  }
  throw new Error('无法读取发布包：浏览器不支持该 ZIP 压缩格式。');
}

export async function readWebappManifest(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const endOffset = findEndOfCentralDirectory(bytes);
  if (endOffset < 0) throw new Error('本地网站应用必须上传 ZIP 格式的发布包。');
  const entries = view.getUint16(endOffset + 10, true);
  let offset = view.getUint32(endOffset + 16, true);
  for (let index = 0; index < entries; index += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('发布包中的 ZIP 目录无效。');
    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = new TextDecoder().decode(bytes.slice(offset + 46, offset + 46 + nameLength)).replaceAll('\\', '/');
    if (name === 'webapp.json' || name.endsWith('/webapp.json')) {
      let manifest;
      try {
        manifest = JSON.parse(await decodeZipEntry(bytes, localHeaderOffset, compressedSize, compressionMethod));
      } catch (error) {
        if (error instanceof SyntaxError) throw new Error('webapp.json 不是有效的 JSON。');
        throw error;
      }
      const id = String(manifest?.id || '').trim();
      if (!id) throw new Error('webapp.json 必须包含 id。');
      const version = String(manifest?.version || '').trim().replace(/^[vV](?=\d)/, '');
      if (!version) throw new Error('webapp.json 必须包含 version。');
      return { id, version };
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error('本地网站应用发布包必须包含 webapp.json。');
}
