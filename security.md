# Security Specification - Vape Mart UAE

## Compliance & Legal Policy
- **Age Restriction Enforcement**: UAE Federal Law mandate (21+ only). Clear disclaimers and verification warnings across Header, Footer, and checkout triggers.
- **Client Credential Protection**: Zero secrets or credentials embedded in client bundles.
- **Input Sanitization**: Search inputs and verification scratch codes sanitized client-side against XSS injection before querying.

## Transport & Packaging
- **Content Security**: HTTPS forced across all asset delivery networks.
- **Tamper Prevention**: Anti-counterfeit verification guidance and ESMA tax stamp authenticity checks.
