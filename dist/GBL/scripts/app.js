/* ============================================================
   1. CONTENT
   ============================================================ */
const IMPACT_DATA = window.GBL_IMPACT || {
  participantsProfiled:'1,855',
  employmentPathways:'232',
  operatingBusinesses:'320',
  nydaAssetVouchers:'33',
  personalMastery:'964',
  technicalSkillsTraining:'586',
  businessDevelopmentTraining:'797'
};
const IMPACT_STORIES = window.GBL_IMPACT_STORIES || [];

const FIG_ICONS = Object.freeze({
  participants:'<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="8" r="3.25"/><path d="M5.5 19c.7-3.2 3-5 6.5-5s5.8 1.8 6.5 5"/></svg>',
  employment:'<svg viewBox="0 0 24 24" focusable="false"><rect x="3.5" y="7.5" width="17" height="11" rx="2"/><path d="M9 7.5V5.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3v1.7M3.8 11.5c2.5 1.3 5.2 2 8.2 2s5.7-.7 8.2-2M10.2 13.5h3.6"/></svg>',
  business:'<svg viewBox="0 0 24 24" focusable="false"><path d="M4 10.2v9.3h16v-9.3M3 10.2h18l-2.1-5.7H5.1L3 10.2Z"/><path d="M7.5 10.2v2.1M12 10.2v2.1M16.5 10.2v2.1M8 19.5v-5h8v5"/></svg>',
  voucher:'<svg viewBox="0 0 24 24" focusable="false"><path d="M4 6.5h16v3a2.5 2.5 0 0 0 0 5v3H4v-3a2.5 2.5 0 0 0 0-5v-3Z"/><path d="M12 8.5v1M12 12v1M12 15.5v1"/></svg>',
  mastery:'<svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="8.2"/><path d="m12 7.5 1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5L12 7.5Z"/></svg>',
  technical:'<svg viewBox="0 0 24 24" focusable="false"><path d="m13.8 5.1 5.1 5.1M15.9 3l5.1 5.1-2.2 2.2-5.1-5.1L15.9 3ZM12.2 10.8 5 18l-2 3 3-2 7.2-7.2"/><path d="m9.8 7.8 6.4 6.4"/></svg>',
  development:'<svg viewBox="0 0 24 24" focusable="false"><path d="M4 19.5h16M6.5 17v-4.2h3V17M10.5 17V9.5h3V17M14.5 17V6h3v11M5.5 9.5l4-3 3 1.5 5-4"/></svg>'
});

const NODES = {

CORE:{shell:'core',label:['A participant'],
  tag:'The centre of the network',
  title:'A participant',
  role:'It takes an ecosystem to build a livelihood',
  body:[
    'Every participant’s journey is different. Some need skills to enter the labour market. Others need equipment, business support or access to customers. Many need help navigating personal, financial and structural barriers along the way.',
    'Generating Better Livelihoods for Grant Recipients (GBL) brings together government, implementing partners, service providers, community organisations and economic opportunities around each participant’s needs and aspirations.',
    'Explore the network to see how these connections work, with the participant at the centre.'
  ],
  featureLink:{
    label:'Stories of change',
    description:'Read participant journeys from across the programme.',
    go:'STORIES'
  },
  figs:[['18–35','Age range'],['5,000','Participants in the GBL project'],['7','Sites across three provinces']],
  go:'HOW',
  cta:'Learn about the programme'},

COACH:{shell:'journey',rMul:1.3,label:['Their coach','& frontline support'],
  tag:'Participant journey',
  title:'Their coach and frontline support',
  role:'Linkages Facilitators: Supporting each participant’s journey',
  body:[
    'Linkages Facilitators work directly with participants to understand their circumstances, identify barriers and build practical plans towards sustainable livelihoods.',
    'Through four core functions – profiling, linking, supporting and sustaining – they help participants recognise their strengths and aspirations, access relevant services and economic opportunities, and receive ongoing guidance as they work towards their goals.',
    'This coordinated, personalised support helps participants put their plans into action, build on their progress and strengthen their pathways to sustainable livelihoods.'
  ],
  figs:[[IMPACT_DATA.participantsProfiled,'Participants profiled']],
  coaches:[
    {name:'Nompumelelo Zulu',site:'Mthwalume, KwaZulu-Natal',email:'mthwalume@finmark.org.za',image:'images/coaches/nompumelelo-zulu.jpg',profile:'Nompumelelo has a strong enterprise and skills-development focus, helping participants move from business aspirations towards practical training, company registration and preparation to start their businesses.'},
    {name:'Nelisiwe Blose',site:'KwaMashu, KwaZulu-Natal',email:'kwamashu@finmark.org.za',image:'images/coaches/nelisiwe-blose.jpg',profile:'Nelisiwe provides practical, opportunity-focused coaching, helping participants prepare for employment while connecting aspiring entrepreneurs to funding, registration and skills-development support.'},
    {name:'Nokuthula Ngcobo',site:'KwaMashu, KwaZulu-Natal',email:'kwamashu2@finmark.org.za',image:'images/coaches/nokuthula-ngcobo.jpg',profile:'Nokuthula brings a holistic, persistent approach to coaching, staying closely engaged with participants while helping them navigate livelihood opportunities and immediate social and household challenges.'},
    {name:'Philile Dube',site:'Madadeni, KwaZulu-Natal',email:'madadeni@finmark.org.za',image:'images/coaches/philile-dube.jpg',profile:'Philile uses adaptive, highly individualised support around each participant’s chosen pathway, drawing on community networks to overcome barriers as they arise.'},
    {name:'Zanele Mpungose',site:'Madadeni, KwaZulu-Natal',email:'madadeni2@finmark.org.za',image:'images/coaches/zanele-mpungose.jpg',profile:'Zanele is a Linkages Facilitator who empowers aspiring entrepreneurs through practical guidance, peer learning and business development support. She helps participants navigate funding opportunities, business registration and the essential steps to establishing sustainable businesses.'},
    {name:'Shennin Cornellissen',site:'Oppermansdorp, Free State',email:'oppermans@finmark.org.za',image:'images/coaches/shennin-cornellissen.jpg',profile:'Shennin demonstrates a strong understanding of participants’ economic realities, recognising how household pressures, debt, education and limited local opportunities shape the livelihood choices people can make.'},
    {name:'Rethabile Sebakamotse',site:'Virginia, Free State',email:'virginia@finmark.org.za',image:'images/coaches/rethabile-sebakamotse.jpg',profile:'Rethabile’s strength is keeping participants engaged and opportunity-ready through regular check-ins, group sessions and practical job-search support, despite limited long-term opportunities.'},
    {name:'Thabiso Sekhejane',site:'Meloding, Free State',email:'meloding@finmark.org.za',image:'images/coaches/thabiso-sekhejane.jpg',profile:'Thabiso brings a realistic, critical eye to the barriers participants face, particularly where weak employment linkages and slow funding processes prevent progress. He works to align support programmes from all stakeholders with the graduation criteria, making graduation a well-planned, seamless journey.'},
    {name:'Xolile (Vusi) Stuurman',site:'Sebokeng, Gauteng',email:'sebokeng@finmark.org.za',image:'images/coaches/xolile-stuurman.jpg',profile:'Xolile brings a hands-on, problem-solving approach, providing participants with practical support ranging from applications and interview preparation to internet access and spaces for virtual interviews, virtual classes and work-from-home activities.'},
    {name:'Seipati Mosebetsi',site:'Randfontein, Gauteng',email:'randfontein@finmark.org.za',image:'images/coaches/seipati-mosebetsi.jpg',profile:'Seipati provides consistent, relationship-based support, staying in regular contact with participants and helping them adapt their livelihood plans when businesses or employment opportunities do not provide sufficient income.'}
  ],
  cdpProvinces:['Free State','Gauteng','KwaZulu-Natal'],
  cdps:[],
  go:'HOW',
  cta:'Explore the four pillars'},

SP:{shell:'journey',label:['Social','protection'],
  tag:'Participant journey · pillar one',
  title:'Social protection',
  role:'Making sure participants receive the support to which they are entitled',
  body:[
    'The grant is the starting point, not the destination. The first pillar confirms that participants and their households receive everything they are entitled to and closes the gaps that stop people from claiming, missing documents, unregistered births, and unclaimed services.',
    'The coach works with the local Department of Social Development office and SASSA outreach to resolve these issues, and refers participants to social work support where a household needs it.'
  ],
  figs:[],
  go:'HOW',
  cta:'How the pillars fit together'},

FI:{shell:'journey',label:['Financial','inclusion'],
  tag:'Participant journey · pillar two',
  title:'Financial inclusion',
  role:'Saving consistently and gaining access to finance participants can use',
  body:[
    'A financial buffer under a participant’s control changes what they can risk. The second pillar builds a regular saving habit, connects participants to appropriate formal financial products, and supports them through funding applications.',
    'It also tracks what participants are moving away from — reliance on informal credit is one of the clearest signals that a household is becoming more resilient.'
  ],
  figs:[],
  go:'HOW',
  cta:'How the pillars fit together'},

SE:{shell:'journey',label:['Social','empowerment'],
  tag:'Participant journey · pillar three',
  title:'Social empowerment',
  role:'Confidence, personal mastery and standing in the community',
  body:[
    'Personal mastery and social empowerment sessions build the confidence to act — to apply, to negotiate, to lead. This is usually where change becomes visible first, well before it shows up in income.',
    'The coach delivers the sessions directly, allowing the pace to be adapted to the group’s needs and progress.'
  ],
  figs:[[IMPACT_DATA.personalMastery,'Completed personal mastery']],
  go:'HOW',
  cta:'How the pillars fit together'},

LP:{shell:'journey',label:['Livelihood','promotion'],
  tag:'Participant journey · pillar four',
  title:'Livelihood promotion',
  role:'Skills, productive assets, markets and work',
  body:[
    'Technical and business training, productive asset transfers, market links and placement into employment. Whether a participant is heading for a job or building an enterprise, this pillar makes the route concrete.',
    'Participants are encouraged to build more than one income stream rather than betting everything on a single pathway, especially when farming is seasonal or an enterprise is still finding its feet.'
  ],
  figs:[[IMPACT_DATA.technicalSkillsTraining,'Technical skills training'],[IMPACT_DATA.businessDevelopmentTraining,'Business development training']],
  training:[
    {image:'images/training/01.jpg',title:'Enterprise support handover',caption:'Participants at the Department of Social Development-led Amajuba Local Municipality handover.'},
    {image:'images/training/02.jpg',title:'Hlengokuhle Cakes',caption:'With support from the NYDA, Hlengiwe Makhanya invested in bakery equipment.'},
    {image:'images/training/03.jpg',title:'Food preparation and catering',caption:'Practical food preparation training.'},
    {image:'images/training/04.jpg',title:'Hospitality training',caption:'Bambisandlasam hospitality students take part in practical training.'},
    {image:'images/training/05.jpg',title:'Hospitality training',caption:'Students present dishes prepared during their practical training.'},
    {image:'images/training/06.jpg',title:'Agricultural training',caption:'Participants learn essential agricultural skills.'},
    {image:'images/training/07.jpg',title:'Painting skills',caption:'Practical training equips participants with painting skills.'},
    {image:'images/training/08.jpg',title:'Part-time employment',caption:'Participants put their painting skills to work in part-time jobs.'},
    {image:'images/training/09.jpg',title:'Toolbox handover',caption:'Participants receive toolboxes to support their work.'},
    {image:'images/training/10.jpg',title:'Financial literacy',caption:'Participants take part in financial literacy training.'},
    {image:'images/training/11.jpg',title:'Bricklaying training',caption:'Participants build practical bricklaying skills.'},
    {image:'images/training/12.jpg',title:'Bricklaying training',caption:'A group of participants complete their practical training.'},
    {image:'images/training/13.jpg',title:'Generate Your Business Idea',caption:'Participants complete the NYDA business idea training.'},
    {image:'images/training/14.jpg',title:'Solar project',caption:'A participant linked to a solar project in Meloding.'},
    {image:'images/training/15.jpg',title:'Active learning workshop',caption:'Participants attend a five-day workshop hosted by the Seriti Institute for the NYS programme.'},
    {image:'images/training/16.jpg',title:'Giving back to the community',caption:'Participants and children celebrate Mandela Day together.'},
    {image:'images/training/17.jpg',title:'Household support',caption:'Food parcels are prepared for distribution.'},
    {image:'images/training/18.jpg',title:'Fast-food enterprise',caption:'A participant develops practical experience for a takeaway business.'},
    {image:'images/training/19.jpg',title:'Entrepreneurial training',caption:'Participants take part in SEDFA entrepreneurial training.'},
    {image:'images/training/20.jpg',title:'Business summit',caption:'Participants showcase their ideas and pitch for cash prizes in Madadeni.'},
    {image:'images/training/21.jpg',title:'Business registration',caption:'Business training and SEDFA support participants through the CIPC registration process.'},
    {image:'images/training/22.jpg',title:'Garment construction',caption:'David Tlale visits garment construction students at the Skills Centre to motivate them.'},
    {image:'images/training/23.jpg',title:'Poultry farming',caption:'NYDA funding helps a participant establish an egg-producing small business.'},
    {image:'images/training/24.jpg',title:'Community education and training',caption:'A participant practises sewing at the Community Education and Training Skills Centre.'},
    {image:'images/training/25.jpg',title:'Training completion',caption:'Participants celebrate receiving their certificates.'},
    {image:'images/training/26.jpg',title:'Household support',caption:'Food parcels are distributed at a programme site.'},
    {image:'images/training/27.jpg',title:'Business management',caption:'Participants collect certificates for an NYDA business management course at the local SASSA office.'},
    {image:'images/training/28.jpg',title:'Start Your Own Business',caption:'Participants complete the NYDA five-day Start Your Own Business training.'}
  ],
  go:'HOW',
  cta:'How the pillars fit together'},

DSD:{shell:'network',label:['Department of','Social Development'],
  tag:'Participant support network',
  title:'Department of Social Development',
  role:'Government principal, leading the programme',
  body:[
    'The National Department of Social Development leads the programme in partnership with its agencies, helping embed the GBL approach within government systems and support its long-term sustainability through public resources.',
    'At local level, DSD offices and Community Development Practitioners help connect participants to relevant social services. Their involvement is important to extending the approach and supporting its integration into existing service delivery structures.'
  ],
  figs:[],
  partner:{name:'Department of Social Development',logo:'images/partners/dsd.png',url:'https://www.dsd.gov.za/'},
  url:'https://www.dsd.gov.za/',
  cta:'Visit the DSD website'},

SASSA:{shell:'network',label:['SASSA'],
  tag:'Participant support network',
  title:'South African Social Security Agency',
  role:'Administers social grants and identifies participants',
  body:[
    'SASSA administers South Africa’s social grants and helps identify grant recipients the programme can work with. Its community outreach also helps participants access services they could not reach on their own.'
  ],
  figs:[],
  partner:{name:'South African Social Security Agency',logo:'images/partners/sassa.png',url:'https://www.sassa.gov.za/',inverse:true},
  url:'https://www.sassa.gov.za/',
  cta:'Visit the SASSA website'},

NDA:{shell:'network',label:['NDA'],
  tag:'Participant support network',
  title:'National Development Agency',
  role:'Agency partner supporting delivery',
  body:[
    'The National Development Agency supports training, enterprise development and delivery at site level as one of the programme\u2019s agency partners.'
  ],
  figs:[],
  partner:{name:'National Development Agency',logo:'images/partners/nda.png',url:'https://www.nda.org.za/',inverse:true},
  url:'https://www.nda.org.za/',
  cta:'Visit the NDA website'},

BRAC:{shell:'network',label:['BRAC','International'],
  tag:'Participant support network',
  title:'BRAC International',
  role:'The Graduation approach and technical support',
  body:[
    'BRAC International provides technical support to the programme and brings the Graduation approach that GBL adapts to the South African context. This includes programme design, monitoring and learning support.',
    'The approach combines four things at once – coaching, social empowerment, livelihood promotion and financial inclusion. By integrating these four components systematically, the approach helps participants make more sustainable progress towards improved livelihoods.'
  ],
  figs:[],
  partner:{name:'BRAC International',logo:'images/partners/brac.png',url:'https://www.bracinternational.org/',inverse:true},
  url:'https://www.bracinternational.org/',
  cta:'Visit the BRAC International website'},

FMT:{shell:'network',label:['FinMark Trust'],
  tag:'Participant support network',
  title:'FinMark Trust',
  role:'Implements the project and connects delivery to evidence and policy',
  body:[
    'FinMark Trust implements the project, coordinates delivery across sites, supports the Linkages Facilitators and manages the programme’s implementation and learning systems.',
    'Evidence from participant progress and implementation experience informs policy conversations about livelihood-focused social protection.'
  ],
  figs:[],
  partner:{name:'FinMark Trust',logo:'images/partners/finmark-trust.png',url:'https://finmark.org.za/'},
  url:'https://finmark.org.za/',
  cta:'Visit the FinMark Trust website'},

IMPL:{shell:'network',label:['Implementation','partners'],
  tag:'Participant support network',
  title:'Implementation partners',
  role:'Partners translating livelihood plans into tangible opportunities',
  body:[
    'GBL works with a growing network of national and local partners who contribute practical support across the sites. Their support includes skills development, employment pathways, enterprise assistance, productive assets, funding, market access and community-based services.',
    'Contributing partners include the National Youth Development Agency, Harambee Youth Employment Accelerator, HOPE Worldwide South Africa, and the National Home Builders Registration Council, along with other national, provincial, and community-based organisations.',
    'Prospective partners are invited to connect with our National Business Development Manager to explore opportunities to support employment placements, skills training, enterprise development, funding, productive assets, market access or technical expertise.'
  ],
  figs:[],
  teamHeading:'Partnership contact',
  team:[
    {name:'Matsiedi Malebatso',role:'National Business Development Manager',email:'matsiedim@sassa.gov.za',image:'images/team/matsiedi-malebatso.jpg'}
  ],
  url:'mailto:matsiedim@sassa.gov.za?subject=GBL%20partnership%20opportunity',
  cta:'Explore partnership opportunities'},

SKILLS:{shell:'network',label:['Training providers','& employers'],
  tag:'Participant support network',
  title:'Training providers and employers',
  role:'Where a qualification or a placement comes from',
  body:[
    'TVET and SETA colleges, accredited training providers, employers and recruitment agencies help turn aspirations into tangible opportunities, whether through certification, workplace experience, employment placements or first contracts.',
    'Effective partnerships begin with understanding participants’ goals and pathways. Coaching builds that understanding, making participant support the foundation for meaningful partnerships.'
  ],
  figs:[],
  cta:'See all partners'},

LOCAL:{shell:'network',label:['Local government','& community'],
  tag:'Participant support network',
  title:'Local government and community',
  role:'Municipalities, ward councillors, traditional leaders and local organisations',
  body:[
    'Access to a community runs through its own structures. Ward councillors, municipal departments, traditional leaders, NGOs, and faith-based organisations help create local delivery pathways by providing venues, facilitating land-use rights for enterprises, and holding the programme locally accountable.',
    'Linkages Facilitators maintain these relationships directly, allowing support to remain responsive to local needs while building trust within communities. This localised approach is a key strength of the programme and relies on continuous relationship-building.'
  ],
  figs:[],
  cta:'See all partners'},

LEARN:{shell:'network',label:['Learning','partners'],
  tag:'Participant support network',
  title:'Learning partners',
  role:'University of Johannesburg and SALDRU at the University of Cape Town',
  body:[
    'Independent research and learning partners help GBL understand what works, where barriers persist, and what is required to strengthen livelihood-focused social protection in South Africa.',
    'By combining participant experiences, frontline insights and implementation evidence, they generate practical knowledge that informs better support, stronger institutional coordination and opportunities for wider adoption.'
  ],
  figs:[],
  publications:[
    {
      number:'Learning Brief 3A',
      title:'What helps young people move from surviving to building a livelihood?',
      summary:'Relational livelihood support in practice: participant insights from the Generating Better Livelihoods for Grant Recipients project.',
      image:'images/publications/learning-brief-3a.jpg',
      pdf:'publications/gbl-learning-brief-3a.pdf'
    },
    {
      number:'Learning Brief 3B',
      title:'What does it take to help someone move from receiving a grant to building a livelihood?',
      summary:'Relational livelihood support in practice: linking, supporting and sustaining participant progression through frontline practice.',
      image:'images/publications/learning-brief-3b.jpg',
      pdf:'publications/gbl-learning-brief-3b.pdf'
    },
    {
      number:'Joint Policy Brief 1',
      title:'From Margins to Mainstream: In-Person Support as a Policy Lever for Livelihood Outcomes',
      summary:'Part of the Generating Better Livelihoods and Basic Package of Support for NEET Youth Programmes joint policy brief series.',
      image:'images/publications/policy-brief-from-margins-to-mainstream.jpg',
      pdf:'publications/gbl-policy-brief-from-margins-to-mainstream.pdf'
    }
  ],
  url:'https://finmark.org.za/knowledge-hub/all?utf8=%E2%9C%93&topics%5B%5D=gbl&button=',
  cta:'Explore publications'},

MIS:{shell:'network',label:['MIS','Participant tracking'],
  tag:'Coach tools and programme learning',
  title:'Management information system (MIS)',
  role:'Where coaches record and track each participant’s progress over time',
  body:[
    'The management information system (MIS) provides a central platform for coaches to record participant profiles, development plans, referrals, training, services and livelihood milestones across the four pillars. It enables coaches to track progress over time, identify outstanding support needs and follow up with participants as required.',
    'By creating a consistent record across all sites, the MIS also helps the programme monitor participant progress and assess movement towards graduation and more sustainable livelihoods.'
  ],
  figs:[['4','Pillars tracked'],['Ongoing','Progress record']],
  contact:{
    title:'Service provider enquiries',
    body:'Training providers, employers and other livelihood partners are invited to share opportunities, services and their eligibility requirements with the programme. Using participant profiles and progress information, Linkages Facilitators can identify suitable candidates and support the referral process.',
    note:'When contacting the team, please include the opportunity type, location, dates, number of available places and eligibility or selection criteria.',
    email:'info@finmark.org.za',
    phone:'+27 (0) 67 594 9291'
  },
  url:'https://www.gbl.finmark.org.za/',
  cta:'Open the coach MIS'},

CHALLENGE:{shell:'programme',label:['The challenge'],
  tag:'About the programme',
  title:'The challenge',
  role:'Why coordinated support matters',
  body:[
    'Social grants provide an essential safety net for millions of South Africans. But for many recipients, access to skills, employment, enterprise opportunities and sustained support remains limited.',
    'Training alone may not lead to employment. Business development support may have limited impact without equipment, markets or working capital. Participants facing personal or household challenges may need sustained support before they can take advantage of economic opportunities.',
    'GBL is testing how social protection, personalised coaching, skills development, financial inclusion and livelihood opportunities can work together, with the participant at the centre.'
  ],
  figs:[],
  cta:'Read the full picture'},

HOW:{shell:'programme',label:['How the','programme works'],
  tag:'The Graduation approach',
  title:'How GBL works',
  role:'A pathway to opportunity',
  body:[
    'GBL adapts the internationally established Graduation approach to South Africa’s social protection and economic environment.',
    'The approach combines social protection, livelihood promotion, social empowerment and financial inclusion. Rather than offering isolated interventions, it provides coordinated support based on participants’ individual circumstances, capabilities and goals.',
    'A central feature is the role of Linkages Facilitators, who work directly with participants to identify barriers, develop practical plans and connect them to services and economic opportunities.',
    '<strong>The four core coaching functions:</strong>',
    '<strong>01 Profiling</strong> – Understanding each participant’s circumstances, strengths, needs and aspirations.',
    '<strong>02 Linking</strong> – Connecting participants to training, services, funding and livelihood opportunities.',
    '<strong>03 Supporting</strong> – Providing ongoing guidance, encouragement and practical assistance.',
    '<strong>04 Sustaining</strong> – Helping participants strengthen their progress and resilience over time.'
  ],
  figs:[],
  pathways:[
    {
      title:'Employment pathway',
      body:'Participants are supported to identify suitable employment opportunities, build their job readiness, access relevant skills development and connect with employers or placement partners. Linkages Facilitators help participants overcome barriers, navigate opportunities and sustain progress as they transition into work.'
    },
    {
      title:'Entrepreneurship pathway',
      body:'Participants with entrepreneurial ambitions receive tailored support to strengthen their business skills, access productive assets and funding, build market links and grow sustainable enterprises. Linkages Facilitators provide ongoing guidance to help participants turn business ideas into viable sources of income and long-term livelihood opportunities.',
      href:'businesses.html',
      link:'View and fund a participant-run MSME'
    }
  ],
  pillarLinks:['SP','FI','SE','LP'],
  infographic:{
    image:'images/GBL_Graduation.svg',
    title:'The GBL Graduation Process',
    caption:'The complete participant pathway, from mobilisation and profiling to personalised support, livelihood development, and progression toward sustainable livelihood outcomes.'
  },
  publicationsHeading:'Programme brochure',
  publications:[
    {
      number:'GBL programme brochure',
      title:'From social protection to economic empowerment',
      summary:'An overview of the programme, its partnerships, the Graduation approach, participant pathway and delivery model.',
      image:'images/publications/gbl-programme-brochure.jpg',
      pdf:'publications/gbl-programme-brochure.pdf'
    }
  ],
  anchor:'pPillars',
  cta:'See the pillars and the pathway'},

IMPACT:{shell:'programme',label:['Our impact','so far'],
  tag:'About the programme',
  title:'Our impact so far',
  role:'Progress in building livelihood pathways',
  body:[
    'Across the project, participants access personalised support, develop new skills, and progress along employment and entrepreneurship pathways.',
    'These figures provide a snapshot of participant reach and support recorded through the programme’s management information system. Training categories may overlap.'
  ],
  figs:[
    [IMPACT_DATA.participantsProfiled,'Participants profiled','participants'],
    [IMPACT_DATA.employmentPathways,'Linked to employment pathways','employment'],
    [IMPACT_DATA.operatingBusinesses,'Operating businesses','business'],
    [IMPACT_DATA.nydaAssetVouchers,'NYDA asset vouchers','voucher'],
    [IMPACT_DATA.personalMastery,'Receiving personal mastery support','mastery'],
    [IMPACT_DATA.technicalSkillsTraining,'Receiving technical skills training','technical'],
    [IMPACT_DATA.businessDevelopmentTraining,'Receiving business development support','development']
  ],
  cta:'See the full tracker'},

STORIES:{shell:'programme',label:['Stories','of change'],
  tag:'About the programme',
  title:'Stories of change',
  role:'Participants\u2019 journeys and coaches\u2019 reflections',
  body:[
    'Behind every number is a person building a livelihood. GBL’s progress is best understood through the experiences of programme participants.',
    'Across the sites, participants are developing skills, starting and strengthening businesses, accessing employment opportunities and building confidence in their ability to improve their circumstances.',
    'These stories document the opportunities, challenges and support that shape their journeys.'
  ],
  figs:[],
  stories:[
    {title:'The story of Gina',description:'Gina shares her journey from Oppermansdorp in the Free State.',videoId:'VTQhv3VnlZo',embed:'https://www.youtube-nocookie.com/embed/VTQhv3VnlZo',url:'https://www.youtube.com/watch?v=VTQhv3VnlZo'},
    {title:'The story of Lizel Sol',description:'Lizel Sol shares her journey from Oppermansdorp in the Free State.',videoId:'0NgNE64GCOc',embed:'https://www.youtube-nocookie.com/embed/0NgNE64GCOc',url:'https://www.youtube.com/watch?v=0NgNE64GCOc'}
  ],
  impactStories:IMPACT_STORIES,
  anchor:'pImpactStories',
  cta:'Read the stories'},

MSME:{shell:'programme',label:['View and fund','participant-run MSME businesses'],
  tag:'Participant enterprise directory',
  title:'View and fund participant-run MSME businesses',
  role:'Discover enterprises established and grown through the GBL programme, and explore ways to support their next stage of growth.',
  body:[
    'This directory showcases participant-run micro and small enterprises that have emerged through a combination of coaching, skills development, business support and access to productive assets. Each profile highlights the entrepreneur’s journey, business activities and current growth opportunities.',
    'Whether you\'re an individual supporter, corporate partner, funder, or customer, you can support participant-led enterprises and strengthen sustainable livelihoods in many ways. Where available, verified support and donation links are provided. Enquiries can also be routed through the programme team.',
    'The Funders Wall recognises the organisations, institutions and individuals that have contributed to the growth of participant-run enterprises, making visible the partnerships and support that help businesses take their next steps.'
  ],
  figs:[],
  marketplace:true,
  url:'businesses.html',
  cta:'Open the business directory'},

EVIDENCE:{shell:'programme',label:['Evidence','& resources'],
  tag:'About the programme',
  title:'Evidence and resources',
  role:'Learning from implementation',
  body:[
    'GBL is generating evidence about what works, where the barriers lie and what is required to strengthen the delivery of livelihood-focused social protection in South Africa.',
    'Through implementation learning, Linkages Facilitator experience and research partnerships, the programme is informing approaches to participant support, institutional coordination and opportunities for wider adoption.',
    'The public collection includes learning and policy briefs, research, project updates, media coverage, participant stories and video.'
  ],
  figs:[],
  url:'https://finmark.org.za/knowledge-hub/all?utf8=%E2%9C%93&topics%5B%5D=gbl&button=',
  cta:'Explore publications'},

LATEST:{shell:'programme',label:['Latest','from GBL'],
  tag:'About the programme',
  title:'Latest from GBL',
  role:'Project developments, partnerships, learning and opportunities',
  body:[
    'Follow project developments, partner engagements, emerging lessons and new opportunities to strengthen livelihood pathways.'
  ],
  figs:[],
  updates:[
    {title:'Thundafund GBL crowdfunding: Inspired innovation paid off',date:'August 2026',datetime:'2026-08',url:'https://finmark.org.za/knowledge-hub/all?button=&topics=gbl&utf8=%E2%9C%93'},
    {title:'Building livelihoods, sustaining hope',date:'April 2026',datetime:'2026-04',url:'https://finmark.org.za/knowledge-hub/articles/building-livelihoods-sustaining-hope?entity=blog'},
    {title:'Ministerial engagement: Strengthening pathways from social protection to sustainable livelihoods',date:'March 2026',datetime:'2026-03',url:'https://finmark.org.za/knowledge-hub/articles/ministerial-engagement-strengthening-pathways-from-social-protection-to-sustainable-livelihoods?entity=blog'},
    {title:'Celebrating progress and partnership under GBL',date:'November 2025',datetime:'2025-11',url:'https://finmark.org.za/knowledge-hub/articles/celebrating-progress-and-partnership-under-the-generating-better-livelihoods-project?entity=blog'},
    {title:'DSD Roundtable',date:'29–30 October 2026',datetime:'2026-10-29',status:'Upcoming update',description:'A featured project update will be added once the joint communications are approved, followed by the outcomes and commitments arising from the event.'}
  ],
  url:'https://finmark.org.za/knowledge-hub/all?button=&topics=gbl&utf8=%E2%9C%93',
  cta:'Explore all GBL updates'},

TEAM:{shell:'programme',label:['The team','& contact'],
  tag:'About the programme',
  title:'The team and contact',
  role:'The people behind the programme, and how to reach us',
  body:[
    'Behind every participant’s journey is a dedicated team that connects people with the support and opportunities they need to build sustainable livelihoods.',
    'From project coordination and implementation to on-the-ground coaching, the GBL team works closely with participants, communities and partners to turn livelihood plans into practical action. Linkages Facilitators provide personalised guidance, connect participants to opportunities and support their progress.',
    'Together, the team brings the GBL approach to life, one participant and one opportunity at a time.',
    'FinMark Trust · Block B West, First Floor, Central Park, 400 16th Road, Randjespark, Midrand 1685, Johannesburg',
    'Telephone +27 (0) 67 594 9291 · info@finmark.org.za'
  ],
  figs:[],
  team:[
    {name:'Phumelele Ngcobo',role:'GBL Programme Lead',image:'images/team/phumelele-ngcobo.jpg'},
    {name:'Lungisani Dladla',role:'National Programme Manager Consultant',image:'images/team/lungisani-dladla.jpg'},
    {name:'Matsiedi Malebatso',role:'National Business Development Manager',image:'images/team/matsiedi-malebatso.jpg'},
    {name:'Vuyeya Segooa',role:'Implementation Coordinator',image:'images/team/vuyeya-segooa.jpg'}
  ],
  url:'mailto:info@finmark.org.za?subject=GBL%20enquiry',
  cta:'Get in touch'}
};

/* relationship types: coach | pillar | support | system */
const EDGES = [
  ['CORE','COACH','coach'],
  ['CORE','SP','pillar'],['CORE','FI','pillar'],['CORE','SE','pillar'],['CORE','LP','pillar'],
  ['COACH','SP','coach'],['COACH','FI','coach'],['COACH','SE','coach'],['COACH','LP','coach'],
  ['DSD','SP','support'],['SASSA','SP','support'],['DSD','LOCAL','support'],
  ['NDA','LP','support'],['NDA','SE','support'],
  ['BRAC','COACH','support'],['BRAC','FMT','support'],
  ['FMT','COACH','support'],['FMT','DSD','support'],
  ['IMPL','LP','support'],['IMPL','FI','support'],
  ['SKILLS','LP','support'],['LOCAL','COACH','support'],['LOCAL','SP','support'],
  ['MIS','COACH','coach'],['MIS','CORE','system'],['MIS','FMT','system'],['MIS','LEARN','system'],
  ['LEARN','EVIDENCE','system'],
  ['LATEST','EVIDENCE','system'],['LATEST','CORE','system'],
  ['CORE','MSME','support'],
  ['MSME','LP','system'],['MSME','COACH','system'],['MSME','MIS','system'],['MSME','STORIES','system'],
  ['HOW','CORE','system'],['HOW','COACH','system'],
  ['IMPACT','CORE','system'],['IMPACT','COACH','system'],
  ['STORIES','CORE','system'],['CHALLENGE','CORE','system'],
  ['EVIDENCE','IMPACT','system'],['TEAM','COACH','system'],['TEAM','FMT','system']
];

const SHELLS = {
  core:     {r:0,   squash:1,    phase:0},
  journey:  {r:218, squash:.84,  phase:0.9},
  network:  {r:372, squash:.78,  phase:2.4},
  programme:{r:508, squash:.52,  phase:4.1}
};
const SHELL_NAME = {
  core:'The centre of the network',
  journey:'Participant journey',
  network:'Participant support network',
  programme:'About the programme'
};

/* ============================================================
   2. GEOMETRY
   ============================================================ */
const keys = Object.keys(NODES);
function nodeSlug(k){
  return NODES[k].title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
const NODE_SLUG=Object.fromEntries(keys.map(k=>[k,nodeSlug(k)]));
const SLUG_NODE=Object.fromEntries(keys.map(k=>[NODE_SLUG[k],k]));
const byShell = {};
keys.forEach(k=>{const s=NODES[k].shell;(byShell[s]=byShell[s]||[]).push(k)});

Object.entries(byShell).forEach(([shell,list])=>{
  const cfg = SHELLS[shell], n = list.length;
  list.forEach((k,i)=>{
    const node = NODES[k];
    if(shell==='core'){ node.p = {x:0,y:0,z:0}; return; }
    // Fibonacci distribution, one shell at a time, offset per shell
    const y = n===1 ? 0 : 1 - ((i+0.5)/n)*2;
    const rad = Math.sqrt(Math.max(0,1-y*y));
    const th = Math.PI*(3-Math.sqrt(5))*i + cfg.phase;
    node.p = {
      x: Math.cos(th)*rad*cfg.r,
      y: y*cfg.r*cfg.squash,
      z: Math.sin(th)*rad*cfg.r
    };
  });
});

const neighbours = {};
keys.forEach(k=>neighbours[k]=[]);
EDGES.forEach(([a,b])=>{ neighbours[a].push(b); neighbours[b].push(a); });

/* ============================================================
   3. ENGINE
   ============================================================ */
const cv = document.getElementById('net');
const ctx = cv.getContext('2d');
const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const CAN_BLUR = (typeof ctx.filter === 'string');

let W=0,H=0,dpr=1;
let yaw=0.5, pitch=-0.18, tYaw=0.5, tPitch=-0.18;
let zoom=1, tZoom=1;
let cxFrac=0.5, tCxFrac=0.5, cyFrac=0.5, tCyFrac=0.5;
let spinning=!reduce, dragging=false, hoverKey=null, selKey=null, shellFilter=null;
let reveal = reduce ? 1 : 0;
let keepouts = [];
let baseFit = 1, wide = true;

function layout(){
  wide = window.innerWidth > 920;
  const pnl = document.getElementById('panel');
  const panelOpen = !!(pnl && pnl.classList.contains('open'));

  let safeL, safeR, safeT, safeB;
  if(wide){
    safeL = 14;
    safeR = W - (panelOpen ? Math.min(820, W*0.70) : 0) - 14;
    safeT = 14;
    safeB = H - 14;
  } else {
    safeL = 8; safeR = W - 8;
    safeT = 18;
    safeB = panelOpen ? H*0.30 : H - 62;
    if(safeB - safeT < 150) safeB = safeT + 150;
  }
  const safeW = Math.max(180, safeR - safeL);
  const safeH = Math.max(150, safeB - safeT);
  const spread = wide ? 1180 : 1030;
  baseFit = Math.max(0.24, Math.min(1.14, Math.min(safeW/spread, safeH/(wide?700:620))));
  tCxFrac = ((safeL + safeR) / 2) / W;
  tCyFrac = ((safeT + safeB) / 2) / H;
  updateKeepouts();
}
const FOV = 1150, CAM = 1230;

function resize(){
  dpr = Math.min(window.devicePixelRatio||1, 2);
  const r = cv.getBoundingClientRect();
  W = r.width; H = r.height;
  cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(typeof layout==='function') layout();
}
new ResizeObserver(resize).observe(cv);
resize();

function rot(p){
  const sy=Math.sin(yaw), cy=Math.cos(yaw), sp=Math.sin(pitch), cp=Math.cos(pitch);
  const x1 = p.x*cy - p.z*sy;
  const z1 = p.x*sy + p.z*cy;
  const y2 = p.y*cp - z1*sp;
  const z2 = p.y*sp + z1*cp;
  return {x:x1,y:y2,z:z2};
}
function project(p){
  const r = rot(p);
  const s = reveal * zoom * baseFit;
  const z = r.z*baseFit + CAM;
  const k = FOV/z;
  return {
    x: W*cxFrac + r.x*s*k,
    y: H*cyFrac + r.y*s*k,
    z: r.z,
    k
  };
}

/* depth 0 (far) .. 1 (near) */
function depth(z){
  const maxR = 560;
  return Math.max(0, Math.min(1, (maxR - z)/(maxR*2)));
}

const R_BY_SHELL = {core:0, journey:20, network:14.5, programme:10};

function nodeAlpha(k){
  const n = NODES[k];
  let a = 1;
  if(shellFilter && n.shell!==shellFilter && k!=='CORE') a *= 0.14;
  const focus = selKey || hoverKey;
  if(focus){
    const near = k===focus || neighbours[focus].includes(k);
    if(!near) a *= 0.16;
  }
  // the participant is the anchor of the composition and never disappears
  if(k==='CORE') a = Math.max(a, 0.5);
  return a;
}
function edgeAlpha(a,b){
  let m = 1;
  if(shellFilter){
    const inA = NODES[a].shell===shellFilter||a==='CORE';
    const inB = NODES[b].shell===shellFilter||b==='CORE';
    if(!(inA&&inB)) m *= 0.08;
  }
  const focus = selKey || hoverKey;
  if(focus) m *= (a===focus||b===focus) ? 1 : 0.07;
  return m;
}

const STYLE = {
  coach:  {w:2.3, col:'201,162,101', a:.62, dash:null},
  pillar: {w:1.4, col:'201,162,101', a:.48, dash:null},
  support:{w:1.15,col:'98,64,12', a:.30, dash:[4,4.5]},
  system: {w:1.1, col:'98,64,12', a:.22, dash:[1.6,4.6]}
};
const SELECTED_RGB='221,245,154'; // light lime green selected state

let hit = [];

function draw(){
  if(!Number.isFinite(W)||!Number.isFinite(H)||!Number.isFinite(cxFrac)||!Number.isFinite(cyFrac)||W<=0||H<=0) return;
  ctx.clearRect(0,0,W,H);

  // ambient lift behind the core
  const cx = W*cxFrac, cy = H*cyFrac;
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.52);
  g.addColorStop(0,'rgba(255,255,255,.84)');
  g.addColorStop(.48,'rgba(248,244,238,.48)');
  g.addColorStop(1,'rgba(248,244,238,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);

  const proj = {};
  keys.forEach(k=>proj[k]=project(NODES[k].p));

  // --- edges, far to near ---
  const eList = EDGES.map(([a,b,t])=>{
    const pa=proj[a], pb=proj[b];
    return {a,b,t,pa,pb,mz:(pa.z+pb.z)/2};
  }).sort((m,n)=>n.mz-m.mz);

  eList.forEach(e=>{
    const st = STYLE[e.t];
    const d = depth(e.mz);
    const al = st.a * (0.28+0.72*d) * edgeAlpha(e.a,e.b) * reveal;
    if(al<0.012) return;
    ctx.save();
    ctx.strokeStyle = `rgba(${st.col},${al})`;
    ctx.lineWidth = st.w * (0.55+0.55*d);
    ctx.lineCap='round';
    if(st.dash) ctx.setLineDash(st.dash.map(v=>v*(0.7+0.5*d)));
    ctx.beginPath(); ctx.moveTo(e.pa.x,e.pa.y); ctx.lineTo(e.pb.x,e.pb.y); ctx.stroke();
    ctx.restore();
  });

  // --- nodes, far to near ---
  hit = [];
  obstacles.length = 0;
  const order = keys.slice().sort((a,b)=>proj[b].z-proj[a].z);
  const focus = selKey||hoverKey;

  order.forEach(k=>{
    const n = NODES[k], p = proj[k];
    const d = depth(p.z), al = nodeAlpha(k)*reveal;
    const isFocus = k===focus;
    const isSelected = k===selKey;

    if(k==='CORE'){ drawCore(p,al,isFocus,isSelected); hit.push({k,x:p.x,y:p.y,r:50*p.k}); obstacles.push({k,x:p.x,y:p.y,r:44*p.k}); return; }

    const r = R_BY_SHELL[n.shell]*(n.rMul||1)*p.k*(isFocus?1.4:1);
    hit.push({k,x:p.x,y:p.y,r:Math.max(r+14,26)});
    if(al>0.15) obstacles.push({k,x:p.x,y:p.y,r:r+3});
    if(al<0.02) return;

    ctx.save();
    if(CAN_BLUR && d<0.42) ctx.filter=`blur(${((0.42-d)*7).toFixed(2)}px)`;

    if(n.shell==='journey'){
      ctx.fillStyle=isSelected?`rgba(${SELECTED_RGB},${al})`:`rgba(201,162,101,${al})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.2832); ctx.fill();
      if(isSelected){ctx.strokeStyle=`rgba(98,64,12,${al})`;ctx.lineWidth=Math.max(2,3*p.k);ctx.stroke();}
    } else if(n.shell==='network'){
      ctx.fillStyle=isSelected?`rgba(${SELECTED_RGB},${al})`:`rgba(98,64,12,${0.94*al})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.2832); ctx.fill();
      ctx.strokeStyle=isSelected?`rgba(98,64,12,${al})`:`rgba(201,162,101,${al*(0.5+0.5*d)})`;
      ctx.lineWidth=isSelected?Math.max(2,3*p.k):Math.max(1,1.8*p.k);
      ctx.stroke();
    } else {
      ctx.fillStyle=isSelected?`rgba(${SELECTED_RGB},${al})`:`rgba(255,255,255,${al*(0.5+0.5*d)})`;
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,6.2832); ctx.fill();
      ctx.strokeStyle=`rgba(98,64,12,${isSelected?al:al*(0.24+0.34*d)})`;
      ctx.lineWidth=isSelected?Math.max(2,3*p.k):Math.max(1,1.25*p.k);
      ctx.stroke();
    }
    ctx.restore();
  });

  // --- labels: near to far, collision-reserved, core first ---
  placed.length = 0;
  keepouts.forEach(b=>placed.push(b));

const prio = k =>
    k===focus ? 4 : (focus&&neighbours[focus].includes(k)) ? 3
    : NODES[k].shell==='journey' ? 2 : 0;

  const labelOrder = keys.filter(k=>k!=='CORE')
    .sort((a,b)=>{
      const d=prio(b)-prio(a);
      return d!==0 ? d : proj[a].z-proj[b].z;
    });

  const drawOne = k=>{
    const n=NODES[k], p=proj[k], d=depth(p.z);
    const al=nodeAlpha(k)*reveal;
    const isFocus=k===focus;
    const isNb = focus && neighbours[focus].includes(k);
    const always = wide && n.shell==='journey';
    if(al<0.2) return;
    if(!(isFocus || isNb || always || (wide && d>0.46))) return;
    const r = R_BY_SHELL[n.shell]*(n.rMul||1)*p.k*(isFocus?1.4:1);
    const fade = isFocus ? 1 : isNb ? 0.95
      : Math.max(always?0.62:0.5, Math.min(1, 0.5+1.3*(d-0.42)));
    drawLabel(n.label,p,r,al*fade,isFocus,isFocus||isNb||always,k,n.nodeStats);
  };

  // the focused node claims its space first
  if(focus && focus!=='CORE') drawOne(focus);

  // then the participant does: full billing when in play, yielding when not
  const cAl = nodeAlpha('CORE')*reveal;
  const coreLead = !focus || focus==='CORE' || neighbours[focus].includes('CORE');
  if(cAl>0.25) drawCoreLabel(proj.CORE, cAl, coreLead);

  labelOrder.forEach(k=>{ if(k!==focus) drawOne(k); });
}

const placed=[], obstacles=[];
function updateKeepouts(){
  const cr=cv.getBoundingClientRect();
  keepouts = ['.tools'].map(sel=>{
    const e=document.querySelector(sel); if(!e) return null;
    const r=e.getBoundingClientRect();
    if(!r.width) return null;
    return {x:r.left-cr.left-10, y:r.top-cr.top-8, w:r.width+22, h:r.height+16};
  }).filter(Boolean);
}
function boxHitsNode(b,own){
  for(let i=0;i<obstacles.length;i++){
    const o=obstacles[i];
    if(o.k===own) continue;
    const nx=Math.max(b.x,Math.min(o.x,b.x+b.w));
    const ny=Math.max(b.y,Math.min(o.y,b.y+b.h));
    if((nx-o.x)**2+(ny-o.y)**2 < o.r*o.r) return true;
  }
  return false;
}
function boxFree(b){
  for(let i=0;i<placed.length;i++){
    const o=placed[i];
    if(b.x < o.x+o.w && b.x+b.w > o.x && b.y < o.y+o.h && b.y+b.h > o.y) return false;
  }
  return true;
}

function drawCore(p,al,isFocus,isSelected){
  const base = 38*p.k*(isFocus?1.1:1);
  ctx.save();
  const t = performance.now()/1000;

  // layered rings, echoing the brand blob device
  for(let i=0;i<3;i++){
    const ph = reduce ? 0.5 : (t*0.26 + i/3)%1;
    const rr = base*(1.35 + ph*2.5);
    ctx.strokeStyle=`rgba(201,162,101,${(1-ph)*0.30*al})`;
    ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,6.2832); ctx.stroke();
  }

  ctx.fillStyle=isSelected?`rgba(${SELECTED_RGB},${al})`:`rgba(201,162,101,${al})`;
  ctx.beginPath(); ctx.arc(p.x,p.y,base,0,6.2832); ctx.fill();
  if(isSelected){ctx.strokeStyle=`rgba(98,64,12,${al})`;ctx.lineWidth=Math.max(2,3*p.k);ctx.stroke();}
  ctx.restore();
}

function drawCoreLabel(p,al,lead){
  const base = 40*p.k;
  const w0=Math.max(190*Math.min(1.2,p.k),120);
  const probe={x:p.x-w0/2-6, y:p.y+base+9, w:w0+12, h:lead?58:26};
  if(!lead && (!boxFree(probe) || boxHitsNode(probe,'CORE'))) return;
  ctx.save();
  ctx.textAlign='center'; ctx.textBaseline='top';
  ctx.shadowColor='rgba(255,255,255,.94)'; ctx.shadowBlur=10;
  const f1=Math.round(17*Math.min(1.25,p.k)), f2=Math.round(12*Math.min(1.2,p.k));
  ctx.fillStyle=`rgba(98,64,12,${al})`;
  ctx.font=`800 ${f1}px "Open Sans",Arial,sans-serif`;
  const y0=p.y+base+15;
  ctx.fillText('A participant', p.x, y0);
  if(lead){
    ctx.fillStyle=`rgba(128,99,49,${al*0.96})`;
    ctx.font=`600 ${f2}px "Open Sans",Arial,sans-serif`;
    ctx.fillText('Social grant recipient', p.x, y0+f1+6);
  }
  ctx.restore();
  placed.push({x:p.x-w0/2-6, y:p.y-base-8,
    w:w0+12, h:base*2+f1+(lead?f2+34:18)});
}

function drawLabel(lines,p,r,al,isFocus,force,own,stats=[]){
  const fs = Math.round((isFocus?14:12.4)*Math.min(1.2,Math.max(.85,p.k)));
  const showStats=stats.length&&(wide||isFocus);
  const statsFs=Math.round((isFocus?10.5:9.5)*Math.min(1.15,Math.max(.88,p.k)));
  ctx.save();
  ctx.textBaseline='top';
  ctx.font=`${isFocus?800:600} ${fs}px "Open Sans",Arial,sans-serif`;
  let w=0; lines.forEach(t=>{ w=Math.max(w,ctx.measureText(t).width); });
  if(showStats){
    ctx.font=`700 ${statsFs}px "Open Sans",Arial,sans-serif`;
    stats.forEach(t=>{w=Math.max(w,ctx.measureText(t).width);});
  }
  const lh=fs+3, statsLh=statsFs+3, statsGap=5;
  const bh=lines.length*lh+(showStats?statsGap+stats.length*statsLh:0), gap=r+9;

  const cands=[
    {ax:'center', x:p.x,        y:p.y+gap},
    {ax:'center', x:p.x,        y:p.y-gap-bh},
    {ax:'left',   x:p.x+r+10,   y:p.y-bh/2},
    {ax:'right',  x:p.x-r-10,   y:p.y-bh/2}
  ];
  const boxOf=c=>{
    const bx = c.ax==='center' ? c.x-w/2 : c.ax==='left' ? c.x : c.x-w;
    return {x:bx-7, y:c.y-4, w:w+14, h:bh+8};
  };
  let chosen=null;
  for(const c of cands){
    const b=boxOf(c);
    if(boxFree(b) && !boxHitsNode(b,own)){ chosen={c,b}; break; }
  }
  if(!chosen){
    if(!force){ ctx.restore(); return; }
    // forced labels may overlap other labels but never the interface
    const safe = cands.find(c=>{
      const b=boxOf(c);
      return !keepouts.some(o=>b.x<o.x+o.w&&b.x+b.w>o.x&&b.y<o.y+o.h&&b.y+b.h>o.y);
    });
    const c = safe || cands[0];
    chosen={c, b:boxOf(c)};
  }
  placed.push(chosen.b);
  ctx.textAlign = chosen.c.ax;
  ctx.shadowColor='rgba(255,255,255,.96)'; ctx.shadowBlur=10;
  ctx.fillStyle = isFocus ? `rgba(98,64,12,${al})` : `rgba(61,49,36,${al*0.95})`;
  ctx.font=`${isFocus?800:600} ${fs}px "Open Sans",Arial,sans-serif`;
  let y=chosen.c.y;
  lines.forEach(t=>{ ctx.fillText(t,chosen.c.x,y); y+=lh; });
  if(showStats){
    y+=statsGap;
    ctx.font=`700 ${statsFs}px "Open Sans",Arial,sans-serif`;
    ctx.fillStyle=`rgba(128,99,49,${al*0.98})`;
    stats.forEach(t=>{ctx.fillText(t,chosen.c.x,y);y+=statsLh;});
  }
  ctx.restore();
}

/* ---------- loop ---------- */
function tick(){
  if(reveal<1) reveal = Math.min(1, reveal + 0.035);
  if(spinning && !dragging && !selKey && !hoverKey){ tYaw += 0.0028; }
  const ease=(a,b,f)=>a+(b-a)*f;
  yaw   = ease(yaw,tYaw,reduce?1:0.13);
  pitch = ease(pitch,tPitch,reduce?1:0.13);
  zoom  = ease(zoom,tZoom,reduce?1:0.1);
  cxFrac= ease(cxFrac,tCxFrac,reduce?1:0.08);
  cyFrac= ease(cyFrac,tCyFrac,reduce?1:0.08);
  draw();
  requestAnimationFrame(tick);
}
tick();

/* ============================================================
   4. INTERACTION
   ============================================================ */
function pick(mx,my){
  let best=null,bd=1e9;
  hit.forEach(h=>{
    const d=Math.hypot(h.x-mx,h.y-my);
    if(d<h.r && d<bd){bd=d;best=h.k;}
  });
  return best;
}

let dragStart=null, moved=0;
cv.addEventListener('pointerdown',e=>{
  cv.setPointerCapture(e.pointerId);
  dragStart={x:e.offsetX,y:e.offsetY,yaw:tYaw,pitch:tPitch};
  moved=0; dragging=true; cv.classList.add('dragging');
});
cv.addEventListener('pointermove',e=>{
  if(dragging && dragStart){
    const dx=e.offsetX-dragStart.x, dy=e.offsetY-dragStart.y;
    moved=Math.max(moved,Math.hypot(dx,dy));
    tYaw = dragStart.yaw + dx*0.0062;
    tPitch = Math.max(-0.95,Math.min(0.95, dragStart.pitch + dy*0.0052));
    return;
  }
  const k = pick(e.offsetX,e.offsetY);
  if(k!==hoverKey){ hoverKey=k; markNavHover(k); cv.classList.toggle('pointing',!!k); }
});
cv.addEventListener('pointerup',e=>{
  dragging=false; cv.classList.remove('dragging');
  if(moved<6){
    const k=pick(e.offsetX,e.offsetY);
    if(k) select(k,{syncMenu:false}); else close();
  }
  dragStart=null;
});
cv.addEventListener('pointerleave',()=>{ hoverKey=null; markNavHover(null); cv.classList.remove('pointing'); });
cv.addEventListener('wheel',e=>{
  e.preventDefault();
  tZoom = Math.max(0.62, Math.min(1.85, tZoom * (e.deltaY>0?0.92:1.09)));
},{passive:false});

/* ---------- Excel-driven MSME directory ---------- */
const MSME_XLSX_PATH='data/GBL-MSME-directory.xlsx';
const MSME_FALLBACK_CSV=`business_id,business_name,owner,category,location,verification_status,last_verified,summary,image,goal_zar,raised_zar,donation_url,contact_email,funder_name,contribution_zar,contribution_type
hlengokuhle-cakes,Hlengokuhle Cakes,Hlengiwe Makhanya,Bakery and catering,"Madadeni, KwaZulu-Natal",Published programme story,,"With support to access baking equipment, business development training and coaching, Hlengiwe has expanded her bakery, increased production and built a growing customer base.",images/msmes/hlengokuhle-cakes.jpg,,,,info@finmark.org.za,National Youth Development Agency (NYDA),,Equipment and enterprise support
nothile-early-learning-academy,Nothile Early Learning Academy,Snothile Kubheka,Early childhood development,"Madadeni, KwaZulu-Natal",Published programme story,,"Business support and funding helped Snothile improve her facilities, accommodate more children, create employment opportunities and strengthen the centre's operations.",images/msmes/nothile-early-learning-academy.jpg,,,,info@finmark.org.za,National Youth Development Agency (NYDA),,Equipment and enterprise support
ntombenhle-fast-foods,Ntombenhle Fast Foods,Ntombenhle Ndlozi,Food services,KwaZulu-Natal,Published programme story,,"Training, coaching and productive equipment enabled Ntombenhle to grow from small-scale food sales into a catering enterprise serving larger events and community functions.",images/msmes/ntombenhle-fast-foods.jpg,,,,info@finmark.org.za,National Youth Development Agency (NYDA),,Equipment and enterprise support`;
const APPROVED_FUNDERS=[
  ['National Youth Development Agency (NYDA)','Equipment and enterprise support for Hlengokuhle Cakes, Nothile Early Childhood Development and Ntombenhle’s fast food and catering business.'],
  ['Mukuru','Contributed a significant portion of the Thundafund crowdfunding target, which enabled support for an additional 15 participants also ready to grow their business.'],
  ['SACRAA','One of the first corporate backers of the Thundafund crowdfunding campaign.'],
  ['Thundafund individual backers','Francesco Di Salvo, Jaco Weideman and Justin Leach all supported the campaign to enable six entrepreneurs in urgent need of funding to get their business started.']
];

function parseCsv(text){
  const rows=[]; let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){
      if(quoted&&text[i+1]==='"'){cell+='"';i++;} else quoted=!quoted;
    }else if(ch===','&&!quoted){row.push(cell.trim());cell='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){
      if(ch==='\r'&&text[i+1]==='\n') i++;
      row.push(cell.trim());cell='';
      if(row.some(v=>v!=='')) rows.push(row);
      row=[];
    }else cell+=ch;
  }
  if(cell!==''||row.length){row.push(cell.trim());if(row.some(v=>v!==''))rows.push(row);}
  if(rows.length<2) return [];
  const headers=rows.shift().map(h=>h.trim());
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]||'').trim()])))
    .filter(r=>r.business_id&&r.business_name);
}
function parseExcel(buffer){
  if(!window.XLSX) throw new Error('The Excel reader is unavailable');
  const workbook=XLSX.read(buffer,{type:'array',cellDates:true});
  const sheet=workbook.Sheets['MSME Directory']||workbook.Sheets[workbook.SheetNames[0]];
  if(!sheet) return [];
  return XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false,dateNF:'yyyy-mm-dd'})
    .map(row=>Object.fromEntries(Object.entries(row).map(([key,value])=>[String(key).trim(),String(value??'').trim()])))
    .filter(row=>row.business_id&&row.business_name);
}
const escapeHtml=value=>String(value||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const STORY_PATHWAYS={
  'Participant 1047':['Employment','Entrepreneurship'],
  'Participant 2186':['Employment'],
  'Participant 3074':['Employment'],
  'Participant 4261':['Entrepreneurship'],
  'Participant 5398':['Employment'],
  'Participant 6142':['Entrepreneurship'],
  'Participant 7259':['Entrepreneurship'],
  'Participant 8315':['Entrepreneurship'],
  'Participant 9426':['Entrepreneurship'],
  'Participant 1537':['Entrepreneurship'],
  'Participant 2648':['Employment'],
  'Participant 3751':['Employment','Entrepreneurship'],
  'Participant 4863':['Employment'],
  'Participant 5974':['Employment'],
  'Participant 6085':['Employment'],
  'Participant 7196':['Entrepreneurship'],
  'Participant 8207':['Entrepreneurship'],
  'Participant 9318':['Entrepreneurship'],
  'Participant 1429':['Entrepreneurship'],
  'Participant 2530':['Entrepreneurship'],
  'Participant 3641':['Employment']
};
const STORY_SUPPORTS={
  'Participant 1047':['Personal development and wellbeing','Business development','Financial capability','Funding and productive assets','Coaching and mentorship'],
  'Participant 2186':['Personal development and wellbeing','Business development','Financial capability','Coaching and mentorship'],
  'Participant 3074':['Personal development and wellbeing','Employment preparation and placement','Business development','Technical and vocational skills','Coaching and mentorship'],
  'Participant 4261':['Personal development and wellbeing','Business development','Financial capability','Coaching and mentorship'],
  'Participant 5398':['Personal development and wellbeing','Employment preparation and placement','Coaching and mentorship'],
  'Participant 6142':['Personal development and wellbeing','Business development','Financial capability','Funding and productive assets','Coaching and mentorship'],
  'Participant 7259':['Business development','Financial capability','Coaching and mentorship'],
  'Participant 8315':['Business development','Financial capability','Funding and productive assets','Coaching and mentorship'],
  'Participant 9426':['Personal development and wellbeing','Business development','Financial capability','Funding and productive assets','Coaching and mentorship'],
  'Participant 1537':['Business development','Financial capability','Funding and productive assets','Technical and vocational skills','Coaching and mentorship'],
  'Participant 2648':['Personal development and wellbeing','Employment preparation and placement','Financial capability','Coaching and mentorship'],
  'Participant 3751':['Personal development and wellbeing','Business development','Financial capability','Funding and productive assets','Technical and vocational skills','Coaching and mentorship'],
  'Participant 4863':['Personal development and wellbeing','Financial capability','Technical and vocational skills','Coaching and mentorship'],
  'Participant 5974':['Employment preparation and placement','Financial capability'],
  'Participant 6085':['Personal development and wellbeing','Employment preparation and placement','Financial capability','Technical and vocational skills'],
  'Participant 7196':['Personal development and wellbeing','Business development','Financial capability'],
  'Participant 8207':['Personal development and wellbeing','Business development','Financial capability'],
  'Participant 9318':['Personal development and wellbeing','Business development','Financial capability','Funding and productive assets','Technical and vocational skills','Coaching and mentorship'],
  'Participant 1429':['Personal development and wellbeing','Business development','Financial capability','Coaching and mentorship'],
  'Participant 2530':['Personal development and wellbeing','Business development','Financial capability','Coaching and mentorship'],
  'Participant 3641':['Personal development and wellbeing','Employment preparation and placement','Financial capability','Technical and vocational skills','Coaching and mentorship']
};
const STORY_SUPPORT_TYPES=[
  ['Personal development and wellbeing',/(personal mastery|personal growth|life skills|life-skills|mindset|wellness|psychosocial|mental-health|confidence)/],
  ['Employment preparation and placement',/(job-readiness|job-preparedness|career guidance|cv support|employment-readiness|in-service placement|linked (?:him|her) to|employment opportunities)/],
  ['Business development',/(business management|business coaching|business development|entrepreneurship|enterprise support|business mentorship|business-building|business planning|registration)/],
  ['Financial capability',/(financial literacy|financial capability|financial management|financial discipline|cash management|budget|saving|financial practices|financial records)/],
  ['Funding and productive assets',/(funding|business grant|asset finance|productive equipment|productive assets|industrial equipment)/],
  ['Technical and vocational skills',/(technical skills|hospitality|agricultural|early childhood development|ecd training|detergent-making|police induction|skills development)/],
  ['Coaching and mentorship',/(coaching|mentor|facilitator|ongoing guidance|personalised support)/]
];
function storyMetadata(story){
  const text=`${story.title} ${(story.body||[]).join(' ')}`.toLowerCase();
  const province=story.site.includes(',')?story.site.split(',').pop().trim():story.site.trim();
  let pathways=STORY_PATHWAYS[story.participant]||[];
  if(!pathways.length){
    if(/(employment|job|career|placement|position)/.test(text)) pathways.push('Employment');
    if(/(business|enterprise|trading|salon|catering)/.test(text)) pathways.push('Entrepreneurship');
  }
  const supports=STORY_SUPPORTS[story.participant]||STORY_SUPPORT_TYPES.filter(([,pattern])=>pattern.test(text)).map(([label])=>label);
  return {province,pathways,supports};
}
function renderImpactStories(stories){
  const metadata=stories.map(storyMetadata);
  const provinces=[...new Set(metadata.map(item=>item.province))].sort((a,b)=>a.localeCompare(b));
  return `<h3>Participant impact stories</h3><p class="section-intro"><strong>${stories.length} participant journeys</strong> showing progress through employment, enterprise, education, productive assets and combined livelihood pathways.</p>
    <div class="story-filters" aria-label="Filter participant impact stories">
      <div class="story-filter-controls">
        <label><span>Province</span><select data-story-filter="province"><option value="">All provinces</option>${provinces.map(value=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}</select></label>
        <label><span>Livelihood pathway</span><select data-story-filter="pathway"><option value="">All pathways</option><option value="Employment">Employment</option><option value="Entrepreneurship">Entrepreneurship</option></select></label>
        <label><span>Type of support</span><select data-story-filter="support"><option value="">All support types</option>${STORY_SUPPORT_TYPES.map(([value])=>`<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('')}</select></label>
        <button class="story-filter-reset" type="button">Clear filters</button>
      </div>
      <p class="story-filter-status" aria-live="polite">Showing all ${stories.length} stories</p>
    </div>
    <div class="impact-story-list">${stories.map((story,index)=>{const meta=metadata[index];return `
      <details class="impact-story-card" data-province="${escapeHtml(meta.province)}" data-pathways="${escapeHtml(meta.pathways.join('|'))}" data-supports="${escapeHtml(meta.supports.join('|'))}">
        <summary><span class="impact-story-number">${String(index+1).padStart(2,'0')}</span><span><strong>${escapeHtml(story.participant)}</strong><small>${escapeHtml(story.title)}</small></span><span class="impact-story-toggle" aria-hidden="true">+</span></summary>
        <div class="impact-story-copy"><p class="impact-story-meta">Supported by ${escapeHtml(story.facilitator)} · ${escapeHtml(story.site)}</p><div class="impact-story-tags">${meta.pathways.map(value=>`<span>${escapeHtml(value)}</span>`).join('')}${meta.supports.map(value=>`<span>${escapeHtml(value)}</span>`).join('')}</div>${story.body.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}${story.quote?`<blockquote>“${escapeHtml(story.quote)}”</blockquote>`:''}</div>
      </details>`;}).join('')}</div>
    <p class="story-filter-empty" hidden>No stories match these filters. Try clearing one or more selections.</p>`;
}
function applyImpactStoryFilters(){
  const province=el.impactStories.querySelector('[data-story-filter="province"]')?.value||'';
  const pathway=el.impactStories.querySelector('[data-story-filter="pathway"]')?.value||'';
  const support=el.impactStories.querySelector('[data-story-filter="support"]')?.value||'';
  const cards=[...el.impactStories.querySelectorAll('.impact-story-card')];
  let shown=0;
  cards.forEach(card=>{
    const matches=(!province||card.dataset.province===province)&&(!pathway||card.dataset.pathways.split('|').includes(pathway))&&(!support||card.dataset.supports.split('|').includes(support));
    card.hidden=!matches;
    if(!matches) card.open=false;
    if(matches) shown++;
  });
  const status=el.impactStories.querySelector('.story-filter-status');
  if(status) status.textContent=shown===cards.length?`Showing all ${cards.length} stories`:`Showing ${shown} of ${cards.length} stories`;
  const empty=el.impactStories.querySelector('.story-filter-empty');
  if(empty) empty.hidden=shown!==0;
}
function safeWebUrl(value){
  try{const u=new URL(String(value||'').trim());return /^https?:$/.test(u.protocol)?u.href:'';}catch(_){return '';}
}
function safeAsset(value){
  const v=String(value||'').trim();
  return /^(images\/[A-Za-z0-9_./-]+|data:image\/(?:jpeg|png|webp|svg\+xml);base64,|https?:\/\/)/.test(v)?v:'';
}
function coachCardMarkup(person,{cdp=false}={}){
  const province=cdp?` data-province="${escapeHtml(person.province||'')}"`:'';
  const image=person.image
    ? `<img src="${escapeHtml(person.image)}" alt="Portrait of ${escapeHtml(person.name)}" width="600" height="600" loading="lazy" decoding="async">`
    : `<span class="coach-image-placeholder" aria-hidden="true">${escapeHtml((person.name||'CDP').split(/\s+/).map(part=>part[0]).slice(0,2).join(''))}</span>`;
  const email=person.email?`<a href="mailto:${escapeHtml(person.email)}">${escapeHtml(person.email)}</a>`:'';
  return `<article class="coach-card${cdp?' cdp-card':''}"${province}>
    ${image}
    <div><h4>${escapeHtml(person.name)}</h4><p class="coach-site">${escapeHtml(person.site||person.province||'')}</p><p class="coach-profile">${escapeHtml(person.profile||'')}</p>${email}</div>
  </article>`;
}
function applyCdpFilter(){
  const filter=el.coaches.querySelector('.cdp-province-filter');
  if(!filter) return;
  const province=filter.value;
  const cards=[...el.coaches.querySelectorAll('.cdp-card')];
  let shown=0;
  cards.forEach(card=>{
    const matches=!province||card.dataset.province===province;
    card.hidden=!matches;
    if(matches) shown++;
  });
  const status=el.coaches.querySelector('.cdp-filter-status');
  if(status){
    status.hidden=!cards.length;
    status.textContent=cards.length
      ? (province?`Showing ${shown} CDP ${shown===1?'profile':'profiles'} in ${province}`:`Showing all ${cards.length} CDP ${cards.length===1?'profile':'profiles'}`)
      : '';
  }
}
function money(value){
  const n=Number(String(value||'').replace(/[^\d.-]/g,''));
  return Number.isFinite(n)&&n>0?new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(n):'';
}
let msmeRows=parseCsv(MSME_FALLBACK_CSV);

/* ---------- panel ---------- */
const panel=document.getElementById('panel');
const el={breadcrumb:'pBreadcrumb',tag:'pTag',title:'pTitle',role:'pRole',body:'pBody',featureLink:'pFeatureLink',pathways:'pPathways',partner:'pPartner',pillars:'pPillars',infographic:'pInfographic',figs:'pFigs',coaches:'pCoaches',team:'pTeam',publications:'pPublications',training:'pTraining',stories:'pStories',impactStories:'pImpactStories',updates:'pUpdates',marketplace:'pMarketplace',contact:'pContact',cta:'pCta',chips:'pChips',linksH:'pLinksH'};
Object.keys(el).forEach(k=>el[k]=document.getElementById(el[k]));

function renderMarketplace(){
  const grouped=new Map();
  msmeRows.forEach(row=>{
    if(!grouped.has(row.business_id)) grouped.set(row.business_id,{...row,funders:[]});
    if(row.funder_name) grouped.get(row.business_id).funders.push(row);
  });
  const businesses=[...grouped.values()];
  const cards=businesses.map(b=>{
    const image=safeAsset(b.image);
    const donation=safeWebUrl(b.donation_url);
    const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.contact_email||'')?b.contact_email:'info@finmark.org.za';
    const goal=money(b.goal_zar), raised=money(b.raised_zar);
    const support=donation
      ? `<a class="business-support" href="${escapeHtml(donation)}" target="_blank" rel="noopener">Donate securely <span aria-hidden="true">↗</span></a>`
      : `<a class="business-support secondary" href="mailto:${escapeHtml(email)}?subject=${encodeURIComponent(`Support ${b.business_name}`)}">Enquire about supporting</a>`;
    return `<article class="business-card">
      ${image?`<img src="${escapeHtml(image)}" alt="${escapeHtml(b.business_name)}" loading="lazy" decoding="async">`:''}
      <div class="business-copy"><span class="business-category">${escapeHtml(b.category)}</span><h4>${escapeHtml(b.business_name)}</h4>
      <p class="business-owner">${escapeHtml(b.owner)}${b.location?` · ${escapeHtml(b.location)}`:''}</p>
      <p>${escapeHtml(b.summary)}</p>
      <details><summary>View business details</summary><dl>
        <div><dt>Status</dt><dd>${escapeHtml(b.verification_status||'Awaiting verification')}${b.last_verified?` · ${escapeHtml(b.last_verified)}`:''}</dd></div>
        ${goal?`<div><dt>Support goal</dt><dd>${goal}</dd></div>`:''}${raised?`<div><dt>Support recorded</dt><dd>${raised}</dd></div>`:''}
      </dl></details>${support}</div>
    </article>`;
  }).join('');
  const funders=APPROVED_FUNDERS.map(([name,description])=>`<li><strong>${escapeHtml(name)}</strong><small>${escapeHtml(description)}</small></li>`).join('');
  el.marketplace.innerHTML=`<div class="marketplace-heading"><div><h3>Featured participant-run businesses</h3><p>${businesses.length} enterprise profiles currently listed</p></div></div>
    <div class="business-grid">${cards||'<p>No businesses are listed yet.</p>'}</div>
    <section class="funders-wall"><h3>Funders wall</h3><p>Recognising individuals, organisations and institutions that have contributed to the growth of participant-run enterprises.</p><ul>${funders}</ul></section>`;
}

async function loadMsmeDirectory(){
  try{
    const response=await fetch(MSME_XLSX_PATH,{cache:'no-store'});
    if(!response.ok) throw new Error(`Excel request failed (${response.status})`);
    const parsed=parseExcel(await response.arrayBuffer());
    if(parsed.length) msmeRows=parsed;
  }catch(_){}
  if(selKey==='MSME') renderMarketplace();
}
loadMsmeDirectory();

function select(k,{syncMenu=true,updateUrl=true}={}){
  if(!NODES[k]) return;
  selKey=k;
  markVisited(k);
  const n=NODES[k];
  el.breadcrumb.innerHTML = `<span>${escapeHtml(SHELL_NAME[n.shell])}</span><span aria-hidden="true">›</span><strong aria-current="page">${escapeHtml(n.title)}</strong>`;
  el.tag.textContent = n.tag || SHELL_NAME[n.shell];
  el.title.textContent = n.title;
  el.role.textContent = n.role;
  el.body.innerHTML = n.body.map(t=>`<p>${t}</p>`).join('');
  el.featureLink.innerHTML = n.featureLink ? `<button type="button" data-go="${n.featureLink.go}"><span><strong>${n.featureLink.label}</strong><small>${n.featureLink.description}</small></span><b aria-hidden="true">→</b></button>` : '';
  el.featureLink.style.display = n.featureLink?'block':'none';
  el.pathways.innerHTML = (n.pathways||[]).length ? `<h3>Livelihood pathways</h3><div class="pathway-grid">${n.pathways.map((pathway,index)=>`
    <article class="pathway-card"><span class="pathway-number">0${index+1}</span><h4>${pathway.title}</h4><p>${pathway.body}</p>${pathway.href?`<a href="${pathway.href}">${pathway.link} <span aria-hidden="true">→</span></a>`:''}</article>`).join('')}</div>` : '';
  el.pathways.style.display = (n.pathways||[]).length?'block':'none';
  el.partner.innerHTML = n.partner ? `<a class="partner-card${n.partner.inverse?' inverse':''}" href="${n.partner.url}" target="_blank" rel="noopener">
    <span class="partner-logo"><img src="${n.partner.logo}" alt="${n.partner.name} logo" loading="lazy" decoding="async"></span>
    <span class="partner-site"><strong>Visit partner website</strong><span>${n.partner.url.replace(/^https?:\/\//,'')}</span></span>
  </a>` : '';
  el.partner.style.display = n.partner?'block':'none';
  el.pillars.innerHTML = (n.pillarLinks||[]).length ? `<h3>Explore the four pillars</h3><div class="pillar-link-grid">${n.pillarLinks.map((key,index)=>`
    <button type="button" data-go="${key}"><span>${String(index+1).padStart(2,'0')}</span>${NODES[key].title}</button>`).join('')}</div>` : '';
  el.pillars.style.display = (n.pillarLinks||[]).length?'block':'none';
  el.infographic.innerHTML = n.infographic ? `<h3>${n.infographic.title}</h3><figure class="process-figure">
    <a href="${n.infographic.image}" target="_blank" rel="noopener" aria-label="Open ${n.infographic.title} at full size">
      <img src="${n.infographic.image}" alt="${n.infographic.title}" width="916" height="595">
    </a>
    <figcaption>${n.infographic.caption}</figcaption>
  </figure><a class="process-link" href="${n.infographic.image}" target="_blank" rel="noopener">Open the full-size process <span aria-hidden="true">↗</span></a>` : '';
  el.infographic.style.display = n.infographic?'block':'none';
  el.figs.innerHTML = (n.figs||[]).map(([v,l,icon])=>`<div class="fig${icon?' has-icon':''}">${icon&&FIG_ICONS[icon]?`<span class="fig-icon" aria-hidden="true">${FIG_ICONS[icon]}</span>`:''}<b>${v}</b><span>${l}</span></div>`).join('');
  el.figs.style.display = (n.figs&&n.figs.length)?'flex':'none';
  const coachProfiles=n.coaches||[], cdpProfiles=n.cdps||[], cdpProvinces=n.cdpProvinces||[];
  el.coaches.innerHTML = coachProfiles.length ? `<h3>Meet the Linkages Facilitators</h3><div class="coach-grid">${coachProfiles.map(c=>coachCardMarkup(c)).join('')}</div>
    <section class="cdp-section" aria-labelledby="cdpHeading">
      <div class="cdp-heading"><div><span>Coaching network</span><h3 id="cdpHeading">Community Development Practitioners (CDPs)</h3></div>
        <label class="cdp-filter"><span>Filter by province</span><select class="cdp-province-filter"><option value="">All provinces</option>${cdpProvinces.map(province=>`<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`).join('')}</select></label>
      </div>
      <p class="cdp-filter-status" role="status" aria-live="polite" hidden></p>
      <div class="coach-grid cdp-grid">${cdpProfiles.map(c=>coachCardMarkup(c,{cdp:true})).join('')}</div>
    </section>` : '';
  el.coaches.style.display = (n.coaches&&n.coaches.length)?'block':'none';
  applyCdpFilter();
  el.team.innerHTML = (n.team||[]).length ? `<h3>${n.teamHeading||'Core programme team'}</h3><div class="team-grid">${n.team.map(person=>`
    <article class="team-card">
      <img src="${person.image}" alt="Portrait of ${person.name}" width="600" height="600" loading="lazy" decoding="async">
      <div><h4>${person.name}</h4><p>${person.role}</p>${person.email?`<a href="mailto:${person.email}">${person.email}</a>`:''}</div>
    </article>`).join('')}</div>` : '';
  el.team.setAttribute('aria-label',n.teamHeading||'Core programme team');
  el.team.style.display = (n.team&&n.team.length)?'block':'none';
  el.publications.innerHTML = (n.publications||[]).length ? `<h3>${n.publicationsHeading||'Learning publications'}</h3><div class="publication-grid">${n.publications.map(item=>`
    <article class="publication-card">
      <a class="publication-cover" href="${item.pdf}" target="_blank" rel="noopener" aria-label="Open ${item.number}: ${item.title}"><img src="${item.image}" alt="Cover of ${item.number}" width="910" height="910" loading="lazy" decoding="async"></a>
      <div><span class="publication-number">${item.number}</span><h4>${item.title}</h4><p>${item.summary}</p><a class="publication-link" href="${item.pdf}" target="_blank" rel="noopener">Open PDF <span aria-hidden="true">↗</span></a></div>
    </article>`).join('')}</div>` : '';
  el.publications.style.display = (n.publications&&n.publications.length)?'block':'none';
  el.training.innerHTML = (n.training||[]).length ? `<h3>Skills, enterprise and livelihood activity</h3><p class="section-intro"><strong>${n.training.length} training and livelihood moments</strong> from across the programme sites, including practical skills, enterprise support, work opportunities and completion milestones.</p><div class="training-gallery" role="list" aria-label="All training and livelihood activity">${n.training.map(item=>`
    <figure class="training-card" role="listitem">
      <img src="${item.image}" alt="${item.title}" width="1024" height="768" loading="lazy" decoding="async">
      <figcaption><strong>${item.title}</strong><span>${item.caption}</span></figcaption>
    </figure>`).join('')}</div>` : '';
  el.training.style.display = (n.training&&n.training.length)?'block':'none';
  const localFile=location.protocol==='file:';
  el.stories.innerHTML = (n.stories||[]).length ? `<h3>Watch their stories</h3><p class="section-intro">These participant films show how social protection, training, coaching and mentorship come together in people’s lives.</p><div class="story-grid">${n.stories.map(story=>`
    <article class="story-card">
      <div class="video-frame">${localFile
        ? `<a class="video-preview" href="${story.url}" target="_blank" rel="noopener" aria-label="Watch ${story.title} on YouTube"><img src="https://i.ytimg.com/vi/${story.videoId}/hqdefault.jpg" alt="" loading="lazy"><span class="video-play" aria-hidden="true">▶</span><span class="video-preview-label">Watch on YouTube</span></a>`
        : `<iframe src="${story.embed}" title="${story.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`}</div>
      <h4>${story.title}</h4><p>${story.description}</p><a href="${story.url}" target="_blank" rel="noopener">Watch on YouTube <span aria-hidden="true">↗</span></a>
    </article>`).join('')}</div>` : '';
  el.stories.style.display = (n.stories&&n.stories.length)?'block':'none';
  el.impactStories.innerHTML = (n.impactStories||[]).length ? renderImpactStories(n.impactStories) : '';
  el.impactStories.style.display = (n.impactStories&&n.impactStories.length)?'block':'none';
  el.updates.innerHTML = (n.updates||[]).length ? `<div class="updates-list">${n.updates.map(item=>item.url?`
    <article class="update-card"><time datetime="${escapeHtml(item.datetime)}">${escapeHtml(item.date)}</time><h3><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)} <span aria-hidden="true">↗</span></a></h3></article>`:`
    <article class="update-card upcoming"><div class="update-meta"><time datetime="${escapeHtml(item.datetime)}">${escapeHtml(item.date)}</time><span>${escapeHtml(item.status)}</span></div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></article>`).join('')}</div>` : '';
  el.updates.style.display = (n.updates&&n.updates.length)?'block':'none';
  if(n.marketplace) renderMarketplace(); else el.marketplace.innerHTML='';
  el.marketplace.style.display = n.marketplace?'block':'none';
  el.contact.innerHTML = n.contact ? `<h3>${n.contact.title}</h3><p>${n.contact.body}</p><p class="contact-note">${n.contact.note}</p><div class="contact-actions">
    <a href="mailto:${n.contact.email}">${n.contact.email}</a>
    <a href="tel:${n.contact.phone.replace(/[^+\d]/g,'')}">${n.contact.phone}</a>
  </div>` : '';
  el.contact.style.display = n.contact?'block':'none';
  el.cta.textContent = n.cta || 'Learn more';
  const hasCta=!!(n.url||n.go||n.anchor);
  el.cta.disabled=!hasCta;
  el.cta.setAttribute('aria-disabled',String(!hasCta));
  el.cta.onclick = n.go
    ? ()=>select(n.go,{syncMenu:false})
    : n.anchor
      ? ()=>document.getElementById(n.anchor)?.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'})
    : n.url
      ? ()=>{if(n.url.startsWith('mailto:')) window.location.href=n.url; else window.open(n.url,'_blank','noopener');}
      : null;
  const related = neighbours[k].slice(0,4);
  const relatedBlock=el.linksH.closest('.plinks');
  relatedBlock.style.display = related.length?'block':'none';
  el.chips.innerHTML = related.map(m=>`<button class="chip" data-go="${m}"><span>${escapeHtml(NODES[m].title)}</span><b aria-hidden="true">→</b></button>`).join('');
  panel.classList.add('open');
  panel.scrollTop=0;
  if(updateUrl){
    const hash=`#${NODE_SLUG[k]}`;
    if(location.hash!==hash) history.pushState({node:k},'',hash);
  }
  layout();
  faceCamera(k);
  markCurrent(k);
  openGroup(syncMenu && k!=='CORE' ? n.shell : null);
}
function close({updateUrl=true}={}){
  selKey=null; panel.classList.remove('open'); markCurrent(null); openGroup(null); layout();
  if(updateUrl&&location.hash) history.pushState({},'',`${location.pathname}${location.search}`);
}
document.getElementById('pClose').addEventListener('click',close);
el.chips.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]'); if(b) select(b.dataset.go,{syncMenu:false});
});
el.pillars.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]'); if(b) select(b.dataset.go,{syncMenu:false});
});
el.featureLink.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]'); if(b) select(b.dataset.go,{syncMenu:false});
});
el.coaches.addEventListener('change',e=>{
  if(e.target.matches('.cdp-province-filter')) applyCdpFilter();
});
el.impactStories.addEventListener('change',e=>{
  if(e.target.matches('[data-story-filter]')) applyImpactStoryFilters();
});
el.impactStories.addEventListener('click',e=>{
  if(!e.target.closest('.story-filter-reset')) return;
  el.impactStories.querySelectorAll('[data-story-filter]').forEach(select=>select.value='');
  applyImpactStoryFilters();
});
document.addEventListener('click',e=>{
  const link=e.target.closest('[data-open-node]');
  if(link&&NODES[link.dataset.openNode]){e.preventDefault();select(link.dataset.openNode);}
});

/* rotate the chosen node to the front, offset clear of the core */
const YAW_OFF=-0.60, PITCH_OFF=0.26;
function faceCamera(k){
  const p=NODES[k].p;
  if(k==='CORE'){ tYaw=0.5; tPitch=-0.18; return; }
  const m=Math.hypot(p.x,p.z);
  let a = m<1e-6 ? tYaw : Math.atan2(p.x,p.z)+Math.PI;
  // keep the turn short
  while(a-tYaw>Math.PI) a-=2*Math.PI;
  while(a-tYaw<-Math.PI) a+=2*Math.PI;
  tYaw = a + YAW_OFF;
  tPitch = Math.max(-0.95,Math.min(0.95, Math.atan2(-p.y,Math.max(m,1)) + PITCH_OFF));
}

/* ---------- rail ---------- */
const rail=document.getElementById('rail');
const VISITED_KEY='gbl-visited-sections';
let visitedKeys=new Set();
try{
  const stored=JSON.parse(sessionStorage.getItem(VISITED_KEY)||'[]');
  visitedKeys=new Set(stored.filter(k=>NODES[k]));
}catch(_){ visitedKeys=new Set(); }

rail.querySelectorAll('.railgroup').forEach(g=>{
  const s=g.dataset.shell;
  const wrap=document.createElement('div');
  wrap.innerHTML = byShell[s].map(k=>`<button type="button" data-go="${k}">${NODES[k].title}</button>`).join('');
  g.querySelector('.railitems').appendChild(wrap);
  const count=g.querySelector('.num');
  if(count) count.textContent=byShell[s].length;
});
function paintVisited(){
  rail.querySelectorAll('.railitems button').forEach(b=>
    b.setAttribute('data-visited',String(visitedKeys.has(b.dataset.go))));
  rail.querySelector('.railcore').setAttribute('data-visited',String(visitedKeys.has('CORE')));
  rail.querySelectorAll('.railgroup').forEach(g=>{
    const seen=[...visitedKeys].some(k=>NODES[k]&&NODES[k].shell===g.dataset.shell);
    g.querySelector('.railhead').setAttribute('data-visited',String(seen));
  });
}
function markVisited(k){
  if(!NODES[k]) return;
  visitedKeys.add(k);
  try{ sessionStorage.setItem(VISITED_KEY,JSON.stringify([...visitedKeys])); }catch(_){}
  paintVisited();
}
paintVisited();
function railChanged(){ layout(); setTimeout(layout,380); }
function openGroup(s){
  rail.querySelectorAll('.railgroup').forEach(g=>{
    const on = g.dataset.shell===s;
    g.classList.toggle('open',on);
    g.querySelector('.railhead').setAttribute('aria-expanded',String(on));
  });
  shellFilter = s;
  railChanged();
}
rail.addEventListener('click',e=>{
  const head=e.target.closest('.railhead');
  if(head){
    const s=head.closest('.railgroup').dataset.shell;
    openGroup(shellFilter===s?null:s);
    return;
  }
  const go=e.target.closest('[data-go]');
  if(go) select(go.dataset.go,{syncMenu:false});
});
function markCurrent(k){
  rail.querySelectorAll('.railitems button').forEach(b=>
    b.setAttribute('aria-current', b.dataset.go===k ? 'true':'false'));
  rail.querySelector('.railcore').setAttribute('aria-current',k==='CORE'?'true':'false');
  rail.querySelectorAll('.railgroup').forEach(g=>
    g.querySelector('.railhead').setAttribute('aria-current',k && NODES[k].shell===g.dataset.shell?'true':'false'));
}
function markNavHover(k){
  if(typeof rail==='undefined') return;
  rail.querySelectorAll('[data-go]').forEach(b=>
    b.setAttribute('data-node-hover',String(b.dataset.go===k)));
  rail.querySelectorAll('.railgroup').forEach(g=>
    g.querySelector('.railhead').setAttribute('data-node-hover',String(k&&NODES[k]&&NODES[k].shell===g.dataset.shell)));
}
rail.addEventListener('pointerover',e=>{
  const b=e.target.closest('[data-go]');
  if(b){ hoverKey=b.dataset.go; markNavHover(hoverKey); }
});
rail.addEventListener('pointerleave',()=>{ hoverKey=null; markNavHover(null); });
rail.addEventListener('focusin',e=>{
  const b=e.target.closest('[data-go]');
  if(b){ hoverKey=b.dataset.go; markNavHover(hoverKey); }
});
rail.addEventListener('focusout',e=>{
  if(!rail.contains(e.relatedTarget)){ hoverKey=null; markNavHover(null); }
});
document.getElementById('recentre').addEventListener('click',()=>{
  tYaw=0.5; tPitch=-0.18; tZoom=1; close(); openGroup(null); layout();
});
document.getElementById('zoomOut').addEventListener('click',()=>{
  tZoom=Math.max(0.62,tZoom/1.18);
});
document.getElementById('zoomIn').addEventListener('click',()=>{
  tZoom=Math.min(1.85,tZoom*1.18);
});
const spinBtn=document.getElementById('spin');
spinBtn.addEventListener('click',()=>{
  spinning=!spinning;
  spinBtn.textContent = spinning?'Pause rotation':'Resume rotation';
  spinBtn.setAttribute('aria-pressed',String(spinning));
});
if(reduce){ spinBtn.textContent='Resume rotation'; spinBtn.setAttribute('aria-pressed','false'); }

function relabelRail(){
  rail.querySelectorAll('[data-full]').forEach(b=>{
    const t = wide ? b.dataset.full : b.dataset.short;
    const label = b.querySelector('.navlabel');
    if(label) label.textContent = t;
  });
}
const _layout = layout;
layout = function(){ _layout(); relabelRail(); };
markCurrent('CORE');
layout();

/* ---------- section finder and shareable node URLs ---------- */
const findToggle=document.getElementById('findToggle');
const findPanel=document.getElementById('sectionFinderPanel');
const findInput=document.getElementById('sectionSearch');
const findResults=document.getElementById('sectionResults');
function renderFindResults(query=''){
  const q=query.trim().toLowerCase();
  const matches=keys.filter(k=>{
    const n=NODES[k];
    return !q||`${n.title} ${n.tag||''} ${n.role||''} ${SHELL_NAME[n.shell]}`.toLowerCase().includes(q);
  });
  findResults.innerHTML=matches.length
    ? matches.map(k=>`<button type="button" data-go="${k}" role="option"><span>${escapeHtml(NODES[k].title)}</span><small>${escapeHtml(SHELL_NAME[NODES[k].shell])}</small></button>`).join('')
    : '<p class="find-empty">No matching section found.</p>';
}
function setFinder(open){
  findPanel.hidden=!open;
  findToggle.setAttribute('aria-expanded',String(open));
  if(open){
    renderFindResults(findInput.value);
    requestAnimationFrame(()=>findInput.focus());
  }
}
findToggle.addEventListener('click',()=>setFinder(findPanel.hidden));
findInput.addEventListener('input',()=>renderFindResults(findInput.value));
findResults.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]');
  if(!b) return;
  select(b.dataset.go,{syncMenu:false});
  setFinder(false);
});
document.addEventListener('click',e=>{
  if(!findPanel.hidden&&!e.target.closest('.section-finder')) setFinder(false);
});
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  if(!findPanel.hidden){setFinder(false);findToggle.focus();}
  else close();
});
function syncFromUrl(){
  let slug='';
  try{ slug=decodeURIComponent(location.hash.slice(1)); }catch(_){ slug=location.hash.slice(1); }
  const k=SLUG_NODE[slug];
  if(k) select(k,{syncMenu:false,updateUrl:false});
  else if(selKey) close({updateUrl:false});
}
window.addEventListener('popstate',syncFromUrl);

/* ---------- keyboard / screen-reader index ---------- */
const srIndex=document.getElementById('srIndex');
srIndex.innerHTML = keys.map(k=>`<button type="button" data-go="${k}">${NODES[k].title} — ${SHELL_NAME[NODES[k].shell]}</button>`).join('');
srIndex.addEventListener('click',e=>{
  const b=e.target.closest('[data-go]'); if(b) select(b.dataset.go);
});
srIndex.addEventListener('focusin',e=>{
  const b=e.target.closest('[data-go]'); if(b){ hoverKey=b.dataset.go; }
});
srIndex.addEventListener('focusout',()=>{ hoverKey=null; });
if(location.hash) syncFromUrl();
