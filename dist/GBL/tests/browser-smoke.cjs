const { chromium, firefox, webkit } = require('/Users/michael/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const target = 'http://127.0.0.1:4173/index.html';
const engines = [
  ['Chrome', chromium, { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' }],
  ['Firefox', firefox, {}],
  ['WebKit', webkit, {}]
];
const viewports = [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }]
];

async function check(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, target).pathname);
    const file = path.resolve(process.cwd(), `.${pathname}`);
    if (!file.startsWith(process.cwd())) { response.writeHead(403).end(); return; }
    fs.readFile(file, (error, data) => {
      if (error) { response.writeHead(404).end(); return; }
      response.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream'});
      response.end(data);
    });
  });
  await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  let failures = 0;
  for (const [engineName, engine, launchOptions] of engines) {
    let browser;
    try {
      browser = await engine.launch({ headless: true, ...launchOptions });
    } catch (error) {
      console.log(JSON.stringify({ engine: engineName, status: 'unavailable', detail: error.message.split('\n')[0] }));
      continue;
    }

    for (const [viewportName, viewport] of viewports) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
      page.on('response', response => {
        if (response.url().startsWith('http://127.0.0.1:4173/') && response.status() >= 400 && !response.url().endsWith('/favicon.ico')) {
          errors.push(`response ${response.status()}: ${response.url()}`);
        }
      });

      try {
        await page.goto(target, { waitUntil: 'networkidle' });
        await check(await page.locator('#net').isVisible(), 'Network canvas is not visible');
        await check(await page.locator('.mark').isVisible(), 'GBL header is not visible');
        await check((await page.locator('.market-link').getAttribute('href')) === 'businesses.html', 'Top MSME button does not link directly to businesses.html');
        await check(await page.locator('.market-link').getAttribute('data-open-node') === null, 'Top MSME button still opens a pullout node');
        await page.locator('#findToggle').click();
        await page.locator('#sectionSearch').fill('learning');
        await check(await page.locator('#sectionResults button[data-go="LEARN"]').count() === 1, 'Find a section did not return Learning partners');
        await page.locator('#sectionResults button[data-go="LEARN"]').click();
        await check((await page.locator('#pTitle').textContent()).trim() === 'Learning partners', 'Section finder did not open the selected node');
        await check(await page.locator('#pPublications .publication-card').count() === 3, 'Learning partners publication list is incomplete');
        await check(await page.locator('#pPublications a[href="publications/gbl-learning-brief-3b.pdf"]').count() === 2, 'Learning Brief 3B PDF links are missing');
        await check((await page.locator('#pPublications').textContent()).includes('What does it take to help someone move from receiving a grant to building a livelihood?'), 'Learning Brief 3B title is missing');
        await check(new URL(page.url()).hash === '#learning-partners', 'Section finder did not create a shareable node URL');
        await check(await page.locator('#sectionFinderPanel').isHidden(), 'Section finder did not close after selection');
        await check(await page.evaluate(async () => {
          const response = await fetch('data/GBL-MSME-directory.xlsx');
          const workbook = XLSX.read(await response.arrayBuffer(), { type: 'array' });
          return XLSX.utils.sheet_to_json(workbook.Sheets['MSME Directory'], { defval: '' }).length === 3;
        }), 'Protected MSME Excel directory could not be read by the webpage');

        await page.evaluate(() => select('CORE', { syncMenu: false }));
        await check((await page.locator('#pFeatureLink strong').textContent()).trim() === 'Stories of change', 'Stories of change link is missing from the participant panel');
        await check((await page.locator('#pFigs .fig').nth(1).textContent()).includes('Participants in the GBL project'), 'Participant project wording is outdated');
        await page.locator('#pFeatureLink button').click();
        await check((await page.locator('#pTitle').textContent()).trim() === 'Stories of change', 'Participant stories link did not open Stories of change');

        await page.locator('.railgroup[data-shell="programme"] .railhead').click();
        if (viewportName === 'mobile') {
          const mobileMenuWidth = await page.locator('.railgroup[data-shell="programme"] .railitems').evaluate(el => el.getBoundingClientRect().width);
          const railWidth = await page.locator('#rail').evaluate(el => el.getBoundingClientRect().width);
          await check(Math.abs(mobileMenuWidth - railWidth) <= 2, 'Mobile submenu is not a single full-width menu');
        }
        await page.locator('.railitems button[data-go="HOW"]').click();
        await check(await page.locator('#panel.open').isVisible(), 'How GBL works panel did not open');
        await check((await page.locator('#pTitle').textContent()).trim() === 'How GBL works', 'Unexpected How GBL works title');
        await check((await page.locator('#pBreadcrumb').textContent()).includes('About the programme'), 'Panel breadcrumb does not show the section category');
        await check(new URL(page.url()).hash === '#how-gbl-works', 'How GBL works node URL fragment is incorrect');
        await check((await page.locator('#pLinksH').textContent()).trim() === 'Continue exploring', 'Related links heading is unclear');
        await check(await page.locator('#pChips .chip').count() > 0, 'Related links are missing from the bottom of the panel');
        await page.locator('#pInfographic').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const image = document.querySelector('#pInfographic img');
          return image && image.complete && image.naturalWidth > 0;
        });
        await check(await page.locator('#pInfographic img').evaluate(image => image.complete && image.naturalWidth > 0), 'Graduation infographic did not load');
        await check(await page.locator('#pPublications .publication-card').count() === 1, 'Programme brochure is missing');
        await check(await page.locator('#pPathways .pathway-card').count() === 2, 'Employment and entrepreneurship pathways are missing');
        await check((await page.locator('#pPathways a').getAttribute('href')) === 'businesses.html', 'Entrepreneurship pathway does not link to businesses.html');
        await check(await page.locator('#pPillars button').count() === 4, 'Four pillar links are not displayed');
        await page.locator('#pPillars button[data-go="SP"]').click();
        await check((await page.locator('#pTitle').textContent()).trim() === 'Social protection', 'Pillar link did not open its detail panel');

        await page.evaluate(() => select('IMPACT', { syncMenu: false }));
        await check(await page.locator('#pFigs .fig').count() === 7, 'Impact panel does not contain seven statistics');
        await check((await page.locator('#pFigs').textContent()).includes('1,855'), 'Updated participant total is missing');
        await check((await page.locator('#pFigs').textContent()).includes('33NYDA asset vouchers'), 'Updated NYDA asset voucher total is missing');
        await check((await page.locator('#pFigs').textContent()).includes('964Receiving personal mastery support'), 'Updated personal mastery total is missing');
        await check((await page.locator('#pFigs').textContent()).includes('797Receiving business development support'), 'Updated business development total is missing');
        await check(await page.locator('#pFigs .fig-icon svg').count() === 7, 'Impact statistic icons are incomplete');
        await page.screenshot({ path: `/tmp/gbl-impact-${engineName.toLowerCase()}-${viewportName}.png`, fullPage: true });

        await page.evaluate(() => select('COACH', { syncMenu: false }));
        await check((await page.locator('#pTitle').textContent()).trim() === 'Their coach and frontline support', 'Coach page title was not updated');
        await check(await page.locator('#pCoaches .coach-card').count() === 10, 'Linkages Facilitator profiles are incomplete');
        await check(await page.locator('#pCoaches .coach-profile').count() === 10, 'Linkages Facilitator biographies are incomplete');
        await check((await page.locator('#pCoaches .coach-card').nth(8).locator('h4').textContent()).trim() === 'Xolile (Vusi) Stuurman', 'Xolile Stuurman profile name is incorrect');
        await check((await page.locator('#pCoaches').textContent()).includes('virtual classes and work-from-home activities'), 'Updated Xolile profile is missing');
        await check((await page.locator('#pCoaches .cdp-section h3').textContent()).trim() === 'Community Development Practitioners (CDPs)', 'CDP section is missing');
        await check(!(await page.locator('#pCoaches').textContent()).includes('SASSA Community Development Practitioners'), 'SASSA has not been removed from the CDP title');
        await check(!(await page.locator('#pCoaches').textContent()).includes('several hundred'), 'Outdated CDP network copy is still displayed');
        await check(await page.locator('#pCoaches .cdp-province-filter option').count() === 4, 'CDP province filter is incomplete');
        await check(await page.locator('#pCoaches .cdp-card').count() === 0, 'CDP profiles should remain empty until supplied');
        await page.locator('#pCoaches .cdp-province-filter').selectOption('Gauteng');
        await check(!(await page.locator('#pCoaches').textContent()).includes('No CDP profiles'), 'CDP empty-state copy is still displayed');
        await page.locator('#panel').evaluate(panel => { panel.scrollTop = panel.scrollHeight; });
        await page.locator('#pCta').click();
        await check((await page.locator('#pTitle').textContent()).trim() === 'How GBL works', 'Explore the four pillars did not open How GBL works');
        await check(await page.locator('#panel').evaluate(panel => panel.scrollTop === 0), 'Pullout did not reset to the top');

        await page.evaluate(() => select('IMPL', { syncMenu: false }));
        await check(await page.locator('#pTeam .team-card').count() === 1, 'Partnership contact card is missing');
        await check(await page.locator('#pTeam a[href="mailto:matsiedim@sassa.gov.za"]').count() === 1, 'Matsiedi email link is missing');
        await page.locator('#pTeam').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => {
          const image = document.querySelector('#pTeam img');
          return image && image.complete && image.naturalWidth > 0;
        });
        await check(await page.locator('#pTeam img').evaluate(image => image.complete && image.naturalWidth > 0), 'Matsiedi portrait did not load');

        await page.evaluate(() => select('STORIES', { syncMenu: false }));
        await check(await page.locator('#pImpactStories .impact-story-card').count() === 21, 'Participant impact stories are incomplete');
        await check((await page.locator('#pImpactStories .impact-story-card').first().locator('summary strong').textContent()).trim() === 'Participant 1047', 'Participant impact story ID is missing');
        await check(!(await page.locator('#pImpactStories').textContent()).includes('Amanda Novukela'), 'A participant name is still visible in the impact stories');
        await check(!(await page.locator('#pImpactStories').textContent()).includes('Community Safety and Liaison Department'), 'An employer name is still visible in the impact stories');
        await check(!(await page.locator('#pImpactStories').textContent()).includes('Nzawukele Hair Salon'), 'A participant business name is still visible in the impact stories');
        await check((await page.locator('#pImpactStories').textContent()).includes('substance abuse'), 'The sensitive substance-abuse wording was not updated');
        await check(!/\b(?:she|her|herself|he|him|his)\b/i.test(await page.locator('#pImpactStories').textContent()), 'Gendered participant pronouns are still visible in the impact stories');
        await check((await page.locator('#pImpactStories .impact-story-meta').first().textContent()).includes('Nokuthula Ngcobo · KwaMashu, KwaZulu-Natal'), 'Coach name and province were not preserved');
        await page.locator('[data-story-filter="province"]').selectOption('Gauteng');
        await check(await page.locator('#pImpactStories .impact-story-card:visible').count() === 3, 'Province filter did not return the three Gauteng stories');
        await page.locator('[data-story-filter="pathway"]').selectOption('Entrepreneurship');
        await check(await page.locator('#pImpactStories .impact-story-card:visible').count() === 2, 'Combined story filters did not return the two Gauteng entrepreneurship stories');
        await page.locator('.story-filter-reset').click();
        await check(await page.locator('#pImpactStories .impact-story-card:visible').count() === 21, 'Clear filters did not restore all stories');
        await check(await page.evaluate(() => Boolean(document.querySelector('#pImpactStories').compareDocumentPosition(document.querySelector('#pStories')) & Node.DOCUMENT_POSITION_FOLLOWING)), 'Participant videos are not below the impact stories');
        await page.locator('#pImpactStories .impact-story-card').first().locator('summary').click();
        await check(await page.locator('#pImpactStories .impact-story-card').first().locator('.impact-story-copy').isVisible(), 'Impact story did not expand');

        await page.evaluate(() => select('LATEST', { syncMenu: false }));
        await check((await page.locator('#pTitle').textContent()).trim() === 'Latest from GBL', 'Latest from GBL node did not open');
        await check(await page.locator('#pUpdates .update-card').count() === 5, 'Latest from GBL does not contain all five updates');
        await check(await page.locator('#pUpdates .update-card a').count() === 4, 'Latest from GBL linked update count is incorrect');
        await check(await page.locator('#pUpdates .update-card.upcoming').count() === 1, 'Upcoming DSD Roundtable update is missing');
        await page.evaluate(() => history.back());
        await page.waitForFunction(() => location.hash === '#stories-of-change');
        await check((await page.locator('#pTitle').textContent()).trim() === 'Stories of change', 'Browser Back did not restore the previous node');
        await page.evaluate(() => history.forward());
        await page.waitForFunction(() => location.hash === '#latest-from-gbl');
        await check((await page.locator('#pTitle').textContent()).trim() === 'Latest from GBL', 'Browser Forward did not restore the next node');

        await page.evaluate(() => select('MSME', { syncMenu: false }));
        await check(await page.locator('#pMarketplace .csv-status').count() === 0, 'Excel maintained label is still visible');
        await check((await page.locator('#pTitle').textContent()).trim() === 'View and fund participant-run MSME businesses', 'MSME page title is outdated');
        await check(await page.locator('#pMarketplace .funders-wall li').count() === 4, 'Approved Funders Wall entries are incomplete');

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        await check(overflow <= 1, `Page has ${overflow}px horizontal overflow`);
        const panelBox = await page.locator('#panel').boundingBox();
        await check(panelBox && panelBox.width <= viewport.width + 1, 'Pullout panel exceeds the viewport width');

        await page.screenshot({ path: `/tmp/gbl-${engineName.toLowerCase()}-${viewportName}.png`, fullPage: true });
        await page.goto('http://127.0.0.1:4173/businesses.html', { waitUntil: 'networkidle' });
        await check((await page.locator('h1').textContent()).trim() === 'View and fund participant-run MSME businesses', 'Business directory heading is outdated');
        await check((await page.locator('#directoryStatus').textContent()).trim() === '3 enterprise profiles currently listed', 'Business directory profile count copy is outdated');
        await check((await page.locator('#businessList').textContent()).includes('Hlengiwe Makhanya'), 'MSME participant names should remain visible');
        await check(await page.locator('#fundersList li').count() === 4, 'Business directory Funders Wall is incomplete');
        await check(fs.statSync(path.resolve(process.cwd(), 'GBL-network-email.html')).size < 5000000, 'Shareable HTML exceeds the 5 MB email limit');
        await page.goto('http://127.0.0.1:4173/GBL-network-email.html', { waitUntil: 'networkidle' });
        await check(await page.locator('#net').isVisible(), 'Shareable HTML network canvas is not visible');
        await page.evaluate(() => select('LEARN', { syncMenu: false }));
        await check(await page.locator('#pPublications .publication-card').count() === 3, 'Shareable HTML is missing a learning publication');
        await check(await page.locator('#pPublications .publication-link').count() === 0, 'Shareable HTML still contains PDF links');
        await check(errors.length === 0, errors.join(' | '));
        console.log(JSON.stringify({ engine: engineName, viewport: viewportName, status: 'passed' }));
      } catch (error) {
        failures += 1;
        console.log(JSON.stringify({ engine: engineName, viewport: viewportName, status: 'failed', detail: error.message }));
      } finally {
        await page.close();
      }
    }
    await browser.close();
  }
  await new Promise(resolve => server.close(resolve));
  process.exitCode = failures ? 1 : 0;
})();
