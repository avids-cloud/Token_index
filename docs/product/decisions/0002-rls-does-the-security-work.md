# 2. Database rules do the security work; the public key ships by design

Date: 2026-07-18
Status: accepted

## Decision

The browser talks to Supabase directly with the public anon key. Row-level
security rules inside the database decide who can read and write what.
There is no application server.

## Why

A static site with database-enforced rules is simpler, cheaper, and has
less to break than running and securing our own server. The anon key is
public by design; the rules are the lock, not the key.

## Consequences

Every new table or view must get security rules before it gets data. The
service role key never appears in site code or client-side settings. The
security rules have their own tests (`test/rls.test.ts`), which warn
loudly when they cannot run for lack of credentials.
