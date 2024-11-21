import { TextEncoder, TextDecoder, encode, decode } from '@temporalio/common/lib/encoding'
interface TextEncoding {
  checkUtf8: (text: string) => boolean
  encodeUtf8: (text: string) => Uint8Array
  decodeUtf8: (bytes: Uint8Array) => string
}

class TextEncodingAdapter implements TextEncoding {
  encoding = 'utf-8'
  private encoder: TextEncoder
  private decoder: TextDecoder
  constructor() {
    this.encoder = new TextEncoder()
    this.decoder = new TextDecoder()
  }

  checkUtf8(text: string): boolean {
    try {
      encodeURIComponent(text)
      return true
    }
    catch (e) {
      console.error('err', e)
      return false
    }
  }

  encodeUtf8(text: string): Uint8Array {
    return encode(text)
  }

  decodeUtf8(bytes: Uint8Array): string {
    return decode(bytes)
  }

  encodeInto(src: string, dest: Uint8Array): { read: number, written: number } {
    return new TextEncoder().encodeInto(src, dest)
  }

  encode(text: string): Uint8Array {
    return encode(text)
  }
  decode(bytes: Uint8Array): string {
    return decode(bytes)
  }
}
export default TextEncodingAdapter