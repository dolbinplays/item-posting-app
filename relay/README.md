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

The deployed URL normally has this shape:

```text
https://item-posting-recognition-relay.YOUR-WORKERS-SUBDOMAIN.workers.dev
```

Do not place the OpenAI API key in `index.html`, `wrangler.toml`, browser storage, or this repository.

Before regular use, configure a Cloudflare rate-limiting rule for the Worker route and monitor OpenAI project spend limits. `ALLOWED_ORIGIN` restricts normal browser access, but it is not a substitute for rate limiting.

OpenAI API billing is separate from ChatGPT subscriptions. If recognition returns an exceeded-quota message, add API credits or review the OpenAI project budget before redeploying; no Worker code change is required.

## Contract

The app sends `POST` JSON with `contractVersion`, current item fields, and up to four compressed listing-photo data URLs. The relay calls the OpenAI Responses API with vision input and a strict JSON schema, then returns reviewable suggestions. Nothing is applied automatically.

The default model is `gpt-5.4-mini`. Override `OPENAI_MODEL` in Worker variables if needed.

Successful paid AI responses include token usage and a locally calculated approximate USD cost. The current estimate for `gpt-5.4-mini` uses OpenAI's published rate of `$0.75` per million input tokens and `$4.50` per million output tokens. Treat the in-app total as a convenience estimate, not a replacement for the OpenAI billing dashboard. If the configured model changes, update the Worker's local rate table or the app will show that the call could not be priced locally.

The relay also accepts a `comparable-url-v1` contract for the pricing workspace. This lookup does not call OpenAI. It fetches public metadata only from allowlisted eBay, Facebook Marketplace, Mercari, and OfferUp HTTPS URLs. Some marketplace pages hide title or price metadata behind login pages; the app keeps the pasted URL and falls back to manual entry for any missing field.

For login-walled listings, the pricing workspace can send up to eight user-selected compressed screenshots with the `comparable-screenshot-v1` contract. This calls OpenAI vision once for the batch and returns marketplace, title, price, and note fields for each screenshot. Screenshots are sent only after the user explicitly chooses them and taps **Analyze Selected Screenshots**.
