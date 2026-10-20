# Knowledge Hub content manager (Decap CMS)

The Knowledge Hub (`knowledge-hub/`) reads one feed, `knowledge-hub/knowledge.json`. That feed is built from the CMS content files:

```
content/themes/<slug>.json            one file per theme (current or archived)
content/knowledge/<date>-<slug>.json  one file per report, article, video, etc.
content/programmes/<slug>.json        one file per programme (SADC, South Africa, cross-cutting)
content/settings/featured.json        what the homepage slider and the Knowledge Hub feature
```

Editors never touch these files directly; they use the content manager at `/admin/`.

## Edit locally (no accounts needed)

Requires Node.js 18 or newer.

```
npm run cms
```

Then open http://localhost:8080/admin/ and click **Login**. Saves are written straight into `content/`, and the feed rebuilds within a second, so http://localhost:8080/knowledge-hub/ shows the change on refresh.

The first run imports the legacy export (`legacy/hub-inventory.json`) into `content/` automatically.

## Live and staging site (GitHub + Netlify)

1. **Create the GitHub repository** (private is fine) and add everything in this `dist` folder to it. GitHub Desktop is the easiest way: File › Add local repository › choose this folder › Publish repository.
2. **In `admin/cms-config.js`, set `REPO`** to the repository, currently `michaeldssnts/finmark-trust-2026`, and commit.
3. **Create the Netlify site:** Add new site › Import an existing project › GitHub › pick the repository. Set **Base directory** to `dist` (the site sits in a `dist` folder in the repository); the rest of the build settings come from `netlify.toml`.
4. **Turn on GitHub sign-in for editors:** in GitHub, Settings › Developer settings › OAuth Apps › New OAuth App. Homepage URL is the Netlify address; the callback URL is `https://api.netlify.com/auth/done`. Copy the Client ID and secret into Netlify: Site configuration › Access & security › OAuth › Install provider › GitHub.
5. **Give editors access:** add them to the GitHub repository with write access. They sign in at `https://<your-site>/admin/` with their GitHub account.

The site works on its `*.netlify.app` address straight away. For a custom address such as `staging.finmark.org.za`, add it in Netlify (Domain management) and in `STAGING_HOSTS` in `admin/cms-config.js`.

On the live and staging site the editor uses an editorial workflow: items are saved as drafts, reviewed, then published. Publishing commits to GitHub and Netlify rebuilds the site in about a minute.

## Other modes

Opened anywhere other than localhost, finmark.org.za or a Netlify address (for example the hosted prototype), `/admin/` runs in a **demo sandbox** seeded with the 40 newest items. Nothing is saved.

## Scripts

| Command | What it does |
|---|---|
| `npm run cms` | Local site + editor + automatic feed rebuild |
| `npm run build:knowledge` | Rebuild `knowledge-hub/knowledge.json` once |
| `npm run import:legacy` | Re-import the legacy export into `content/` (overwrites it) |

`scripts/theme-map.json` holds the theme list and how old site tags fold into the new themes. `legacy/migration-report.csv` lists every imported item with anything an editor should check.

## Section, programme and themes

Every Knowledge Hub item has three ways of being grouped:

- **Section**: Data, Programmes or Both. The Knowledge Hub's Section filter uses it.
- **Programme**: optional, up to three, picked from the Programmes collection (e.g. GBL, SADC FI Forum). The Knowledge Hub's Programme filter and the "Research" links on the Programmes page use it.
- **Themes**: 1–4 research topics, as before.

Programmes are managed in the content manager like themes: add one, or set it to Archived when it ends. `node scripts/backfill-programmes.mjs` filled in Section and Programme for items that existed before these fields; the rules live in `scripts/classify.mjs` and are also used by the importer.

## Featured content

**Featured content** in the content manager has one page with three pickers:

- **Homepage slider: Data slide**: the 2 items under "Latest in Data & Analytics".
- **Homepage slider: Programmes slide**: the 2 items under "Latest in Programmes & Research".
- **Knowledge Hub: "Latest from FinMark Trust"**: up to 3 items; the first is the large feature.

Search by title and pick. An empty slot is filled with the newest item from that section, so the homepage never goes stale.

## Blog and article pages

Give a Blog or Article a **Full text** (and optionally **Author(s)**) in the content manager and it gets its own page on the site (`knowledge-hub/post.html?id=…`) instead of linking to the old site. The **Thumbnail image** (2114 × 744) is the page's header. Use *Heading 2* for section titles: on blogs they become the "On this page" contents list. Blogs get a magazine layout; articles and media releases a newsroom layout with an at-a-glance panel.

## Theme colours

Each theme has a **Colour** (Themes collection). It is used everywhere a theme appears: Knowledge Hub tags, card stripes, the theme rail and filters, blog/article pages, the homepage slider cards and the Programmes page. Archived themes show in grey.
