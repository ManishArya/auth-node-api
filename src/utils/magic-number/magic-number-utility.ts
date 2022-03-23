export default class MagicNumberUtility {
  private readonly _buffer: Buffer;
  private readonly _mimeType: string;

  constructor(buffer: Buffer, mimeType: string) {
    this._buffer = buffer;
    this._mimeType = mimeType;
  }

  public get isImageType(): boolean {
    return this.getFileFormat()?.mimeType === this._mimeType;
  }

  private getFileFormat(): IFileFormat | null {
    if (!this._buffer) {
      throw new Error('File does not have any content');
    }

    let isMatch = false;

    let formats: FileFormat[] = [new PNG(), new JPG()].sort((x) => x.totalBytes);

    const totalFormats = formats.length;

    for (let j = 0; j < totalFormats; j++) {
      const format = formats[j];

      isMatch = format.isMatch(this._buffer);

      if (isMatch) return format;
    }

    return null;
  }
}

abstract class FileFormat implements IFileFormat {
  public readonly extension: string;
  public magicBytes: readonly number[];
  public readonly mimeType: string;
  public readonly offset: number;
  public readonly totalBytes: number;

  constructor(extension: string, mimeType: string, bytes: readonly number[], offset: number = 0) {
    this.mimeType = mimeType;
    this.magicBytes = bytes;
    this.extension = extension;
    this.offset = offset;
    this.totalBytes = bytes.length || 0;
  }

  public isMatch(buffer: Buffer): boolean {
    if (this.totalBytes === 0 || this.totalBytes > buffer.length) return false;

    for (let k = 0; k < this.totalBytes; k++) {
      const offset = this.offset;

      if (this.magicBytes[k] !== buffer?.[k + offset]) {
        return false;
      }
    }
    return true;
  }
}

class JPG extends FileFormat {
  constructor(bytes: readonly number[] = [0xff, 0xd8, 0xff, 0xe0]) {
    super('jpg', 'image/jpeg', bytes);
  }
}

class JFIF extends JPG {
  constructor() {
    super([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  }
}

class EXIF extends JPG {
  constructor() {
    super([0xff, 0xd8, 0xff, 0xe1]);
  }
}

class PNG extends FileFormat {
  constructor() {
    super('png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
}

interface IFileFormat {
  extension: string;
  mimeType: string;
}
