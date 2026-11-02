# Launching the Coming Soon page (design A · Corniche)

`launch/` is the **production** site for ibnhamidochicago.com until the full site opens. It is the A · Corniche Coming Soon page, made public-ready:

| Mockup (`a-corniche/coming-soon.html`) | Production (`launch/`) |
|---|---|
| `noindex`, mockup tags on photos | Indexable: canonical URL, Open Graph image, `Restaurant` JSON-LD, sitemap and robots.txt |
| Waitlist button does nothing; email **and** SMS fields | Real **Mailchimp** form, **email only**. The SMS field stays hidden until SMS terms exist. |
| Review cards with `[OWNER: …]` quotes | Removed until the owner supplies real reviews. The Astoria press line stays. |
| "Halal [OWNER CONFIRM]" chip | Removed until confirmed |
| Striped map placeholder | Live Google Map of 14035 LaGrange Rd |
| Shared files from `../shared/` | Self-contained (fonts, logo, favicon, photos in `launch/`), so the folder deploys on its own |
| — | `privacy.html` (Privacy Policy), `404.html` |

## Safety net: the launch check

`launch/check.mjs` runs as the Vercel build command. **A production deploy fails** while any of these remain:
- a `[PLACEHOLDER]`;
- a mockup photo tag;
- the AI concept photo in `img/hero.jpg` or `img/og.jpg`.

Run it yourself with `cd launch && node check.mjs`. Today it lists:

| To finish | Where | Who |
|---|---|---|
| `[OPENING DATE]` (2×) | index.html | Owner |
| `[PHONE NUMBER]` | index.html (structured data) | Owner. If there's no phone yet, delete the `"telephone"` line. |
| `[INSTAGRAM_URL]`, `[@HANDLE]` | index.html | Owner |
| `[JOBS EMAIL]` | index.html (Now hiring) | Owner. Or delete the Now hiring card. |
| `[MAILCHIMP_FORM_ACTION]`, `[MAILCHIMP_HONEYPOT_NAME]` | index.html (waitlist form) | Omar (steps below) |
| `[EFFECTIVE DATE]`, `[EMAIL]`, 2 × `[OWNER: legal text]` | privacy.html | Owner / their lawyer |
| `img/hero.jpg` is the AI concept photo (CS-01) | Hero | Owner photo: portrait 4:5, at least 1024 × 1280 |
| `img/og.jpg` is the AI concept image (OG-01) | Social share | 1200 × 630 image from an owner photo |

To swap a photo, replace the file with the same name. No HTML changes are needed.

The owner's answers come in through Part 1 of the [owner content doc](https://claude.ai/artifact/5v96YvmjWBPvCFQ7mW1mMR).

## Mailchimp waitlist (about 5 minutes)

1. In Mailchimp, go to **Audience → Signup forms → Embedded forms**.
2. In the generated code, find `<form action="https://….list-manage.com/subscribe/post?u=…&amp;id=…"`. Copy that URL into `launch/index.html` in place of `[MAILCHIMP_FORM_ACTION]`.
3. In the same code, find the hidden bot-trap input named like `b_1a2b3c…_4d5e6f…`. Copy its name in place of `[MAILCHIMP_HONEYPOT_NAME]`.
4. Optional: in **Audience → Settings → Audience name and defaults**, turn on double opt-in.

After submitting, people land on Mailchimp's own "almost finished" page.

**Prefer Klaviyo?** Swap the `<form class="wl">` for Klaviyo's embed. Keep the email-only field and the Privacy Policy sentence, and say so; the check still guards the rest.

## Deploy on Vercel

1. Go to vercel.com → **Add New… → Project** and import `omrm-dev/ibn-hamido-website`.
2. Set **Root Directory** to `launch`. Set **Framework Preset** to **Other**, and leave the build and output settings alone (they come from `launch/vercel.json`).
3. Click **Deploy**. While placeholders remain, the production build **fails on purpose** and its log lists what's left.
4. **Preview with placeholders:** push to any branch other than `main`, with the environment variable `ALLOW_PLACEHOLDERS=1` set for **Preview** only. Vercel adds `noindex` to preview URLs automatically.
5. **Domain:** go to **Settings → Domains** and add `ibnhamidochicago.com` and `www.ibnhamidochicago.com`. Then create the DNS records Vercel shows at the domain registrar.

The full-site demo (repo root, `a-corniche/`) can be a **second** Vercel project with Root Directory `.`. It's `noindex` and must never get the real domain.
