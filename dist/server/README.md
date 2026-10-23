# Running the website on our own server

These files let the website run on an Ubuntu server with nginx, as well as on Netlify.
Netlify ignores them. The step-by-step guide is the "New website server setup" doc.

After setup, everything is one command on the server:

| Command | What it does |
| --- | --- |
| `sudo finmark check` | Shows whether everything is working |
| `sudo finmark update` | Publishes the latest version from GitHub now (it also does this by itself every 2 minutes) |
| `sudo finmark rollback` | Goes back to the previous version of the site |
| `sudo finmark ssl` | Gets or renews the HTTPS certificate |
| `sudo finmark cms-login` | Saves the GitHub sign-in details for the content manager |
| `sudo finmark golive` | Adds finmark.org.za and www.finmark.org.za (after the DNS change) |

`redirects.conf` is generated on every build by `scripts/build-redirects.mjs`; don't edit it.
