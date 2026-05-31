import * as bufferModule from 'buffer';

type BufferModule = typeof bufferModule & {
  SlowBuffer?: typeof bufferModule.Buffer;
};

const buffer = bufferModule as BufferModule;

// Node.js 25+ removed SlowBuffer; jsonwebtoken/jwa still expect it.
if (typeof buffer.SlowBuffer === 'undefined') {
  buffer.SlowBuffer = buffer.Buffer;
}
