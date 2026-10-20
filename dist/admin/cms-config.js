/*
 * Decap CMS configuration for the FinMark Trust Knowledge Hub.
 * One source of truth for all three modes:
 *   - Local editing  (localhost): files are read and written in this folder via `npx decap-server`.
 *   - Live / staging (finmark.org.za, *.netlify.app or STAGING_HOSTS): editors sign in with GitHub; each save is a commit and Netlify rebuilds the site.
 *   - Demo           (anywhere else, e.g. the hosted prototype): in-browser sandbox; nothing is saved.
 */
(function () {
  // ---- Set these two once the GitHub repository and Netlify site exist ----
  var REPO = 'michaeldssnts/finmark-trust-2026';
  var SITE_DIR = 'dist/';                               // where the site sits inside the repository ('' if at the top level)
  var STAGING_HOSTS = [];                               // e.g. ['staging.finmark.org.za'] (any *.netlify.app address already works)
  // -------------------------------------------------------------------------
  var host = location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1';
  var isLive = /(^|\.)finmark\.org\.za$/.test(host) || /\.netlify\.app$/.test(host) || STAGING_HOSTS.indexOf(host) > -1;
  var mode = isLocal ? 'local' : isLive ? 'live' : 'demo';

  var TYPES = ['Report', 'Pocket guide', 'Presentation', 'Dashboard', 'Article', 'Blog', 'Media release', 'Video', 'Podcast', 'Interview', 'Infographic'];
  var COUNTRIES = [
    ['Angola', 'AGO'], ['Botswana', 'BWA'], ['Comoros', 'COM'], ['DR Congo', 'COD'], ['Eswatini', 'SWZ'], ['Lesotho', 'LSO'], ['Madagascar', 'MDG'],
    ['Malawi', 'MWI'], ['Mauritius', 'MUS'], ['Mozambique', 'MOZ'], ['Namibia', 'NAM'], ['Seychelles', 'SYC'], ['South Africa', 'ZAF'],
    ['Tanzania', 'TZA'], ['Zambia', 'ZMB'], ['Zimbabwe', 'ZWE'], ['SADC region', 'SADC'],
    ['Benin', 'BEN'], ['Burkina Faso', 'BFA'], ['Cambodia', 'KHM'], ['Cameroon', 'CMR'], ['Gambia', 'GMB'], ['Ghana', 'GHA'], ['Haiti', 'HTI'],
    ['Kenya', 'KEN'], ['Laos', 'LAO'], ['Mexico', 'MEX'], ['Myanmar', 'MMR'], ['Nepal', 'NPL'], ['Nigeria', 'NGA'], ['Rwanda', 'RWA'],
    ['Thailand', 'THA'], ['Togo', 'TGO'], ['Uganda', 'UGA']
  ].map(function (c) { return { label: c[0], value: c[1] }; });

  // Demo sandbox only supports single-level folders.
  // Live: paths are inside the GitHub repository (the site is in SITE_DIR). Local: decap-server already runs inside the site folder.
  var DIR = mode === 'live' ? SITE_DIR : '';
  var KFOLDER = mode === 'demo' ? 'knowledge' : DIR + 'content/knowledge';
  var TFOLDER = mode === 'demo' ? 'themes' : DIR + 'content/themes';

  // Live and staging: editors sign in with GitHub. Netlify handles the GitHub sign-in (Site configuration > Access & security > OAuth).
  var backend = mode === 'demo' ? { name: 'test-repo' } : { name: 'github', repo: REPO, branch: 'main' };

  window.FMT_CMS_MODE = mode;
  window.FMT_CMS_CONFIG = {
    load_config_file: false,
    backend: backend,
    local_backend: mode === 'local',
    publish_mode: mode === 'live' ? 'editorial_workflow' : undefined,
    site_url: mode === 'demo' ? 'https://finmark.org.za' : location.origin,
    display_url: 'https://finmark.org.za',
    logo_url: '/finmark-trust-official-logo.svg',
    media_folder: mode === 'demo' ? 'uploads' : DIR + 'uploads/knowledge',
    public_folder: '/uploads/knowledge',
    slug: { encoding: 'ascii', clean_accents: true },
    collections: [
      {
        name: 'knowledge', label: 'Knowledge Hub', label_singular: 'Knowledge item',
        description: 'Reports, articles, blogs, videos and other pieces shown in the Knowledge Hub. Use “Needs review” to check items brought over from the old site.',
        folder: KFOLDER, create: true, format: 'json', extension: 'json',
        slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
        identifier_field: 'title',
        summary: '{{date}} · {{type}} · {{title}}',
        sortable_fields: ['date', 'title', 'type'],
        view_filters: [
          { label: 'Needs review', field: 'review', pattern: true },
          { label: 'Featured', field: 'featured', pattern: true },
          { label: 'Drafts (hidden from site)', field: 'draft', pattern: true },
          { label: 'Reports', field: 'type', pattern: 'Report' },
          { label: 'Blogs and articles', field: 'type', pattern: '^(Blog|Article)$' },
          { label: 'Videos and podcasts', field: 'type', pattern: '^(Video|Podcast)$' }
        ],
        view_groups: [
          { label: 'Year', field: 'date', pattern: '\\d{4}' },
          { label: 'Type', field: 'type' }
        ],
        fields: [
          { name: 'title', label: 'Title', widget: 'string' },
          { name: 'date', label: 'Publication date', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'DD MMM YYYY', time_format: false, picker_utc: true, default: '{{now}}' },
          { name: 'type', label: 'Content type', widget: 'select', options: TYPES, default: 'Report' },
          { name: 'summary', label: 'Summary', widget: 'text', required: false, hint: 'One or two sentences shown on the card and in search results.' },
          { name: 'themes', label: 'Themes', widget: 'relation', collection: 'themes', search_fields: ['name', 'slug'], value_field: 'slug', display_fields: ['name'], multiple: true, min: 1, max: 4, options_length: 40, hint: 'Pick 1–4. Archived themes still work; their items are hidden by default on the site.' },
          { name: 'countries', label: 'Countries', widget: 'select', multiple: true, required: false, options: COUNTRIES },
          { name: 'language', label: 'Language', widget: 'select', options: [{ label: 'English', value: 'en' }, { label: 'Portuguese', value: 'pt' }, { label: 'French', value: 'fr' }], default: 'en' },
          { name: 'file', label: 'File (PDF, slides, data)', widget: 'file', required: false, choose_url: true, hint: 'Upload the document, or paste its address.' },
          { name: 'link', label: 'Link', widget: 'string', required: false, hint: 'For videos, podcasts or pages hosted elsewhere (e.g. YouTube).' },
          { name: 'thumbnail', label: 'Thumbnail image', widget: 'image', required: false, hint: 'A wide banner, ideally 2114 × 744 px (about 2.85:1). The same image is used as the header of blogs and articles. Optional: without one, the site draws a branded cover.' },
          { name: 'body', label: 'Full text', widget: 'markdown', required: false, hint: 'For blogs and articles published on the site itself.' },
          { name: 'featured', label: 'Feature at the top of the Knowledge Hub', widget: 'boolean', default: false, required: false },
          { name: 'draft', label: 'Draft (hide from the site)', widget: 'boolean', default: false, required: false },
          { name: 'review', label: 'Needs editor review', widget: 'boolean', default: false, required: false, hint: 'Set on items imported from the old site whose themes were suggested automatically. Untick once checked.' },
          { name: 'legacy_url', label: 'Old site address', widget: 'string', required: false, hint: 'Used to redirect the old URL to this item.' },
          { name: 'legacy_type', label: 'Old site type', widget: 'hidden', required: false },
          { name: 'legacy_thumbnail', label: 'Old site thumbnail', widget: 'hidden', required: false },
          { name: 'legacy_id', label: 'Old site record ID', widget: 'hidden', required: false },
          { name: 'legacy_slug', label: 'Old site slug', widget: 'hidden', required: false }
        ]
      },
      {
        name: 'themes', label: 'Themes', label_singular: 'Theme',
        description: 'The topics used to filter the Knowledge Hub. Set a theme to “Archived” to retire it: its items stay searchable but are hidden by default.',
        folder: TFOLDER, create: true, format: 'json', extension: 'json',
        identifier_field: 'name', slug: '{{fields.slug}}', summary: '{{name}} ({{status}})',
        sortable_fields: ['name', 'status'],
        view_filters: [{ label: 'Current', field: 'status', pattern: 'current' }, { label: 'Archived', field: 'status', pattern: 'archived' }],
        fields: [
          { name: 'name', label: 'Name', widget: 'string' },
          { name: 'slug', label: 'Short name for links', widget: 'string', pattern: ['^[a-z0-9-]+$', 'Lowercase letters, numbers and hyphens only'], hint: 'Do not change once items use this theme.' },
          { name: 'status', label: 'Status', widget: 'select', options: [{ label: 'Current', value: 'current' }, { label: 'Archived', value: 'archived' }], default: 'current' },
          { name: 'pathway', label: 'Pathway', widget: 'select', options: [{ label: 'Data & Analytics', value: 'data' }, { label: 'Programmes & Research', value: 'programmes' }] },
          { name: 'description', label: 'Description', widget: 'text', required: false },
          { name: 'legacy_labels', label: 'Old site tags merged into this theme', widget: 'list', required: false }
        ]
      }
    ]
  };
})();
