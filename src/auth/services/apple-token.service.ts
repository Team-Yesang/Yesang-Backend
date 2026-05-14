import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createPublicKey, verify } from 'crypto';

type AppleJwk = {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  crv: string;
  x: string;
  y: string;
};

type AppleIdentityTokenClaims = {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
  nonce?: string;
};

@Injectable()
export class AppleTokenService {
  private readonly jwksUrl = 'https://appleid.apple.com/auth/keys';
  private readonly jwksCacheTtlMs = 60 * 60 * 1000;
  private cachedKeys: AppleJwk[] | null = null;
  private cachedAt = 0;

  async verifyIdentityToken(identityToken: string, audience?: string | Array<string | undefined>) {
    const [encodedHeader, encodedPayload, encodedSignature] = identityToken.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new UnauthorizedException('유효하지 않은 Apple identityToken 형식입니다.');
    }

    const header = this.parseSegment<{ alg: string; kid: string }>(encodedHeader);
    const claims = this.parseSegment<AppleIdentityTokenClaims>(encodedPayload);

    if (header.alg !== 'ES256' || !header.kid) {
      throw new UnauthorizedException('지원하지 않는 Apple identityToken 입니다.');
    }

    const jwk = await this.getSigningKey(header.kid);
    const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
    const signingInput = Buffer.from(`${encodedHeader}.${encodedPayload}`);
    const signature = this.joseToDer(Buffer.from(encodedSignature, 'base64url'));
    const isValid = verify('sha256', signingInput, publicKey, signature);

    if (!isValid) {
      throw new UnauthorizedException('Apple identityToken 서명 검증에 실패했습니다.');
    }

    this.validateClaims(claims, audience);

    return claims;
  }

  private async getSigningKey(kid: string) {
    const keys = await this.getAppleKeys();
    const jwk = keys.find((key) => key.kid === kid);

    if (!jwk) {
      throw new UnauthorizedException('Apple 공개키를 찾을 수 없습니다.');
    }

    return jwk;
  }

  private async getAppleKeys() {
    const now = Date.now();
    if (this.cachedKeys && now - this.cachedAt < this.jwksCacheTtlMs) {
      return this.cachedKeys;
    }

    const response = await fetch(this.jwksUrl);
    if (!response.ok) {
      throw new UnauthorizedException('Apple 공개키를 가져오지 못했습니다.');
    }

    const data = (await response.json()) as { keys?: AppleJwk[] };
    if (!Array.isArray(data.keys) || data.keys.length === 0) {
      throw new UnauthorizedException('Apple 공개키 응답이 비어 있습니다.');
    }

    this.cachedKeys = data.keys;
    this.cachedAt = now;
    return data.keys;
  }

  private validateClaims(claims: AppleIdentityTokenClaims, audience?: string | Array<string | undefined>) {
    if (claims.iss !== 'https://appleid.apple.com') {
      throw new UnauthorizedException('Apple identityToken 발급자가 올바르지 않습니다.');
    }

    const allowedAudiences = (Array.isArray(audience) ? audience : [audience])
      .filter((value): value is string => Boolean(value));

    if (allowedAudiences.length > 0 && !allowedAudiences.includes(claims.aud)) {
      throw new UnauthorizedException('Apple identityToken audience가 일치하지 않습니다.');
    }

    if (!claims.sub) {
      throw new UnauthorizedException('Apple identityToken에 사용자 식별자가 없습니다.');
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (claims.exp <= nowInSeconds) {
      throw new UnauthorizedException('만료된 Apple identityToken 입니다.');
    }
  }

  private parseSegment<T>(value: string): T {
    try {
      return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
    } catch {
      throw new UnauthorizedException('유효하지 않은 Apple identityToken 형식입니다.');
    }
  }

  private joseToDer(signature: Buffer) {
    if (signature.length !== 64) {
      throw new UnauthorizedException('유효하지 않은 Apple identityToken 서명입니다.');
    }

    const r = this.encodeDerInteger(signature.subarray(0, 32));
    const s = this.encodeDerInteger(signature.subarray(32));
    const sequenceLength = r.length + s.length;

    return Buffer.concat([Buffer.from([0x30]), this.encodeDerLength(sequenceLength), r, s]);
  }

  private encodeDerInteger(value: Buffer) {
    let bytes = value;

    while (bytes.length > 1 && bytes[0] === 0) {
      bytes = bytes.subarray(1);
    }

    if (bytes[0] & 0x80) {
      bytes = Buffer.concat([Buffer.from([0]), bytes]);
    }

    return Buffer.concat([Buffer.from([0x02]), this.encodeDerLength(bytes.length), bytes]);
  }

  private encodeDerLength(length: number) {
    if (length < 0x80) {
      return Buffer.from([length]);
    }

    const bytes: number[] = [];
    let remaining = length;
    while (remaining > 0) {
      bytes.unshift(remaining & 0xff);
      remaining >>= 8;
    }

    return Buffer.from([0x80 | bytes.length, ...bytes]);
  }
}
