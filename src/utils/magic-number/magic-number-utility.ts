export default class MagicNumberUtility {
  private readonly _buffer: Buffer;
  private readonly _fileType: string;

  constructor(buffer: Buffer, fileType: string) {
    this._buffer = buffer;
    this._fileType = fileType;
  }

  public get isImageType(): boolean {
    return this.getFileType()?.mimeType === this._fileType;
  }

  private getFileType(): FileType | null {
    if (!this._buffer) {
      throw new Error('File does not have any content');
    }

    let isMatch = false;

    let b: Base[] = [new PNG(), new JPG()];

    for (let j = 0; j < b.length; j++) {
      const base = b[j];
      const bytes = base.magicBytes;
      const totalBytes = bytes.length;

      for (let k = 0; k < totalBytes; k++) {
        const offset = base.offset;

        if (bytes[k] !== this._buffer[k + offset]) {
          break;
        }

        isMatch = true;
      }

      if (isMatch) return base;
    }

    return null;
  }
}

class Base implements FileType {
  public extension: string;
  public magicBytes: number[];
  public mimeType: string;
  public offset: number;

  constructor(extension: string, mimeType: string, bytes: number[], offset: number = 0) {
    this.mimeType = mimeType;
    this.magicBytes = bytes;
    this.extension = extension;
    this.offset = offset;
  }
}

class JPG extends Base {
  constructor(bytes: number[] = [0xff, 0xd8, 0xff, 0xe0]) {
    super('jpg', 'image/jpeg', bytes);
  }
}

class JFIF extends JPG {
  constructor() {
    super([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01])
  }
}

class EXIF extends JPG {
  constructor() {
    super([0xFF, 0xD8, 0xFF, 0xE1])
  }
}

class PNG extends Base {
  constructor() {
    super('png', 'image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  }
}

interface FileType {
  extension: string;
  mimeType: string;
}
