# Research: More algorithms

## Decision: Three additive waves, classical set unchanged

**Decision**: Ship ML-DSA-65, then ML-DSA-44 and ML-DSA-87, then names
for the six content-encryption algorithms. Leave the published classical
set in place.

**Rationale**: HMAC, RSA, ECDSA, PSS, EdDSA, ES256K, Ed448, X448, and
the current JWE key-management set are already published. See
[llm-docs/runtime-compatibility.md](../../llm-docs/runtime-compatibility.md)
and [llm-docs/api.md](../../llm-docs/api.md). The registered gap is
ML-DSA (RFC 9964). Content encryption already works as a free string in
`src/vendors/jwe/jwe.ts`; naming it is a later, separate slice.

**Alternatives considered**: One wave for all three ML-DSA sets (a
failure in the largest set would block the useful middle set). Leading
with content-encryption names (no new caller capability). Replacing
`jose` (no benefit; 6.2.3 already knows the ML-DSA identifiers).

## Decision: ML-DSA-65 first

**Decision**: Wave 1 implements only ML-DSA-65.

**Rationale**: RFC 9964 registers three optional parameter sets. One set
is enough to ship. The middle set is the usual single choice when a
profile picks one. The other two reuse the same AKP path once it exists.

**Alternatives considered**: ML-DSA-44 first (smaller, but a weaker
default to teach). All three at once (see above).

## Decision: AKP JWK, seed private key, empty context

**Decision**: New signatures use AKP JWKs. `alg` is required. `pub` is
the public key. `priv` is present only on private keys and is the
32-byte seed. The ML-DSA context string is empty. No PEM encoding is
added.

**Rationale**: Those are the JOSE rules in RFC 9964 sections 3, 4, and 5.
The product manual already tells callers to prefer JWK for cross-runtime
keys ([llm-docs/portable-algorithms.md](../../llm-docs/portable-algorithms.md)).
PEM for this key type is not defined there.

**Alternatives considered**: Expanded FIPS private keys (RFC 9964
forbids that representation). A server-only PEM export (breaks the
runtime promise and is a second key format).

## Decision: jose where it works, lazy noble fallback elsewhere

**Decision**: Keep `jose` at 6.2.3. Use it when the runtime can import
an AKP key for ML-DSA. When it cannot, dynamically import
`@noble/post-quantum/ml-dsa.js` from `src/vendors/jwt/portable-ml-dsa.ts`.
Do not import that module from the package entry.

**Rationale**: ML-DSA support in `jose` arrived before 6.2.0, so 6.2.3
already has the identifiers, but it delegates to Web Crypto. Workers
and browsers do not all expose ML-DSA without extra flags. A lazy pure
JavaScript fallback matches the portable-curve pattern and keeps
`node:crypto` off the import path. A `jose` bump is a separate review.

**Alternatives considered**: Require Web Crypto ML-DSA and document the
other environments as unsupported (fails the runtime promise in wave 1).
Upgrade `jose` inside the algorithm wave (mixes a dependency bump with
new behavior). Static import of the post-quantum package (adds work at
import for callers who never use ML-DSA).

## Decision: Content-encryption names do not narrow `enc`

**Decision**: Wave 3 exports `A128GCM`, `A192GCM`, `A256GCM`,
`A128CBC-HS256`, `A192CBC-HS384`, and `A256CBC-HS512`.
`IEncryptJweOptions.enc` stays `string`.

**Rationale**: Those six are the RFC 7518 content-encryption set, and
`encryptJwe` already forwards `enc` to `jose`. An allowlist or a
narrower type would reject a label the library already accepts, which
the spec forbids.

**Alternatives considered**: A union type of only the six (a compile-time
break for any other string). A runtime allowlist (a behavior break).

## Decision: Leave unfinished registrations out

**Decision**: Do not implement ML-KEM, HPKE draft `alg` values, SLH-DSA,
Falcon, or HashML-DSA.

**Rationale**: RFC 9964 section 7.2 leaves HashML-DSA unregistered. The
ML-KEM document in circulation is not a finished JOSE registration
(draft-ietf-jose-pqc-kem has moved toward COSE). HPKE identifiers in
the IANA JOSE registry still cite an Internet-Draft. Shipping them
would publish names that can still change. Constitution principle V
forbids weakening, so `none` stays unsupported.

**Alternatives considered**: Ship ML-KEM under provisional names (callers
would depend on names that are not stable). Bundle every algorithm
`@noble/post-quantum` exports (adds unregistered signatures).
