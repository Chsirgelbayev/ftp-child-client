import { Buffer } from 'buffer';
import { Writable, WritableOptions } from 'stream';

export class BufferWritable extends Writable {
  private data: any[];
  constructor(options?: WritableOptions) {
    super(options);
    this.data = [];
  }

  _write(chunk, _, callback) {
    this.data.push(chunk);
    callback();
  }

  getContents() {
    return Buffer.concat(this.data);
  }
}
