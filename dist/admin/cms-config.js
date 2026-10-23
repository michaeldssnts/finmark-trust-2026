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
  var PFOLDER = mode === 'demo' ? 'programmes' : DIR + 'content/programmes';
  var PEFOLDER = mode === 'demo' ? 'people' : DIR + 'content/people';
  var TORFOLDER = mode === 'demo' ? 'tors' : DIR + 'content/tors';
  var FEATFILE = mode === 'demo' ? 'settings/featured.json' : DIR + 'content/settings/featured.json';
  var pickItems = function (name, label, max, hint) {
    return { name: name, label: label, widget: 'relation', collection: 'knowledge', search_fields: ['title'], value_field: '{{slug}}', display_fields: ['{{title}} ({{date}})'], multiple: true, required: false, max: max, options_length: 30, hint: hint };
  };

  // Live and staging: editors sign in with GitHub. Netlify handles the GitHub sign-in (Site configuration > Access & security > OAuth).
  var backend = mode === 'demo' ? { name: 'test-repo' } : { name: 'github', repo: REPO, branch: 'main' };
  // On our own server the GitHub sign-in runs on this site (server/oauth-server.mjs); on Netlify, Netlify does it.
  if (mode === 'live' && !/\.netlify\.app$/.test(host)) { backend.base_url = location.origin; backend.auth_endpoint = 'oauth/auth'; }

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
        name: 'settings', label: 'Featured content', editor: { preview: false },
        description: 'Choose what the homepage slider and the top of the Knowledge Hub show. Leave a list empty to show the newest items automatically.',
        files: [{
          name: 'featured', label: 'Homepage slider and Knowledge Hub features', file: FEATFILE, format: 'json',
          fields: [
            pickItems('home_data', 'Homepage slider: Data slide (2 items)', 2, 'Shown under "Latest in Data & Analytics" on the first slide. Empty: the newest Data items.'),
            pickItems('home_programmes', 'Homepage slider: Programmes slide (2 items)', 2, 'Shown under "Latest in Programmes & Research" on the second slide. Empty: the newest Programmes items.'),
            pickItems('hub', 'Knowledge Hub: "Latest from FinMark Trust" (up to 3)', 3, 'The first one is shown as the large feature. Empty: the newest items.')
          ]
        }]
      },
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
          { label: 'Videos and podcasts', field: 'type', pattern: '^(Video|Podcast)$' },
          { label: 'Section: Data', field: 'section', pattern: '^(data|both)$' },
          { label: 'Section: Programmes', field: 'section', pattern: '^(programmes|both)$' }
        ],
        view_groups: [
          { label: 'Year', field: 'date', pattern: '\\d{4}' },
          { label: 'Type', field: 'type' },
          { label: 'Section', field: 'section' }
        ],
        fields: [
          { name: 'title', label: 'Title', widget: 'string' },
          { name: 'date', label: 'Publication date', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'DD MMM YYYY', time_format: false, picker_utc: true, default: '{{now}}' },
          { name: 'type', label: 'Content type', widget: 'select', options: TYPES, default: 'Report' },
          { name: 'summary', label: 'Summary', widget: 'text', required: false, hint: 'One or two sentences shown on the card and in search results.' },
          { name: 'section', label: 'Section', widget: 'select', default: 'programmes', options: [{ label: 'Programmes (programmatic research)', value: 'programmes' }, { label: 'Data (surveys, analytics, FinScope)', value: 'data' }, { label: 'Both', value: 'both' }], hint: 'Where this belongs on the site: the Knowledge Hub can be filtered to Data or Programmes, and programme research also feeds the Programmes page.' },
          { name: 'programmes', label: 'Programme', widget: 'relation', collection: 'programmes', search_fields: ['name', 'slug'], value_field: 'slug', display_fields: ['name'], multiple: true, required: false, max: 3, options_length: 40, hint: 'Optional. The programme(s) this came out of, e.g. GBL or the SADC FI Forum. Leave empty for general research.' },
          { name: 'themes', label: 'Themes', widget: 'relation', collection: 'themes', search_fields: ['name', 'slug'], value_field: 'slug', display_fields: ['name'], multiple: true, min: 1, max: 4, options_length: 40, hint: 'Pick 1–4. Archived themes still work; their items are hidden by default on the site.' },
          { name: 'countries', label: 'Countries', widget: 'select', multiple: true, required: false, options: COUNTRIES },
          { name: 'language', label: 'Language', widget: 'select', options: [{ label: 'English', value: 'en' }, { label: 'Portuguese', value: 'pt' }, { label: 'French', value: 'fr' }], default: 'en' },
          { name: 'file', label: 'File (PDF, slides, data)', widget: 'file', required: false, choose_url: true, hint: 'Upload the document, or paste its address.' },
          { name: 'link', label: 'Link', widget: 'string', required: false, hint: 'For videos, podcasts or pages hosted elsewhere (e.g. YouTube).' },
          { name: 'thumbnail', label: 'Thumbnail image', widget: 'image', required: false, hint: 'A wide banner, ideally 2114 × 744 px (about 2.85:1). The same image is used as the header of blogs and articles. Optional: without one, the site draws a branded cover.' },
          { name: 'authors', label: 'Written by (FinMark Trust staff)', widget: 'relation', collection: 'people', search_fields: ['name', 'role'], value_field: 'slug', display_fields: ['name'], multiple: true, required: false, max: 6, options_length: 60, hint: 'Pick the staff members who wrote this. Their names in the byline link to their profile, and the piece is listed on their profile page.' },
          { name: 'author', label: 'Other authors (not on staff)', widget: 'string', required: false, hint: 'Guest or partner authors, shown in the byline after the staff names, e.g. "Keneilwe Tsotsotso".' },
          { name: 'body', label: 'Full text', widget: 'markdown', required: false, buttons: ['bold', 'italic', 'link', 'heading-two', 'heading-three', 'quote', 'bulleted-list', 'numbered-list'], editor_components: [], hint: 'For blogs and articles. When filled in, the item gets its own page on the site (header image = the thumbnail above) instead of linking out. Use Heading 2 for section titles: they become the page\'s contents list.' },
          { name: 'featured', label: 'Featured (old setting)', widget: 'hidden', required: false },
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
        name: 'tors', label: 'Terms of Reference', label_singular: 'Call',
        description: 'Expressions of interest, full TORs, available positions and consultant work, listed on the Terms of Reference page. Calls move to “Closed” on their own after the closing date.',
        folder: TORFOLDER, create: true, format: 'json', extension: 'json',
        identifier_field: 'title', slug: '{{year}}-{{month}}-{{slug}}', summary: '{{title}} — closes {{closing}}',
        sortable_fields: ['title', 'closing', 'type'],
        view_filters: [{ label: 'Expressions of interest', field: 'type', pattern: 'Expression of interest' }, { label: 'Terms of reference', field: 'type', pattern: 'Terms of reference' }, { label: 'Positions', field: 'type', pattern: 'Position' }, { label: 'Consultancies', field: 'type', pattern: 'Consultancy' }],
        fields: [
          { name: 'title', label: 'Title', widget: 'string' },
          { name: 'type', label: 'Type', widget: 'select', options: ['Expression of interest', 'Terms of reference', 'Position', 'Consultancy'], default: 'Terms of reference' },
          { name: 'summary', label: 'Summary', widget: 'text', hint: 'Two or three sentences on what the work is.' },
          { name: 'programme', label: 'Programme', widget: 'relation', collection: 'programmes', search_fields: ['name', 'slug'], value_field: 'slug', display_fields: ['name'], required: false, options_length: 40, hint: 'Optional. Shown as a tag on the card.' },
          { name: 'published', label: 'Date published', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'DD MMM YYYY', time_format: false, picker_utc: true, default: '{{now}}', required: false, hint: 'The call appears on the site from this date. Set a future date to schedule it.' },
          { name: 'closing', label: 'Closing date', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'DD MMM YYYY', time_format: false, picker_utc: true, required: false, hint: 'After this date the call moves to Closed on the site by itself; nothing else to do. Leave empty for calls that stay open until filled.' },
          { name: 'document', label: 'Document (PDF)', widget: 'file', required: false, choose_url: true, hint: 'Upload the TOR or advert, or paste its address.' },
          { name: 'image', label: 'Thumbnail image', widget: 'image', required: false, choose_url: true, hint: 'Optional wide banner (2114 × 744 px). Without one, the site draws a branded cover.' },
          { name: 'contact', label: 'Contact email for submissions', widget: 'string', required: false },
          { name: 'draft', label: 'Draft (hide from the site)', widget: 'boolean', default: false, required: false }
        ]
      },
      {
        name: 'people', label: 'People', label_singular: 'Person',
        description: 'The team and trustees on the About page. Staff picked as authors on a Knowledge Hub item get it listed on their profile.',
        folder: PEFOLDER, create: true, format: 'json', extension: 'json',
        identifier_field: 'name', slug: '{{fields.slug}}', summary: '{{name}} — {{role}}',
        sortable_fields: ['name', 'order', 'group'],
        view_filters: [{ label: 'Team', field: 'group', pattern: 'team' }, { label: 'Trustees', field: 'group', pattern: 'trustee' }],
        fields: [
          { name: 'name', label: 'Name', widget: 'string' },
          { name: 'slug', label: 'Short name for links', widget: 'string', pattern: ['^[a-z0-9-]+$', 'Lowercase letters, numbers and hyphens only'], hint: 'e.g. jabulani-khumalo. Do not change once they are an author.' },
          { name: 'role', label: 'Job title', widget: 'string' },
          { name: 'group', label: 'Group', widget: 'select', options: [{ label: 'Team', value: 'team' }, { label: 'Trustee', value: 'trustee' }], default: 'team' },
          { name: 'order', label: 'Order on the About page', widget: 'number', value_type: 'int', default: 99, required: false },
          { name: 'photo', label: 'Photo', widget: 'image', required: false, choose_url: true, hint: 'Square or portrait head-and-shoulders photo.' },
          { name: 'bio', label: 'Biography', widget: 'text', required: false },
          { name: 'email', label: 'Email (optional)', widget: 'string', required: false },
          { name: 'linkedin', label: 'LinkedIn address (optional)', widget: 'string', required: false },
          { name: 'hidden', label: 'Hide from the About page (e.g. has left)', widget: 'boolean', default: false, required: false, hint: 'Their profile and authored pieces stay online.' }
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
          { name: 'colour', label: 'Colour', widget: 'color', required: false, allowInput: true, hint: 'The theme\'s colour across the site: tags, card stripes, filters and the Programmes page. Pick something clearly different from the other themes; archived themes show in grey.' },
          { name: 'description', label: 'Description', widget: 'text', required: false },
          { name: 'legacy_labels', label: 'Old site tags merged into this theme', widget: 'list', required: false }
        ]
      },
      {
        name: 'programmes', label: 'Programmes', label_singular: 'Programme',
        description: 'The programmes shown on the Programmes page and offered in the "Programme" field of each Knowledge Hub item. Set one to "Archived" when it ends; its research stays in the Knowledge Hub.',
        folder: PFOLDER, create: true, format: 'json', extension: 'json',
        identifier_field: 'name', slug: '{{fields.slug}}', summary: '{{name}} ({{pathway}}, {{status}})',
        sortable_fields: ['order', 'name', 'pathway'],
        view_groups: [{ label: 'Pathway', field: 'pathway' }],
        fields: [
          { name: 'name', label: 'Name', widget: 'string' },
          { name: 'slug', label: 'Short name for links', widget: 'string', pattern: ['^[a-z0-9-]+$', 'Lowercase letters, numbers and hyphens only'], hint: 'Do not change once items use this programme.' },
          { name: 'pathway', label: 'Pathway', widget: 'select', options: [{ label: 'SADC region', value: 'sadc' }, { label: 'South Africa', value: 'za' }, { label: 'Cross-cutting (both)', value: 'cross' }] },
          { name: 'status', label: 'Status', widget: 'select', options: [{ label: 'Current', value: 'current' }, { label: 'Archived', value: 'archived' }], default: 'current' },
          { name: 'order', label: 'Order on the Programmes page', widget: 'number', value_type: 'int', default: 50, required: false },
          { name: 'description', label: 'One-line description', widget: 'text', required: false },
          { name: 'site_url', label: 'Programme website (if it has its own)', widget: 'string', required: false },
          { name: 'theme', label: 'Main Knowledge Hub theme', widget: 'relation', collection: 'themes', search_fields: ['name', 'slug'], value_field: 'slug', display_fields: ['name'], required: false },
          { name: 'keywords', label: 'Words that suggest this programme', widget: 'list', required: false, hint: 'Used only to suggest this programme for imported items.' }
        ]
      }
    ]
  };
})();
