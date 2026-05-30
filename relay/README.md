# Secure Photo Recognition Relay

This Cloudflare Worker keeps the OpenAI API key off the phone and out of the GitHub Pages app.

## Deploy

1. Install Wrangler and authenticate with Cloudflare.
2. Copy `wrangler.toml.example` to `wrangler.toml`.
3. Replace `ALLOWED_ORIGIN` with the exact GitHub Pages origin, such as `https://example.github.io`.
4. Store the OpenAI API key as a Worker secret:

   ```powershell
   npx wrangler secret put OPENAI_API_KEY
   ```

5. Deploy:

   ```powershell
   npx wrangler deploy
   ```

6. In the app, open an inventory item, expand **Secure photo recognition relay**, and save the deployed Worker URL.

Do not place the OpenAI API key in `index.html`, `wrangler.toml`, browser storage, or this repository.

Before regular use, configure a Cloudflare rate-limiting rule for the Worker route and monitor OpenAI project spend limits. `ALLOWED_ORIGIN` restricts normal browser access, but it is not a substitute for rate limiting.

## Contract

The app sends `POST` JSON with `contractVersion`, current item fields, and up to four compressed listing-photo data URLs. The relay calls the OpenAI Responses API with vision input and a strict JSON schema, then returns reviewable suggestions. Nothing is applied automatically.

The default model is `gpt-5.4-mini`. Override `OPENAI_MODEL` in Worker variables if needed.
