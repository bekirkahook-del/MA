---
title: The Circle
tags: [ma-prep, bots, circle, hub]
created: 2026-11-25
project: M&A Prep
circle_role: overview
status: built, not scheduled
---

# The Circle

The bots are not independent. Each one's output is another one's input, and a few can stop others. That is what makes it a circle instead of eight scripts.

```mermaid
flowchart LR
  subgraph SENSE[Sensors]
    qa["Question QA Bot"]
    health["Site Health Bot"]
    freshness["Content Freshness Bot"]
    cost["Cost Guard Bot"]
    funnel["Funnel Bot"]
    billing["Billing Audit Bot"]
    feedbot["Superfeedbackbot"]
    seo["SEO Meta Bot"]
    sitemap["Sitemap Bot"]
    schema["Structured Data Bot"]
    a11y["Accessibility Bot"]
    perf["Performance Budget Bot"]
    secrets["Secrets and Headers Bot"]
    duplicate["Duplicate Content Bot"]
    readability["Readability Bot"]
    reps["Rep Auditor Bot"]
    coverage["Coverage Gap Bot"]
    testcov["Test Coverage Bot"]
    deadcode["Dead Code Bot"]
    linkgraph["Internal Link Bot"]
    thin["Thin Content Bot"]
    cannibal["Keyword Cannibalization Bot"]
    typos["Typo Bot"]
    mojibake["Encoding Bot"]
    images["Broken Image Bot"]
    redirects["Redirect Bot"]
    feed["Feed Bot"]
    dupids["Duplicate ID Bot"]
    consolelog["Leftover Debug Bot"]
    localhost["Localhost Bot"]
    extlinks["External Link Bot"]
    pwa["Install (PWA) Bot"]
    timeouts["Timeout Bot"]
    envvars["Env Var Bot"]
    deps["Dependency Bot"]
    wireschema["Wire Schema Bot"]
    companies["Company List Bot"]
    privacy["Privacy Bot"]
    pricing["Pricing Consistency Bot"]
    claims["Claims Bot"]
    qlength["Question Length Bot"]
    qyears["Stale Year Bot"]
    explain["Explanation Quality Bot"]
    testrunner["Test Runner Bot"]
    drift["Drift Bot"]
    consoleerrors["Console Error Bot"]
    mobile["Mobile Layout Bot"]
    authdiag["Sign-up and Sign-in Diagnostic Bot"]
    logscore["Post Log Bot"]
    scoreboardsync["Scoreboard Sync Bot"]
    ideaavg["Idea Average Bot"]
    growthrate["Growth Rate Bot"]
    compound["Compounding Bot"]
    spikes["Spike Bot"]
    flops["Flop Bot"]
    loserwatch["Loser Watch Bot"]
    saturation["Saturation Bot"]
    reposts["Repost Bot"]
    hookstats["Hook Bot"]
    stylerotation["Style Rotation Bot"]
    winnerboard["Winner Board Bot"]
    experiments["Experiment Bot"]
    promotions["Promotion Bot"]
    retirements["Retirement Bot"]
    finalnumbers["Final Numbers Bot"]
    slotplan["Slot Planner"]
    backlog["Topic Backlog Bot"]
    questionmine["Question Mine Bot"]
    newsjack["Newsjack Bot"]
    sequelqueue["Series Queue Bot"]
    characterladder["Character Series Bot"]
    timing["Timing Bot"]
    ctarotation["Caption Ending Bot"]
    hookwriter["Hook Template Bot"]
    repurpose["Repurpose Bot"]
    platformroute["Platform Router Bot"]
    dailymix["Daily Mix Bot"]
    gapdays["Gap Day Bot"]
    videoperday["Video Streak Bot"]
    ctagate["CTA Gate"]
    sourcegate["Source Gate"]
    rendergate["Render Gate"]
    blackoutgate["Blackout Gate"]
    capgate["TikTok Cap Gate"]
    utmgate["Link Gate"]
    videolog["Video Log Bot"]
    dupegate["Duplicate Post Gate"]
    clichegate["Placeholder Gate"]
    slidetext["Slide Readability Gate"]
    quoragap["Quora Cadence Bot"]
    quoradup["Quora Repeat Bot"]
    quoralink["Quora Link Rule Bot"]
    quoraurls["Quora Log Bot"]
    dirnext["Directory Bot"]
    dircopy["Listing Copy Bot"]
    phready["Product Hunt Ready Bot"]
    ogcard["Share Card Bot"]
    sociallinks["Social Link Bot"]
    bumps["Outreach Bump Bot"]
    pendingoutreach["Pending Outreach Bot"]
    deployplan["Deploy Planner"]
    stagingage["Staging Age Bot"]
    buildfree["Free Merge Bot"]
    creditburn["Credit Burn Bot"]
    homeguard["Home Page Guard"]
    calpast["Calendar Freshness Bot"]
    earnpast["Earnings Freshness Bot"]
    newsage["News Age Bot"]
    dealsage["Deals Freshness Bot"]
    dealsmath["Deal Value Bot"]
    quizanswer["News Quiz Bot"]
    tickernulls["Ticker Gap Bot"]
    testimonials["Testimonial Slot Bot"]
    legaladdress["Mailing Address Bot"]
    refundwindow["Refund Window Bot"]
    emailfrom["Sender Address Bot"]
    feedbotidle["Feedback Bot Idle Bot"]
    digestage["Digest Age Bot"]
    canonical["Canonical Tag Bot"]
    ogimage["Guide Share Image Bot"]
    answerskew["Answer Position Bot"]
    mkrankedhooks["Hook Maker: ranked schools"]
    mkrankedcaption["Caption Maker: ranked schools"]
    mkrankedcta["CTA Picker: ranked schools"]
    mkrankedscript["Script Outline Maker: ranked schools"]
    mkrankedslides["Slide Plan Maker: ranked schools"]
    mkrankedtitle["Title Card Maker: ranked schools"]
    mkrankedsequel["Sequel Maker: ranked schools"]
    mkrankedpin["Pinned Comment Maker: ranked schools"]
    mkcharacterhooks["Hook Maker: character stories"]
    mkcharactercaption["Caption Maker: character stories"]
    mkcharactercta["CTA Picker: character stories"]
    mkcharacterscript["Script Outline Maker: character stories"]
    mkcharacterslides["Slide Plan Maker: character stories"]
    mkcharactertitle["Title Card Maker: character stories"]
    mkcharactersequel["Sequel Maker: character stories"]
    mkcharacterpin["Pinned Comment Maker: character stories"]
    mktieredhooks["Hook Maker: tiered interview questions"]
    mktieredcaption["Caption Maker: tiered interview questions"]
    mktieredcta["CTA Picker: tiered interview questions"]
    mktieredscript["Script Outline Maker: tiered interview questions"]
    mktieredslides["Slide Plan Maker: tiered interview questions"]
    mktieredtitle["Title Card Maker: tiered interview questions"]
    mktieredsequel["Sequel Maker: tiered interview questions"]
    mktieredpin["Pinned Comment Maker: tiered interview questions"]
    mkmarkethooks["Hook Maker: live market news"]
    mkmarketcaption["Caption Maker: live market news"]
    mkmarketcta["CTA Picker: live market news"]
    mkmarketscript["Script Outline Maker: live market news"]
    mkmarketslides["Slide Plan Maker: live market news"]
    mkmarkettitle["Title Card Maker: live market news"]
    mkmarketsequel["Sequel Maker: live market news"]
    mkmarketpin["Pinned Comment Maker: live market news"]
    mkleaguehooks["Hook Maker: league tables"]
    mkleaguecaption["Caption Maker: league tables"]
    mkleaguecta["CTA Picker: league tables"]
    mkleaguescript["Script Outline Maker: league tables"]
    mkleagueslides["Slide Plan Maker: league tables"]
    mkleaguetitle["Title Card Maker: league tables"]
    mkleaguesequel["Sequel Maker: league tables"]
    mkleaguepin["Pinned Comment Maker: league tables"]
    orohioqueries["Club Finder Queries: Ohio"]
    orohioroster["School Roster: Ohio"]
    orohiodedupe["Region De-dupe: Ohio"]
    orbigtenqueries["Club Finder Queries: Big Ten"]
    orbigtenroster["School Roster: Big Ten"]
    orbigtendedupe["Region De-dupe: Big Ten"]
    orsecqueries["Club Finder Queries: SEC"]
    orsecroster["School Roster: SEC"]
    orsecdedupe["Region De-dupe: SEC"]
    oraccqueries["Club Finder Queries: ACC"]
    oraccroster["School Roster: ACC"]
    oraccdedupe["Region De-dupe: ACC"]
    orbig12queries["Club Finder Queries: Big 12"]
    orbig12roster["School Roster: Big 12"]
    orbig12dedupe["Region De-dupe: Big 12"]
    orivyqueries["Club Finder Queries: Ivy League"]
    orivyroster["School Roster: Ivy League"]
    orivydedupe["Region De-dupe: Ivy League"]
    orwestqueries["Club Finder Queries: West"]
    orwestroster["School Roster: West"]
    orwestdedupe["Region De-dupe: West"]
    ornycqueries["Club Finder Queries: New York area"]
    ornycroster["School Roster: New York area"]
    ornycdedupe["Region De-dupe: New York area"]
    ortexasqueries["Club Finder Queries: Texas"]
    ortexasroster["School Roster: Texas"]
    ortexasdedupe["Region De-dupe: Texas"]
    orsouthqueries["Club Finder Queries: Southeast"]
    orsouthroster["School Roster: Southeast"]
    orsouthdedupe["Region De-dupe: Southeast"]
    fxdesclong["Meta Description Fixer"]
    fxtitlelong["Title Length Fixer"]
    fxcanon["Canonical Fixer"]
    fxogimg["OG Image Fixer"]
    fximgalt["Image Alt Fixer"]
    fxlang["Language Tag Fixer"]
    fxviewport["Viewport Fixer"]
    fxh1["Missing H1 Fixer"]
    fxh1multi["Double H1 Fixer"]
    fxhttp["Insecure Link Fixer"]
    fxrel["Link Safety Fixer"]
    fxemptyhref["Empty Link Fixer"]
    fxtodo["Leftover Text Fixer"]
    fxspaces["Double Space Fixer"]
    fxtwitter["Twitter Card Fixer"]
    fxtheme["Theme Color Fixer"]
    fxmailto["Email Link Fixer"]
    fxdecksrc["Deck Source Fixer"]
    fxdeckcta["Deck CTA Fixer"]
    fxrendercount["Render Count Fixer"]
    fxwirepast["Wire Past Rows Fixer"]
    fxtickernull["Ticker Null Fixer"]
    fxpostdate["Log Date Fixer"]
    fxfamily["Idea Type Fixer"]
    fxposted["Posted Log Fixer"]
    fxpunch["Punch Log Fixer"]
    fxtopics["Topics Gap Fixer"]
    fxlegaladdr["Legal Address Fixer"]
    fxemailtmpl["Email Template Fixer"]
    fxswver["Service Worker Fixer"]
    fxsitemap["Sitemap Fixer"]
    mdfollowersnow["Metricool Followers Reader"]
    mdfollowerstrend["Metricool Followers Trend"]
    mdviewsnow["Metricool Views Reader"]
    mdviewstrend["Metricool Views Trend"]
    mdreachnow["Metricool Reach Reader"]
    mdreachtrend["Metricool Reach Trend"]
    mdlikesnow["Metricool Likes Reader"]
    mdlikestrend["Metricool Likes Trend"]
    mdcommentsnow["Metricool Comments Reader"]
    mdcommentstrend["Metricool Comments Trend"]
    mdsharesnow["Metricool Shares Reader"]
    mdsharestrend["Metricool Shares Trend"]
    mdsavesnow["Metricool Saves Reader"]
    mdsavestrend["Metricool Saves Trend"]
    mdpostsnow["Metricool Posts published Reader"]
    mdpoststrend["Metricool Posts published Trend"]
    mdvisitsnow["Metricool Profile visits Reader"]
    mdvisitstrend["Metricool Profile visits Trend"]
    mdclicksnow["Metricool Link clicks Reader"]
    mdclickstrend["Metricool Link clicks Trend"]
    sfdupeemail["Duplicate Email Guard"]
    sfdaycap["Daily Email Cap Guard"]
    sfschoolcap["School Cap Guard"]
    sfwindow["Send Window Guard"]
    sfsuppress["Opt-out Guard"]
    sfoptout["Opt-out Line Guard"]
    sfaddr["Mailing Address Guard"]
    sflength["Email Length Guard"]
    sfclaims["Claim Words Guard"]
    sfunsourced["Unsourced Number Guard"]
    sfblackout["Blackout Guard"]
    sftiktokcap["TikTok Cap Guard"]
    sfhours["Post Hours Guard"]
    sfquoramuted["Quora Mute Guard"]
    sfsentdates["Sent Log Hygiene Guard"]
    sfhome["Home Baseline Guard"]
    seobriefibinterview["SEO Brief: Investment banking interview questions"]
    seobrieflbo["SEO Brief: LBO model"]
    seobriefdcf["SEO Brief: DCF"]
    seobriefaccretion["SEO Brief: Accretion and dilution"]
    seobriefcomps["SEO Brief: Comparable company analysis"]
    seobriefperecruit["SEO Brief: Private equity recruiting"]
    seobriefsuperday["SEO Brief: Superday"]
    seobriefnetwork["SEO Brief: Networking and cold email"]
    seobriefresume["SEO Brief: Resume"]
    seobriefrestructuring["SEO Brief: Restructuring"]
    seobriefhedgefund["SEO Brief: Hedge funds"]
    seobriefaccounting["SEO Brief: Accounting for finance interviews"]
    seothin["Thin Page Checker"]
    seoh2["Heading Depth Checker"]
    seoinlinks["Internal Link Count Checker"]
    seofaq["FAQ Schema Checker"]
    seoarticle["Article Schema Checker"]
    seotitlekw["Title Keyword Checker"]
    seodescmiss["Description Checker"]
    seodupetitle["Duplicate Title Checker"]
    seodupedesc["Duplicate Description Checker"]
    seoupdated["Freshness Checker"]
    seocta["Guide CTA Checker"]
    seoimgalt["Image Alt Checker"]
    seoh1match["H1 Match Checker"]
    seolong["Page Length Balance Checker"]
    seoschoolconsulting["School Pages: Consulting"]
    seoschoolhedgefunds["School Pages: Hedge funds"]
    seoschoolinvestmentbanking["School Pages: Investment banking"]
    seoschoolprivateequity["School Pages: Private equity"]
    seoschoolsalesandtrading["School Pages: Sales and trading"]
    seoschoolsame["School Page Sameness Checker"]
    seoschoolgap["School Coverage Checker"]
    seoschoollink["School Hub Link Checker"]
    seorobots["Robots Checker"]
    seosmsize["Sitemap Size Checker"]
    seolastmod["Sitemap Date Checker"]
    seollms["llms.txt Checker"]
    seocanonconf["Canonical Conflict Checker"]
    seonoindex["Noindex Checker"]
    seoslug["URL Slug Checker"]
    seoweight["Page Weight Checker"]
    seoscripts["Blocking Script Checker"]
    seohttps["Sitemap HTTPS Checker"]
    seoredirect["Redirect Rule Checker"]
    seobreadcrumb["Breadcrumb Checker"]
    seoaicite["AI Citation Checker"]
    seoogtitle["Social Preview Checker"]
    seolinkcareer["Career Center Link Targets"]
    seolinkclubs["Club Resource Link Targets"]
    seolinkreddit["Community Answer Targets"]
    seolinkunlinked["Unlinked Mention Finder"]
    seolinkroundup["Roundup Page Targets"]
    seolinknewsletter["Newsletter Targets"]
    seolinkpodcast["Guest Spot Targets"]
    seolinkdir["Directory Targets"]
    seolinkwiki["Reference Page Targets"]
    seolinkfaculty["Faculty Page Targets"]
    seolinkyoutube["Video Description Targets"]
    seolinkpitch["Link Pitch Drafter"]
    lnsample["Learn Sample Size Bot"]
    lnsnapage["Learn Snapshot Age Bot"]
    lnactivation["Learn Activation Bot"]
    lnfbtally["Learn Feedback Tally Bot"]
    lnfbhard["Learn Too-Hard Bot"]
    lnlevelreach["Learn Reach Bot"]
    lnlevelstuck["Learn Drop-off Bot"]
    lnlevelstars["Learn Hard Levels Bot"]
    lnqmiss["Learn Missed Questions Bot"]
    lnqoverall["Learn Miss Rate Bot"]
    lntoolusage["Learn Tool Usage Bot"]
    lnfbask["Learn Ask Bot"]
    lnevlesson["Learn Tracking: Lessons"]
    lnevreps["Learn Tracking: Number reps"]
    lnevmock["Learn Tracking: Timed mock"]
    lnevmodel["Learn Tracking: Model Lab"]
    lnevpitch["Learn Tracking: Pitch Room"]
    lnevgap["Learn Tracking Summary Bot"]
    lntopicgap["Learn Topic Gap Bot"]
    lncert["Learn Certificate Bot"]
    lncases["Learn Case Study Bot"]
    lntemplates["Learn Template Bot"]
    lnfreehook["Learn Free Hook Bot"]
    lnladder["Learn Ladder Bot"]
    lnprice["Learn Price Bot"]
    lnguarantee["Learn Guarantee Bot"]
    lncommunity["Learn Community Bot"]
    lnproof["Learn Proof Bot"]
    lnformat["Learn Format Bot"]
    lncrawlage["Learn Crawl Age Bot"]
    lncrawlqueue["Learn Crawl Queue Bot"]
    lncrawlsrc["Learn Crawl Source Bot"]
    lnbrief["Learn Brief Bot"]
  end
  subgraph CIRCLE[The Circle]
    dispatcher["Dispatcher Bot"]
    guard["Guard Bot"]
    fixer["Fixer Bot"]
    verifier["Verifier Bot"]
    historian["Historian Bot"]
    reporter["Reporter Bot"]
    changelog["Changelog Bot"]
    release["Release Bot"]
    strategist["Strategist Bot"]
    trend["Trend Bot"]
    meta["Meta Bot"]
    contentbrief["Content Brief Bot"]
    todaylist["Today List Bot"]
  end
  subgraph DRAFT[Drafters - never send]
    retention["Retention Bot"]
    outreach["Outreach Bot"]
  end
  H((Bekir))
  qa -->|issues found| dispatcher
  health -->|issues found| dispatcher
  freshness -->|issues found| dispatcher
  cost -->|issues found| dispatcher
  funnel -->|issues found| dispatcher
  billing -->|issues found| dispatcher
  feedbot -->|issues found| dispatcher
  qa -->|verified defects count as hard evidence| feedbot
  dispatcher ==>|safe, fixable issues| fixer
  dispatcher -->|issues that need a human| reporter
  guard -.->|allow or block every patch| fixer
  health -.->|site broken = freeze all fixes| guard
  billing -.->|money problem = pause marketing| guard
  guard -.->|runs only when health and billing are clean| retention
  guard -.->|runs only when health and billing are clean| outreach
  fixer -->|patch to check| verifier
  verifier -->|re-run after a question fix| qa
  verifier -->|re-run after a data fix| freshness
  verifier -->|worked or reverted| historian
  historian -.->|demote fix types that keep failing| guard
  guard -.->|frozen issues go straight to a human| dispatcher
  cost -->|deploy budget advice| reporter
  retention -->|dry-run counts| reporter
  outreach -->|drafts waiting for approval| reporter
  verifier -->|what changed and what was reverted| reporter
  seo -->|issues found| dispatcher
  sitemap -->|issues found| dispatcher
  schema -->|issues found| dispatcher
  a11y -->|issues found| dispatcher
  perf -->|issues found| dispatcher
  secrets -->|issues found| dispatcher
  duplicate -->|issues found| dispatcher
  readability -->|issues found| dispatcher
  reps -->|issues found| dispatcher
  coverage -->|issues found| dispatcher
  testcov -->|issues found| dispatcher
  deadcode -->|issues found| dispatcher
  secrets -.->|leaked key = freeze all fixes| guard
  reps -.->|a broken practice problem blocks a release| release
  reps -->|wrong practice answers are verified defects too| qa
  duplicate -->|duplicate pages explain weak rankings| seo
  sitemap -->|pages missing from the sitemap are not indexed| seo
  deadcode -->|unreferenced code needs no test| testcov
  readability -->|hard-to-read levels need a simpler lesson| coverage
  coverage -->|levels missing lessons, reps or models| strategist
  funnel -->|where visitors leave| strategist
  dispatcher -->|open issues with evidence| strategist
  feedbot -->|what users ask for| strategist
  strategist -->|ranked build list| reporter
  verifier -->|bot fix commits join the staging queue| changelog
  changelog -->|what would ship| release
  changelog -->|plain-English change list| reporter
  dispatcher -->|open critical issues| release
  cost -->|deploy credits left| release
  release -->|GO or NO-GO| reporter
  guard -.->|kill switch blocks a GO| release
  linkgraph -->|issues found| dispatcher
  thin -->|issues found| dispatcher
  cannibal -->|issues found| dispatcher
  typos -->|issues found| dispatcher
  mojibake -->|issues found| dispatcher
  images -->|issues found| dispatcher
  redirects -->|issues found| dispatcher
  feed -->|issues found| dispatcher
  dupids -->|issues found| dispatcher
  consolelog -->|issues found| dispatcher
  localhost -->|issues found| dispatcher
  extlinks -->|issues found| dispatcher
  pwa -->|issues found| dispatcher
  timeouts -->|issues found| dispatcher
  envvars -->|issues found| dispatcher
  deps -->|issues found| dispatcher
  wireschema -->|issues found| dispatcher
  companies -->|issues found| dispatcher
  privacy -->|issues found| dispatcher
  pricing -->|issues found| dispatcher
  claims -->|issues found| dispatcher
  qlength -->|issues found| dispatcher
  qyears -->|issues found| dispatcher
  explain -->|issues found| dispatcher
  testrunner -->|issues found| dispatcher
  drift -->|issues found| dispatcher
  consoleerrors -->|issues found| dispatcher
  mobile -->|issues found| dispatcher
  authdiag -->|issues found| dispatcher
  dispatcher -->|open issue counts| trend
  dispatcher -->|the ledger to audit| meta
  trend -->|better or worse than yesterday| reporter
  meta -->|circle health| reporter
  authdiag -.->|broken sign-up blocks a release| release
  authdiag -->|where the account flow leaks| strategist
  funnel -->|sign-up funnel events| authdiag
  testrunner -->|tests passed or failed| release
  drift -.->|a merge conflict blocks a deploy| release
  drift -->|what main has that staging lacks| changelog
  pricing -->|price text must match Stripe| billing
  claims -->|marketing numbers that are wrong| strategist
  wireschema -->|bad rows before stale rows| freshness
  redirects -->|redirected URLs should not be in the sitemap| sitemap
  feed -->|feed and llms links need real pages| sitemap
  images -->|missing social preview images| seo
  linkgraph -->|orphan pages are not crawled| seo
  thin -->|thin pages rank badly| seo
  cannibal -->|same headline, split rankings| seo
  typos -->|typos hurt trust and readability| readability
  mojibake -->|garbled text is unreadable| readability
  qlength -->|long questions hurt on a phone| qa
  qyears -->|stale years make answers wrong| qa
  explain -->|weak explanations teach nothing| qa
  dupids -->|duplicate ids confuse screen readers| a11y
  mobile -->|phone layout evidence| a11y
  consoleerrors -->|script errors are health problems| health
  consolelog -->|debug leftovers| health
  localhost -->|dev addresses in production| health
  pwa -->|install support| health
  timeouts -->|slow partners break functions| health
  envvars -->|which secrets the code reads| secrets
  deps -->|vulnerable dependencies| secrets
  privacy -->|public personal data| secrets
  companies -->|search data integrity| health
  extlinks -->|outbound link quality| seo
  logscore -->|issues found| dispatcher
  scoreboardsync -->|issues found| dispatcher
  ideaavg -->|issues found| dispatcher
  growthrate -->|issues found| dispatcher
  compound -->|issues found| dispatcher
  spikes -->|issues found| dispatcher
  flops -->|issues found| dispatcher
  loserwatch -->|issues found| dispatcher
  saturation -->|issues found| dispatcher
  reposts -->|issues found| dispatcher
  hookstats -->|issues found| dispatcher
  stylerotation -->|issues found| dispatcher
  winnerboard -->|issues found| dispatcher
  experiments -->|issues found| dispatcher
  promotions -->|issues found| dispatcher
  retirements -->|issues found| dispatcher
  finalnumbers -->|issues found| dispatcher
  slotplan -->|issues found| dispatcher
  backlog -->|issues found| dispatcher
  questionmine -->|issues found| dispatcher
  newsjack -->|issues found| dispatcher
  sequelqueue -->|issues found| dispatcher
  characterladder -->|issues found| dispatcher
  timing -->|issues found| dispatcher
  ctarotation -->|issues found| dispatcher
  hookwriter -->|issues found| dispatcher
  repurpose -->|issues found| dispatcher
  platformroute -->|issues found| dispatcher
  dailymix -->|issues found| dispatcher
  gapdays -->|issues found| dispatcher
  videoperday -->|issues found| dispatcher
  ctagate -->|issues found| dispatcher
  sourcegate -->|issues found| dispatcher
  rendergate -->|issues found| dispatcher
  blackoutgate -->|issues found| dispatcher
  capgate -->|issues found| dispatcher
  utmgate -->|issues found| dispatcher
  videolog -->|issues found| dispatcher
  dupegate -->|issues found| dispatcher
  clichegate -->|issues found| dispatcher
  slidetext -->|issues found| dispatcher
  quoragap -->|issues found| dispatcher
  quoradup -->|issues found| dispatcher
  quoralink -->|issues found| dispatcher
  quoraurls -->|issues found| dispatcher
  dirnext -->|issues found| dispatcher
  dircopy -->|issues found| dispatcher
  phready -->|issues found| dispatcher
  ogcard -->|issues found| dispatcher
  sociallinks -->|issues found| dispatcher
  bumps -->|issues found| dispatcher
  pendingoutreach -->|issues found| dispatcher
  deployplan -->|issues found| dispatcher
  stagingage -->|issues found| dispatcher
  buildfree -->|issues found| dispatcher
  creditburn -->|issues found| dispatcher
  homeguard -->|issues found| dispatcher
  calpast -->|issues found| dispatcher
  earnpast -->|issues found| dispatcher
  newsage -->|issues found| dispatcher
  dealsage -->|issues found| dispatcher
  dealsmath -->|issues found| dispatcher
  quizanswer -->|issues found| dispatcher
  tickernulls -->|issues found| dispatcher
  testimonials -->|issues found| dispatcher
  legaladdress -->|issues found| dispatcher
  refundwindow -->|issues found| dispatcher
  emailfrom -->|issues found| dispatcher
  feedbotidle -->|issues found| dispatcher
  digestage -->|issues found| dispatcher
  canonical -->|issues found| dispatcher
  ogimage -->|issues found| dispatcher
  answerskew -->|issues found| dispatcher
  logscore -->|what won, what flopped| slotplan
  scoreboardsync -->|what won, what flopped| slotplan
  ideaavg -->|what won, what flopped| slotplan
  growthrate -->|what won, what flopped| slotplan
  compound -->|what won, what flopped| slotplan
  spikes -->|what won, what flopped| slotplan
  flops -->|what won, what flopped| slotplan
  loserwatch -->|what won, what flopped| slotplan
  saturation -->|what won, what flopped| slotplan
  reposts -->|what won, what flopped| slotplan
  hookstats -->|what won, what flopped| slotplan
  stylerotation -->|what won, what flopped| slotplan
  winnerboard -->|what won, what flopped| slotplan
  experiments -->|what won, what flopped| slotplan
  promotions -->|what won, what flopped| slotplan
  retirements -->|what won, what flopped| slotplan
  finalnumbers -->|what won, what flopped| slotplan
  backlog -->|topics for the slots| slotplan
  questionmine -->|topics for the slots| slotplan
  newsjack -->|topics for the slots| slotplan
  sequelqueue -->|topics for the slots| slotplan
  characterladder -->|topics for the slots| slotplan
  slotplan -->|tomorrow's plan| contentbrief
  timing -->|tomorrow's plan| contentbrief
  ctarotation -->|tomorrow's plan| contentbrief
  hookwriter -->|tomorrow's plan| contentbrief
  repurpose -->|tomorrow's plan| contentbrief
  platformroute -->|tomorrow's plan| contentbrief
  dailymix -->|tomorrow's plan| contentbrief
  gapdays -->|tomorrow's plan| contentbrief
  videoperday -->|tomorrow's plan| contentbrief
  ctagate -.->|fix before posting| contentbrief
  sourcegate -.->|fix before posting| contentbrief
  rendergate -.->|fix before posting| contentbrief
  blackoutgate -.->|fix before posting| contentbrief
  capgate -.->|fix before posting| contentbrief
  utmgate -.->|fix before posting| contentbrief
  videolog -.->|fix before posting| contentbrief
  dupegate -.->|fix before posting| contentbrief
  clichegate -.->|fix before posting| contentbrief
  slidetext -.->|fix before posting| contentbrief
  growthrate -->|growth and what to stop| contentbrief
  compound -->|growth and what to stop| contentbrief
  spikes -->|growth and what to stop| contentbrief
  flops -->|growth and what to stop| contentbrief
  loserwatch -->|growth and what to stop| contentbrief
  saturation -->|growth and what to stop| contentbrief
  reposts -->|growth and what to stop| contentbrief
  contentbrief -.->|posts scored at 48h feed the next plan| ideaavg
  contentbrief -->|the content page| reporter
  quoragap -->|chores and risks| todaylist
  quoradup -->|chores and risks| todaylist
  quoralink -->|chores and risks| todaylist
  quoraurls -->|chores and risks| todaylist
  dirnext -->|chores and risks| todaylist
  dircopy -->|chores and risks| todaylist
  phready -->|chores and risks| todaylist
  ogcard -->|chores and risks| todaylist
  sociallinks -->|chores and risks| todaylist
  bumps -->|chores and risks| todaylist
  pendingoutreach -->|chores and risks| todaylist
  deployplan -->|chores and risks| todaylist
  stagingage -->|chores and risks| todaylist
  buildfree -->|chores and risks| todaylist
  creditburn -->|chores and risks| todaylist
  homeguard -->|chores and risks| todaylist
  calpast -->|chores and risks| todaylist
  earnpast -->|chores and risks| todaylist
  newsage -->|chores and risks| todaylist
  dealsage -->|chores and risks| todaylist
  dealsmath -->|chores and risks| todaylist
  quizanswer -->|chores and risks| todaylist
  tickernulls -->|chores and risks| todaylist
  testimonials -->|chores and risks| todaylist
  legaladdress -->|chores and risks| todaylist
  refundwindow -->|chores and risks| todaylist
  emailfrom -->|chores and risks| todaylist
  feedbotidle -->|chores and risks| todaylist
  digestage -->|chores and risks| todaylist
  canonical -->|chores and risks| todaylist
  ogimage -->|chores and risks| todaylist
  answerskew -->|chores and risks| todaylist
  dispatcher -->|open issues| todaylist
  todaylist -->|do today| reporter
  bumps -->|who is due a follow-up| outreach
  newsjack -->|live-market chances| strategist
  mkrankedhooks -->|issues found| dispatcher
  mkrankedcaption -->|issues found| dispatcher
  mkrankedcta -->|issues found| dispatcher
  mkrankedscript -->|issues found| dispatcher
  mkrankedslides -->|issues found| dispatcher
  mkrankedtitle -->|issues found| dispatcher
  mkrankedsequel -->|issues found| dispatcher
  mkrankedpin -->|issues found| dispatcher
  mkcharacterhooks -->|issues found| dispatcher
  mkcharactercaption -->|issues found| dispatcher
  mkcharactercta -->|issues found| dispatcher
  mkcharacterscript -->|issues found| dispatcher
  mkcharacterslides -->|issues found| dispatcher
  mkcharactertitle -->|issues found| dispatcher
  mkcharactersequel -->|issues found| dispatcher
  mkcharacterpin -->|issues found| dispatcher
  mktieredhooks -->|issues found| dispatcher
  mktieredcaption -->|issues found| dispatcher
  mktieredcta -->|issues found| dispatcher
  mktieredscript -->|issues found| dispatcher
  mktieredslides -->|issues found| dispatcher
  mktieredtitle -->|issues found| dispatcher
  mktieredsequel -->|issues found| dispatcher
  mktieredpin -->|issues found| dispatcher
  mkmarkethooks -->|issues found| dispatcher
  mkmarketcaption -->|issues found| dispatcher
  mkmarketcta -->|issues found| dispatcher
  mkmarketscript -->|issues found| dispatcher
  mkmarketslides -->|issues found| dispatcher
  mkmarkettitle -->|issues found| dispatcher
  mkmarketsequel -->|issues found| dispatcher
  mkmarketpin -->|issues found| dispatcher
  mkleaguehooks -->|issues found| dispatcher
  mkleaguecaption -->|issues found| dispatcher
  mkleaguecta -->|issues found| dispatcher
  mkleaguescript -->|issues found| dispatcher
  mkleagueslides -->|issues found| dispatcher
  mkleaguetitle -->|issues found| dispatcher
  mkleaguesequel -->|issues found| dispatcher
  mkleaguepin -->|issues found| dispatcher
  orohioqueries -->|issues found| dispatcher
  orohioroster -->|issues found| dispatcher
  orohiodedupe -->|issues found| dispatcher
  orbigtenqueries -->|issues found| dispatcher
  orbigtenroster -->|issues found| dispatcher
  orbigtendedupe -->|issues found| dispatcher
  orsecqueries -->|issues found| dispatcher
  orsecroster -->|issues found| dispatcher
  orsecdedupe -->|issues found| dispatcher
  oraccqueries -->|issues found| dispatcher
  oraccroster -->|issues found| dispatcher
  oraccdedupe -->|issues found| dispatcher
  orbig12queries -->|issues found| dispatcher
  orbig12roster -->|issues found| dispatcher
  orbig12dedupe -->|issues found| dispatcher
  orivyqueries -->|issues found| dispatcher
  orivyroster -->|issues found| dispatcher
  orivydedupe -->|issues found| dispatcher
  orwestqueries -->|issues found| dispatcher
  orwestroster -->|issues found| dispatcher
  orwestdedupe -->|issues found| dispatcher
  ornycqueries -->|issues found| dispatcher
  ornycroster -->|issues found| dispatcher
  ornycdedupe -->|issues found| dispatcher
  ortexasqueries -->|issues found| dispatcher
  ortexasroster -->|issues found| dispatcher
  ortexasdedupe -->|issues found| dispatcher
  orsouthqueries -->|issues found| dispatcher
  orsouthroster -->|issues found| dispatcher
  orsouthdedupe -->|issues found| dispatcher
  fxdesclong -->|issues found| dispatcher
  fxtitlelong -->|issues found| dispatcher
  fxcanon -->|issues found| dispatcher
  fxogimg -->|issues found| dispatcher
  fximgalt -->|issues found| dispatcher
  fxlang -->|issues found| dispatcher
  fxviewport -->|issues found| dispatcher
  fxh1 -->|issues found| dispatcher
  fxh1multi -->|issues found| dispatcher
  fxhttp -->|issues found| dispatcher
  fxrel -->|issues found| dispatcher
  fxemptyhref -->|issues found| dispatcher
  fxtodo -->|issues found| dispatcher
  fxspaces -->|issues found| dispatcher
  fxtwitter -->|issues found| dispatcher
  fxtheme -->|issues found| dispatcher
  fxmailto -->|issues found| dispatcher
  fxdecksrc -->|issues found| dispatcher
  fxdeckcta -->|issues found| dispatcher
  fxrendercount -->|issues found| dispatcher
  fxwirepast -->|issues found| dispatcher
  fxtickernull -->|issues found| dispatcher
  fxpostdate -->|issues found| dispatcher
  fxfamily -->|issues found| dispatcher
  fxposted -->|issues found| dispatcher
  fxpunch -->|issues found| dispatcher
  fxtopics -->|issues found| dispatcher
  fxlegaladdr -->|issues found| dispatcher
  fxemailtmpl -->|issues found| dispatcher
  fxswver -->|issues found| dispatcher
  fxsitemap -->|issues found| dispatcher
  mdfollowersnow -->|issues found| dispatcher
  mdfollowerstrend -->|issues found| dispatcher
  mdviewsnow -->|issues found| dispatcher
  mdviewstrend -->|issues found| dispatcher
  mdreachnow -->|issues found| dispatcher
  mdreachtrend -->|issues found| dispatcher
  mdlikesnow -->|issues found| dispatcher
  mdlikestrend -->|issues found| dispatcher
  mdcommentsnow -->|issues found| dispatcher
  mdcommentstrend -->|issues found| dispatcher
  mdsharesnow -->|issues found| dispatcher
  mdsharestrend -->|issues found| dispatcher
  mdsavesnow -->|issues found| dispatcher
  mdsavestrend -->|issues found| dispatcher
  mdpostsnow -->|issues found| dispatcher
  mdpoststrend -->|issues found| dispatcher
  mdvisitsnow -->|issues found| dispatcher
  mdvisitstrend -->|issues found| dispatcher
  mdclicksnow -->|issues found| dispatcher
  mdclickstrend -->|issues found| dispatcher
  sfdupeemail -->|issues found| dispatcher
  sfdaycap -->|issues found| dispatcher
  sfschoolcap -->|issues found| dispatcher
  sfwindow -->|issues found| dispatcher
  sfsuppress -->|issues found| dispatcher
  sfoptout -->|issues found| dispatcher
  sfaddr -->|issues found| dispatcher
  sflength -->|issues found| dispatcher
  sfclaims -->|issues found| dispatcher
  sfunsourced -->|issues found| dispatcher
  sfblackout -->|issues found| dispatcher
  sftiktokcap -->|issues found| dispatcher
  sfhours -->|issues found| dispatcher
  sfquoramuted -->|issues found| dispatcher
  sfsentdates -->|issues found| dispatcher
  sfhome -->|issues found| dispatcher
  mkrankedhooks -->|drafts for tomorrow| contentbrief
  mkrankedcaption -->|drafts for tomorrow| contentbrief
  mkrankedcta -->|drafts for tomorrow| contentbrief
  mkrankedscript -->|drafts for tomorrow| contentbrief
  mkrankedslides -->|drafts for tomorrow| contentbrief
  mkrankedtitle -->|drafts for tomorrow| contentbrief
  mkrankedsequel -->|drafts for tomorrow| contentbrief
  mkrankedpin -->|drafts for tomorrow| contentbrief
  mkcharacterhooks -->|drafts for tomorrow| contentbrief
  mkcharactercaption -->|drafts for tomorrow| contentbrief
  mkcharactercta -->|drafts for tomorrow| contentbrief
  mkcharacterscript -->|drafts for tomorrow| contentbrief
  mkcharacterslides -->|drafts for tomorrow| contentbrief
  mkcharactertitle -->|drafts for tomorrow| contentbrief
  mkcharactersequel -->|drafts for tomorrow| contentbrief
  mkcharacterpin -->|drafts for tomorrow| contentbrief
  mktieredhooks -->|drafts for tomorrow| contentbrief
  mktieredcaption -->|drafts for tomorrow| contentbrief
  mktieredcta -->|drafts for tomorrow| contentbrief
  mktieredscript -->|drafts for tomorrow| contentbrief
  mktieredslides -->|drafts for tomorrow| contentbrief
  mktieredtitle -->|drafts for tomorrow| contentbrief
  mktieredsequel -->|drafts for tomorrow| contentbrief
  mktieredpin -->|drafts for tomorrow| contentbrief
  mkmarkethooks -->|drafts for tomorrow| contentbrief
  mkmarketcaption -->|drafts for tomorrow| contentbrief
  mkmarketcta -->|drafts for tomorrow| contentbrief
  mkmarketscript -->|drafts for tomorrow| contentbrief
  mkmarketslides -->|drafts for tomorrow| contentbrief
  mkmarkettitle -->|drafts for tomorrow| contentbrief
  mkmarketsequel -->|drafts for tomorrow| contentbrief
  mkmarketpin -->|drafts for tomorrow| contentbrief
  mkleaguehooks -->|drafts for tomorrow| contentbrief
  mkleaguecaption -->|drafts for tomorrow| contentbrief
  mkleaguecta -->|drafts for tomorrow| contentbrief
  mkleaguescript -->|drafts for tomorrow| contentbrief
  mkleagueslides -->|drafts for tomorrow| contentbrief
  mkleaguetitle -->|drafts for tomorrow| contentbrief
  mkleaguesequel -->|drafts for tomorrow| contentbrief
  mkleaguepin -->|drafts for tomorrow| contentbrief
  mdfollowersnow -->|real views from Metricool| logscore
  mdfollowerstrend -->|real views from Metricool| logscore
  mdviewsnow -->|real views from Metricool| logscore
  mdviewstrend -->|real views from Metricool| logscore
  mdreachnow -->|real views from Metricool| logscore
  mdreachtrend -->|real views from Metricool| logscore
  mdlikesnow -->|real views from Metricool| logscore
  mdlikestrend -->|real views from Metricool| logscore
  mdcommentsnow -->|real views from Metricool| logscore
  mdcommentstrend -->|real views from Metricool| logscore
  mdsharesnow -->|real views from Metricool| logscore
  mdsharestrend -->|real views from Metricool| logscore
  mdsavesnow -->|real views from Metricool| logscore
  mdsavestrend -->|real views from Metricool| logscore
  mdpostsnow -->|real views from Metricool| logscore
  mdpoststrend -->|real views from Metricool| logscore
  mdvisitsnow -->|real views from Metricool| logscore
  mdvisitstrend -->|real views from Metricool| logscore
  mdclicksnow -->|real views from Metricool| logscore
  mdclickstrend -->|real views from Metricool| logscore
  sfdupeemail -.->|hard-rule check| contentbrief
  sfdaycap -.->|hard-rule check| contentbrief
  sfschoolcap -.->|hard-rule check| contentbrief
  sfwindow -.->|hard-rule check| contentbrief
  sfsuppress -.->|hard-rule check| contentbrief
  sfoptout -.->|hard-rule check| contentbrief
  sfaddr -.->|hard-rule check| contentbrief
  sflength -.->|hard-rule check| contentbrief
  sfclaims -.->|hard-rule check| contentbrief
  sfunsourced -.->|hard-rule check| contentbrief
  sfblackout -.->|hard-rule check| contentbrief
  sftiktokcap -.->|hard-rule check| contentbrief
  sfhours -.->|hard-rule check| contentbrief
  sfquoramuted -.->|hard-rule check| contentbrief
  sfsentdates -.->|hard-rule check| contentbrief
  sfhome -.->|hard-rule check| contentbrief
  orohioqueries -->|outreach to do| todaylist
  orohioroster -->|outreach to do| todaylist
  orohiodedupe -->|outreach to do| todaylist
  orbigtenqueries -->|outreach to do| todaylist
  orbigtenroster -->|outreach to do| todaylist
  orbigtendedupe -->|outreach to do| todaylist
  orsecqueries -->|outreach to do| todaylist
  orsecroster -->|outreach to do| todaylist
  orsecdedupe -->|outreach to do| todaylist
  oraccqueries -->|outreach to do| todaylist
  oraccroster -->|outreach to do| todaylist
  oraccdedupe -->|outreach to do| todaylist
  orbig12queries -->|outreach to do| todaylist
  orbig12roster -->|outreach to do| todaylist
  orbig12dedupe -->|outreach to do| todaylist
  orivyqueries -->|outreach to do| todaylist
  orivyroster -->|outreach to do| todaylist
  orivydedupe -->|outreach to do| todaylist
  orwestqueries -->|outreach to do| todaylist
  orwestroster -->|outreach to do| todaylist
  orwestdedupe -->|outreach to do| todaylist
  ornycqueries -->|outreach to do| todaylist
  ornycroster -->|outreach to do| todaylist
  ornycdedupe -->|outreach to do| todaylist
  ortexasqueries -->|outreach to do| todaylist
  ortexasroster -->|outreach to do| todaylist
  ortexasdedupe -->|outreach to do| todaylist
  orsouthqueries -->|outreach to do| todaylist
  orsouthroster -->|outreach to do| todaylist
  orsouthdedupe -->|outreach to do| todaylist
  fxdesclong -->|exact fix text| todaylist
  fxtitlelong -->|exact fix text| todaylist
  fxcanon -->|exact fix text| todaylist
  fxogimg -->|exact fix text| todaylist
  fximgalt -->|exact fix text| todaylist
  fxlang -->|exact fix text| todaylist
  fxviewport -->|exact fix text| todaylist
  fxh1 -->|exact fix text| todaylist
  fxh1multi -->|exact fix text| todaylist
  fxhttp -->|exact fix text| todaylist
  fxrel -->|exact fix text| todaylist
  fxemptyhref -->|exact fix text| todaylist
  fxtodo -->|exact fix text| todaylist
  fxspaces -->|exact fix text| todaylist
  fxtwitter -->|exact fix text| todaylist
  fxtheme -->|exact fix text| todaylist
  fxmailto -->|exact fix text| todaylist
  fxdecksrc -->|exact fix text| todaylist
  fxdeckcta -->|exact fix text| todaylist
  fxrendercount -->|exact fix text| todaylist
  fxwirepast -->|exact fix text| todaylist
  fxtickernull -->|exact fix text| todaylist
  fxpostdate -->|exact fix text| todaylist
  fxfamily -->|exact fix text| todaylist
  fxposted -->|exact fix text| todaylist
  fxpunch -->|exact fix text| todaylist
  fxtopics -->|exact fix text| todaylist
  fxlegaladdr -->|exact fix text| todaylist
  fxemailtmpl -->|exact fix text| todaylist
  fxswver -->|exact fix text| todaylist
  fxsitemap -->|exact fix text| todaylist
  seobriefibinterview -->|issues found| dispatcher
  seobrieflbo -->|issues found| dispatcher
  seobriefdcf -->|issues found| dispatcher
  seobriefaccretion -->|issues found| dispatcher
  seobriefcomps -->|issues found| dispatcher
  seobriefperecruit -->|issues found| dispatcher
  seobriefsuperday -->|issues found| dispatcher
  seobriefnetwork -->|issues found| dispatcher
  seobriefresume -->|issues found| dispatcher
  seobriefrestructuring -->|issues found| dispatcher
  seobriefhedgefund -->|issues found| dispatcher
  seobriefaccounting -->|issues found| dispatcher
  seothin -->|issues found| dispatcher
  seoh2 -->|issues found| dispatcher
  seoinlinks -->|issues found| dispatcher
  seofaq -->|issues found| dispatcher
  seoarticle -->|issues found| dispatcher
  seotitlekw -->|issues found| dispatcher
  seodescmiss -->|issues found| dispatcher
  seodupetitle -->|issues found| dispatcher
  seodupedesc -->|issues found| dispatcher
  seoupdated -->|issues found| dispatcher
  seocta -->|issues found| dispatcher
  seoimgalt -->|issues found| dispatcher
  seoh1match -->|issues found| dispatcher
  seolong -->|issues found| dispatcher
  seoschoolconsulting -->|issues found| dispatcher
  seoschoolhedgefunds -->|issues found| dispatcher
  seoschoolinvestmentbanking -->|issues found| dispatcher
  seoschoolprivateequity -->|issues found| dispatcher
  seoschoolsalesandtrading -->|issues found| dispatcher
  seoschoolsame -->|issues found| dispatcher
  seoschoolgap -->|issues found| dispatcher
  seoschoollink -->|issues found| dispatcher
  seorobots -->|issues found| dispatcher
  seosmsize -->|issues found| dispatcher
  seolastmod -->|issues found| dispatcher
  seollms -->|issues found| dispatcher
  seocanonconf -->|issues found| dispatcher
  seonoindex -->|issues found| dispatcher
  seoslug -->|issues found| dispatcher
  seoweight -->|issues found| dispatcher
  seoscripts -->|issues found| dispatcher
  seohttps -->|issues found| dispatcher
  seoredirect -->|issues found| dispatcher
  seobreadcrumb -->|issues found| dispatcher
  seoaicite -->|issues found| dispatcher
  seoogtitle -->|issues found| dispatcher
  seolinkcareer -->|issues found| dispatcher
  seolinkclubs -->|issues found| dispatcher
  seolinkreddit -->|issues found| dispatcher
  seolinkunlinked -->|issues found| dispatcher
  seolinkroundup -->|issues found| dispatcher
  seolinknewsletter -->|issues found| dispatcher
  seolinkpodcast -->|issues found| dispatcher
  seolinkdir -->|issues found| dispatcher
  seolinkwiki -->|issues found| dispatcher
  seolinkfaculty -->|issues found| dispatcher
  seolinkyoutube -->|issues found| dispatcher
  seolinkpitch -->|issues found| dispatcher
  seobriefibinterview -->|SEO to do| todaylist
  seobrieflbo -->|SEO to do| todaylist
  seobriefdcf -->|SEO to do| todaylist
  seobriefaccretion -->|SEO to do| todaylist
  seobriefcomps -->|SEO to do| todaylist
  seobriefperecruit -->|SEO to do| todaylist
  seobriefsuperday -->|SEO to do| todaylist
  seobriefnetwork -->|SEO to do| todaylist
  seobriefresume -->|SEO to do| todaylist
  seobriefrestructuring -->|SEO to do| todaylist
  seobriefhedgefund -->|SEO to do| todaylist
  seobriefaccounting -->|SEO to do| todaylist
  seothin -->|SEO to do| todaylist
  seoh2 -->|SEO to do| todaylist
  seoinlinks -->|SEO to do| todaylist
  seofaq -->|SEO to do| todaylist
  seoarticle -->|SEO to do| todaylist
  seotitlekw -->|SEO to do| todaylist
  seodescmiss -->|SEO to do| todaylist
  seodupetitle -->|SEO to do| todaylist
  seodupedesc -->|SEO to do| todaylist
  seoupdated -->|SEO to do| todaylist
  seocta -->|SEO to do| todaylist
  seoimgalt -->|SEO to do| todaylist
  seoh1match -->|SEO to do| todaylist
  seolong -->|SEO to do| todaylist
  seoschoolconsulting -->|SEO to do| todaylist
  seoschoolhedgefunds -->|SEO to do| todaylist
  seoschoolinvestmentbanking -->|SEO to do| todaylist
  seoschoolprivateequity -->|SEO to do| todaylist
  seoschoolsalesandtrading -->|SEO to do| todaylist
  seoschoolsame -->|SEO to do| todaylist
  seoschoolgap -->|SEO to do| todaylist
  seoschoollink -->|SEO to do| todaylist
  seorobots -->|SEO to do| todaylist
  seosmsize -->|SEO to do| todaylist
  seolastmod -->|SEO to do| todaylist
  seollms -->|SEO to do| todaylist
  seocanonconf -->|SEO to do| todaylist
  seonoindex -->|SEO to do| todaylist
  seoslug -->|SEO to do| todaylist
  seoweight -->|SEO to do| todaylist
  seoscripts -->|SEO to do| todaylist
  seohttps -->|SEO to do| todaylist
  seoredirect -->|SEO to do| todaylist
  seobreadcrumb -->|SEO to do| todaylist
  seoaicite -->|SEO to do| todaylist
  seoogtitle -->|SEO to do| todaylist
  seolinkcareer -->|SEO to do| todaylist
  seolinkclubs -->|SEO to do| todaylist
  seolinkreddit -->|SEO to do| todaylist
  seolinkunlinked -->|SEO to do| todaylist
  seolinkroundup -->|SEO to do| todaylist
  seolinknewsletter -->|SEO to do| todaylist
  seolinkpodcast -->|SEO to do| todaylist
  seolinkdir -->|SEO to do| todaylist
  seolinkwiki -->|SEO to do| todaylist
  seolinkfaculty -->|SEO to do| todaylist
  seolinkyoutube -->|SEO to do| todaylist
  seolinkpitch -->|SEO to do| todaylist
  lnsample -->|learn issues| dispatcher
  lnsnapage -->|learn issues| dispatcher
  lnactivation -->|learn issues| dispatcher
  lnfbtally -->|learn issues| dispatcher
  lnfbhard -->|learn issues| dispatcher
  lnlevelreach -->|learn issues| dispatcher
  lnlevelstuck -->|learn issues| dispatcher
  lnlevelstars -->|learn issues| dispatcher
  lnqmiss -->|learn issues| dispatcher
  lnqoverall -->|learn issues| dispatcher
  lntoolusage -->|learn issues| dispatcher
  lnfbask -->|learn issues| dispatcher
  lnevlesson -->|learn issues| dispatcher
  lnevreps -->|learn issues| dispatcher
  lnevmock -->|learn issues| dispatcher
  lnevmodel -->|learn issues| dispatcher
  lnevpitch -->|learn issues| dispatcher
  lnevgap -->|learn issues| dispatcher
  lntopicgap -->|learn issues| dispatcher
  lncert -->|learn issues| dispatcher
  lncases -->|learn issues| dispatcher
  lntemplates -->|learn issues| dispatcher
  lnfreehook -->|learn issues| dispatcher
  lnladder -->|learn issues| dispatcher
  lnprice -->|learn issues| dispatcher
  lnguarantee -->|learn issues| dispatcher
  lncommunity -->|learn issues| dispatcher
  lnproof -->|learn issues| dispatcher
  lnformat -->|learn issues| dispatcher
  lncrawlage -->|learn issues| dispatcher
  lncrawlqueue -->|learn issues| dispatcher
  lncrawlsrc -->|learn issues| dispatcher
  lnbrief -->|learn issues| dispatcher
  lnsample -->|learn to do| todaylist
  lnsnapage -->|learn to do| todaylist
  lnactivation -->|learn to do| todaylist
  lnfbtally -->|learn to do| todaylist
  lnfbhard -->|learn to do| todaylist
  lnlevelreach -->|learn to do| todaylist
  lnlevelstuck -->|learn to do| todaylist
  lnlevelstars -->|learn to do| todaylist
  lnqmiss -->|learn to do| todaylist
  lnqoverall -->|learn to do| todaylist
  lntoolusage -->|learn to do| todaylist
  lnfbask -->|learn to do| todaylist
  lnevlesson -->|learn to do| todaylist
  lnevreps -->|learn to do| todaylist
  lnevmock -->|learn to do| todaylist
  lnevmodel -->|learn to do| todaylist
  lnevpitch -->|learn to do| todaylist
  lnevgap -->|learn to do| todaylist
  lntopicgap -->|learn to do| todaylist
  lncert -->|learn to do| todaylist
  lncases -->|learn to do| todaylist
  lntemplates -->|learn to do| todaylist
  lnfreehook -->|learn to do| todaylist
  lnladder -->|learn to do| todaylist
  lnprice -->|learn to do| todaylist
  lnguarantee -->|learn to do| todaylist
  lncommunity -->|learn to do| todaylist
  lnproof -->|learn to do| todaylist
  lnformat -->|learn to do| todaylist
  lncrawlage -->|learn to do| todaylist
  lncrawlqueue -->|learn to do| todaylist
  lncrawlsrc -->|learn to do| todaylist
  lnbrief -->|learn to do| todaylist
  reporter ==>|digest and deploy question| H
```

## One run, in order
1. [[Site Health Bot]] and [[Billing Audit Bot]] run first, because they can close gates.
2. [[Question QA Bot]], [[Content Freshness Bot]], [[Cost Guard Bot]] and [[Funnel Bot]] run.
3. [[Superfeedbackbot]] runs **after** QA, so a defect QA verified counts as hard evidence for a user report.
4. Every finding goes into one shared ledger (deduped, with history).
5. [[Guard Bot]] decides whether [[Retention Bot]] and [[Outreach Bot]] may run.
6. [[Dispatcher Bot]] ranks the issues and routes them.
7. In act mode only: [[Fixer Bot]] patches, [[Verifier Bot]] re-checks, and the patch is committed or reverted. [[Historian Bot]] records the result.
8. [[Reporter Bot]] writes the digest.

## Loop protection
- An issue that comes back 3 times is **frozen** and sent to a human.
- A fix is tried at most twice.
- A fix type that keeps getting reverted is demoted by the [[Historian Bot]].
- A sensor that crashes becomes a critical issue instead of silently disappearing: the circle watches itself.

## Who depends on whom
| From | Type | To | Why |
|---|---|---|---|
| [[Question QA Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Site Health Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Content Freshness Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Cost Guard Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Funnel Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Billing Audit Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Superfeedbackbot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Question QA Bot]] | feed | [[Superfeedbackbot]] | verified defects count as hard evidence |
| [[Dispatcher Bot]] | act | [[Fixer Bot]] | safe, fixable issues |
| [[Dispatcher Bot]] | feed | [[Reporter Bot]] | issues that need a human |
| [[Guard Bot]] | gate | [[Fixer Bot]] | allow or block every patch |
| [[Site Health Bot]] | gate | [[Guard Bot]] | site broken = freeze all fixes |
| [[Billing Audit Bot]] | gate | [[Guard Bot]] | money problem = pause marketing |
| [[Guard Bot]] | gate | [[Retention Bot]] | runs only when health and billing are clean |
| [[Guard Bot]] | gate | [[Outreach Bot]] | runs only when health and billing are clean |
| [[Fixer Bot]] | feed | [[Verifier Bot]] | patch to check |
| [[Verifier Bot]] | recheck | [[Question QA Bot]] | re-run after a question fix |
| [[Verifier Bot]] | recheck | [[Content Freshness Bot]] | re-run after a data fix |
| [[Verifier Bot]] | feed | [[Historian Bot]] | worked or reverted |
| [[Historian Bot]] | learn | [[Guard Bot]] | demote fix types that keep failing |
| [[Guard Bot]] | gate | [[Dispatcher Bot]] | frozen issues go straight to a human |
| [[Cost Guard Bot]] | feed | [[Reporter Bot]] | deploy budget advice |
| [[Retention Bot]] | feed | [[Reporter Bot]] | dry-run counts |
| [[Outreach Bot]] | feed | [[Reporter Bot]] | drafts waiting for approval |
| [[Verifier Bot]] | feed | [[Reporter Bot]] | what changed and what was reverted |
| [[SEO Meta Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sitemap Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Structured Data Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Accessibility Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Performance Budget Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Secrets and Headers Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate Content Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Readability Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Rep Auditor Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Coverage Gap Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Test Coverage Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Dead Code Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Secrets and Headers Bot]] | gate | [[Guard Bot]] | leaked key = freeze all fixes |
| [[Rep Auditor Bot]] | gate | [[Release Bot]] | a broken practice problem blocks a release |
| [[Rep Auditor Bot]] | feed | [[Question QA Bot]] | wrong practice answers are verified defects too |
| [[Duplicate Content Bot]] | feed | [[SEO Meta Bot]] | duplicate pages explain weak rankings |
| [[Sitemap Bot]] | feed | [[SEO Meta Bot]] | pages missing from the sitemap are not indexed |
| [[Dead Code Bot]] | feed | [[Test Coverage Bot]] | unreferenced code needs no test |
| [[Readability Bot]] | feed | [[Coverage Gap Bot]] | hard-to-read levels need a simpler lesson |
| [[Coverage Gap Bot]] | feed | [[Strategist Bot]] | levels missing lessons, reps or models |
| [[Funnel Bot]] | feed | [[Strategist Bot]] | where visitors leave |
| [[Dispatcher Bot]] | feed | [[Strategist Bot]] | open issues with evidence |
| [[Superfeedbackbot]] | feed | [[Strategist Bot]] | what users ask for |
| [[Strategist Bot]] | feed | [[Reporter Bot]] | ranked build list |
| [[Verifier Bot]] | feed | [[Changelog Bot]] | bot fix commits join the staging queue |
| [[Changelog Bot]] | feed | [[Release Bot]] | what would ship |
| [[Changelog Bot]] | feed | [[Reporter Bot]] | plain-English change list |
| [[Dispatcher Bot]] | feed | [[Release Bot]] | open critical issues |
| [[Cost Guard Bot]] | feed | [[Release Bot]] | deploy credits left |
| [[Release Bot]] | feed | [[Reporter Bot]] | GO or NO-GO |
| [[Guard Bot]] | gate | [[Release Bot]] | kill switch blocks a GO |
| [[Internal Link Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Thin Content Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Keyword Cannibalization Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Typo Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Encoding Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Broken Image Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Redirect Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Feed Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate ID Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Leftover Debug Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Localhost Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[External Link Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Install (PWA) Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Timeout Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Env Var Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Dependency Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Wire Schema Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Company List Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Privacy Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pricing Consistency Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Claims Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Question Length Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Stale Year Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Explanation Quality Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Test Runner Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Drift Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Console Error Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Mobile Layout Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sign-up and Sign-in Diagnostic Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Dispatcher Bot]] | feed | [[Trend Bot]] | open issue counts |
| [[Dispatcher Bot]] | feed | [[Meta Bot]] | the ledger to audit |
| [[Trend Bot]] | feed | [[Reporter Bot]] | better or worse than yesterday |
| [[Meta Bot]] | feed | [[Reporter Bot]] | circle health |
| [[Sign-up and Sign-in Diagnostic Bot]] | gate | [[Release Bot]] | broken sign-up blocks a release |
| [[Sign-up and Sign-in Diagnostic Bot]] | feed | [[Strategist Bot]] | where the account flow leaks |
| [[Funnel Bot]] | feed | [[Sign-up and Sign-in Diagnostic Bot]] | sign-up funnel events |
| [[Test Runner Bot]] | feed | [[Release Bot]] | tests passed or failed |
| [[Drift Bot]] | gate | [[Release Bot]] | a merge conflict blocks a deploy |
| [[Drift Bot]] | feed | [[Changelog Bot]] | what main has that staging lacks |
| [[Pricing Consistency Bot]] | feed | [[Billing Audit Bot]] | price text must match Stripe |
| [[Claims Bot]] | feed | [[Strategist Bot]] | marketing numbers that are wrong |
| [[Wire Schema Bot]] | feed | [[Content Freshness Bot]] | bad rows before stale rows |
| [[Redirect Bot]] | feed | [[Sitemap Bot]] | redirected URLs should not be in the sitemap |
| [[Feed Bot]] | feed | [[Sitemap Bot]] | feed and llms links need real pages |
| [[Broken Image Bot]] | feed | [[SEO Meta Bot]] | missing social preview images |
| [[Internal Link Bot]] | feed | [[SEO Meta Bot]] | orphan pages are not crawled |
| [[Thin Content Bot]] | feed | [[SEO Meta Bot]] | thin pages rank badly |
| [[Keyword Cannibalization Bot]] | feed | [[SEO Meta Bot]] | same headline, split rankings |
| [[Typo Bot]] | feed | [[Readability Bot]] | typos hurt trust and readability |
| [[Encoding Bot]] | feed | [[Readability Bot]] | garbled text is unreadable |
| [[Question Length Bot]] | feed | [[Question QA Bot]] | long questions hurt on a phone |
| [[Stale Year Bot]] | feed | [[Question QA Bot]] | stale years make answers wrong |
| [[Explanation Quality Bot]] | feed | [[Question QA Bot]] | weak explanations teach nothing |
| [[Duplicate ID Bot]] | feed | [[Accessibility Bot]] | duplicate ids confuse screen readers |
| [[Mobile Layout Bot]] | feed | [[Accessibility Bot]] | phone layout evidence |
| [[Console Error Bot]] | feed | [[Site Health Bot]] | script errors are health problems |
| [[Leftover Debug Bot]] | feed | [[Site Health Bot]] | debug leftovers |
| [[Localhost Bot]] | feed | [[Site Health Bot]] | dev addresses in production |
| [[Install (PWA) Bot]] | feed | [[Site Health Bot]] | install support |
| [[Timeout Bot]] | feed | [[Site Health Bot]] | slow partners break functions |
| [[Env Var Bot]] | feed | [[Secrets and Headers Bot]] | which secrets the code reads |
| [[Dependency Bot]] | feed | [[Secrets and Headers Bot]] | vulnerable dependencies |
| [[Privacy Bot]] | feed | [[Secrets and Headers Bot]] | public personal data |
| [[Company List Bot]] | feed | [[Site Health Bot]] | search data integrity |
| [[External Link Bot]] | feed | [[SEO Meta Bot]] | outbound link quality |
| [[Post Log Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Scoreboard Sync Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Idea Average Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Growth Rate Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Compounding Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Spike Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Flop Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Loser Watch Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Saturation Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Repost Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Style Rotation Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Winner Board Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Experiment Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Promotion Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Retirement Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Final Numbers Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slot Planner]] | feed | [[Dispatcher Bot]] | issues found |
| [[Topic Backlog Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Question Mine Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Newsjack Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Series Queue Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Character Series Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Timing Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Caption Ending Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Template Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Repurpose Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Platform Router Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Daily Mix Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Gap Day Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Video Streak Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[CTA Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Source Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Render Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Blackout Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[TikTok Cap Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Link Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Video Log Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate Post Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Placeholder Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slide Readability Gate]] | feed | [[Dispatcher Bot]] | issues found |
| [[Quora Cadence Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Quora Repeat Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Quora Link Rule Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Quora Log Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Directory Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Listing Copy Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Product Hunt Ready Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Share Card Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Social Link Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Outreach Bump Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pending Outreach Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Deploy Planner]] | feed | [[Dispatcher Bot]] | issues found |
| [[Staging Age Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Free Merge Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Credit Burn Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Home Page Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Calendar Freshness Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Earnings Freshness Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[News Age Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Deals Freshness Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Deal Value Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[News Quiz Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Ticker Gap Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Testimonial Slot Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Mailing Address Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Refund Window Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sender Address Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Feedback Bot Idle Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Digest Age Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Canonical Tag Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Guide Share Image Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Answer Position Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Post Log Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Scoreboard Sync Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Idea Average Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Growth Rate Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Compounding Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Spike Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Flop Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Loser Watch Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Saturation Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Repost Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Hook Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Style Rotation Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Winner Board Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Experiment Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Promotion Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Retirement Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Final Numbers Bot]] | feed | [[Slot Planner]] | what won, what flopped |
| [[Topic Backlog Bot]] | feed | [[Slot Planner]] | topics for the slots |
| [[Question Mine Bot]] | feed | [[Slot Planner]] | topics for the slots |
| [[Newsjack Bot]] | feed | [[Slot Planner]] | topics for the slots |
| [[Series Queue Bot]] | feed | [[Slot Planner]] | topics for the slots |
| [[Character Series Bot]] | feed | [[Slot Planner]] | topics for the slots |
| [[Slot Planner]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Timing Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Caption Ending Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Hook Template Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Repurpose Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Platform Router Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Daily Mix Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Gap Day Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[Video Streak Bot]] | feed | [[Content Brief Bot]] | tomorrow's plan |
| [[CTA Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Source Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Render Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Blackout Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[TikTok Cap Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Link Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Video Log Bot]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Duplicate Post Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Placeholder Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Slide Readability Gate]] | gate | [[Content Brief Bot]] | fix before posting |
| [[Growth Rate Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Compounding Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Spike Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Flop Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Loser Watch Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Saturation Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Repost Bot]] | feed | [[Content Brief Bot]] | growth and what to stop |
| [[Content Brief Bot]] | learn | [[Idea Average Bot]] | posts scored at 48h feed the next plan |
| [[Content Brief Bot]] | feed | [[Reporter Bot]] | the content page |
| [[Quora Cadence Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Quora Repeat Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Quora Link Rule Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Quora Log Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Directory Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Listing Copy Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Product Hunt Ready Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Share Card Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Social Link Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Outreach Bump Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Pending Outreach Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Deploy Planner]] | feed | [[Today List Bot]] | chores and risks |
| [[Staging Age Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Free Merge Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Credit Burn Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Home Page Guard]] | feed | [[Today List Bot]] | chores and risks |
| [[Calendar Freshness Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Earnings Freshness Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[News Age Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Deals Freshness Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Deal Value Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[News Quiz Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Ticker Gap Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Testimonial Slot Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Mailing Address Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Refund Window Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Sender Address Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Feedback Bot Idle Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Digest Age Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Canonical Tag Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Guide Share Image Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Answer Position Bot]] | feed | [[Today List Bot]] | chores and risks |
| [[Dispatcher Bot]] | feed | [[Today List Bot]] | open issues |
| [[Today List Bot]] | feed | [[Reporter Bot]] | do today |
| [[Outreach Bump Bot]] | feed | [[Outreach Bot]] | who is due a follow-up |
| [[Newsjack Bot]] | feed | [[Strategist Bot]] | live-market chances |
| [[Hook Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Caption Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[CTA Picker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Script Outline Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slide Plan Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Card Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sequel Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pinned Comment Maker: ranked schools]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Caption Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[CTA Picker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Script Outline Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slide Plan Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Card Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sequel Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pinned Comment Maker: character stories]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Caption Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[CTA Picker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Script Outline Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slide Plan Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Card Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sequel Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pinned Comment Maker: tiered interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Caption Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[CTA Picker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Script Outline Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slide Plan Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Card Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sequel Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pinned Comment Maker: live market news]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Caption Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[CTA Picker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Script Outline Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Slide Plan Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Card Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sequel Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Pinned Comment Maker: league tables]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: Ohio]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: Ohio]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: Ohio]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: Big Ten]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: Big Ten]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: Big Ten]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: SEC]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: SEC]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: SEC]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: ACC]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: ACC]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: ACC]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: Big 12]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: Big 12]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: Big 12]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: Ivy League]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: Ivy League]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: Ivy League]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: West]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: West]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: West]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: New York area]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: New York area]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: New York area]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: Texas]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: Texas]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: Texas]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Finder Queries: Southeast]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Roster: Southeast]] | feed | [[Dispatcher Bot]] | issues found |
| [[Region De-dupe: Southeast]] | feed | [[Dispatcher Bot]] | issues found |
| [[Meta Description Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Length Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Canonical Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[OG Image Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Image Alt Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Language Tag Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Viewport Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Missing H1 Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Double H1 Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Insecure Link Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Link Safety Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Empty Link Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Leftover Text Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Double Space Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Twitter Card Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Theme Color Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Email Link Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Deck Source Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Deck CTA Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Render Count Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Wire Past Rows Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Ticker Null Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Log Date Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Idea Type Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Posted Log Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Punch Log Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Topics Gap Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Legal Address Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Email Template Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Service Worker Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sitemap Fixer]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Followers Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Followers Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Views Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Views Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Reach Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Reach Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Likes Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Likes Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Comments Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Comments Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Shares Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Shares Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Saves Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Saves Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Posts published Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Posts published Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Profile visits Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Profile visits Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Link clicks Reader]] | feed | [[Dispatcher Bot]] | issues found |
| [[Metricool Link clicks Trend]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate Email Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Daily Email Cap Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Cap Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Send Window Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Opt-out Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Opt-out Line Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Mailing Address Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Email Length Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Claim Words Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Unsourced Number Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Blackout Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[TikTok Cap Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Post Hours Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Quora Mute Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sent Log Hygiene Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Home Baseline Guard]] | feed | [[Dispatcher Bot]] | issues found |
| [[Hook Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Caption Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[CTA Picker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Script Outline Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Slide Plan Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Title Card Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Sequel Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Pinned Comment Maker: ranked schools]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Hook Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Caption Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[CTA Picker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Script Outline Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Slide Plan Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Title Card Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Sequel Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Pinned Comment Maker: character stories]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Hook Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Caption Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[CTA Picker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Script Outline Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Slide Plan Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Title Card Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Sequel Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Pinned Comment Maker: tiered interview questions]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Hook Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Caption Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[CTA Picker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Script Outline Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Slide Plan Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Title Card Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Sequel Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Pinned Comment Maker: live market news]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Hook Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Caption Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[CTA Picker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Script Outline Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Slide Plan Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Title Card Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Sequel Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Pinned Comment Maker: league tables]] | feed | [[Content Brief Bot]] | drafts for tomorrow |
| [[Metricool Followers Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Followers Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Views Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Views Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Reach Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Reach Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Likes Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Likes Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Comments Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Comments Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Shares Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Shares Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Saves Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Saves Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Posts published Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Posts published Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Profile visits Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Profile visits Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Link clicks Reader]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Metricool Link clicks Trend]] | feed | [[Post Log Bot]] | real views from Metricool |
| [[Duplicate Email Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Daily Email Cap Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[School Cap Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Send Window Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Opt-out Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Opt-out Line Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Mailing Address Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Email Length Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Claim Words Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Unsourced Number Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Blackout Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[TikTok Cap Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Post Hours Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Quora Mute Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Sent Log Hygiene Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Home Baseline Guard]] | gate | [[Content Brief Bot]] | hard-rule check |
| [[Club Finder Queries: Ohio]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: Ohio]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: Ohio]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: Big Ten]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: Big Ten]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: Big Ten]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: SEC]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: SEC]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: SEC]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: ACC]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: ACC]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: ACC]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: Big 12]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: Big 12]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: Big 12]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: Ivy League]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: Ivy League]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: Ivy League]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: West]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: West]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: West]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: New York area]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: New York area]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: New York area]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: Texas]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: Texas]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: Texas]] | feed | [[Today List Bot]] | outreach to do |
| [[Club Finder Queries: Southeast]] | feed | [[Today List Bot]] | outreach to do |
| [[School Roster: Southeast]] | feed | [[Today List Bot]] | outreach to do |
| [[Region De-dupe: Southeast]] | feed | [[Today List Bot]] | outreach to do |
| [[Meta Description Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Title Length Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Canonical Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[OG Image Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Image Alt Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Language Tag Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Viewport Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Missing H1 Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Double H1 Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Insecure Link Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Link Safety Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Empty Link Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Leftover Text Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Double Space Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Twitter Card Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Theme Color Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Email Link Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Deck Source Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Deck CTA Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Render Count Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Wire Past Rows Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Ticker Null Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Log Date Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Idea Type Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Posted Log Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Punch Log Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Topics Gap Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Legal Address Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Email Template Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Service Worker Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[Sitemap Fixer]] | feed | [[Today List Bot]] | exact fix text |
| [[SEO Brief: Investment banking interview questions]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: LBO model]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: DCF]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Accretion and dilution]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Comparable company analysis]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Private equity recruiting]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Superday]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Networking and cold email]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Resume]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Restructuring]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Hedge funds]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Accounting for finance interviews]] | feed | [[Dispatcher Bot]] | issues found |
| [[Thin Page Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Heading Depth Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Internal Link Count Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[FAQ Schema Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Article Schema Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Title Keyword Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Description Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate Title Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate Description Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Freshness Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Guide CTA Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Image Alt Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[H1 Match Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Page Length Balance Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Pages: Consulting]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Pages: Hedge funds]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Pages: Investment banking]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Pages: Private equity]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Pages: Sales and trading]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Page Sameness Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Coverage Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[School Hub Link Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Robots Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sitemap Size Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sitemap Date Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[llms.txt Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Canonical Conflict Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Noindex Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[URL Slug Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Page Weight Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Blocking Script Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sitemap HTTPS Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Redirect Rule Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Breadcrumb Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[AI Citation Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Social Preview Checker]] | feed | [[Dispatcher Bot]] | issues found |
| [[Career Center Link Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Club Resource Link Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Community Answer Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Unlinked Mention Finder]] | feed | [[Dispatcher Bot]] | issues found |
| [[Roundup Page Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Newsletter Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Guest Spot Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Directory Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Reference Page Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Faculty Page Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Video Description Targets]] | feed | [[Dispatcher Bot]] | issues found |
| [[Link Pitch Drafter]] | feed | [[Dispatcher Bot]] | issues found |
| [[SEO Brief: Investment banking interview questions]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: LBO model]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: DCF]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Accretion and dilution]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Comparable company analysis]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Private equity recruiting]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Superday]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Networking and cold email]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Resume]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Restructuring]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Hedge funds]] | feed | [[Today List Bot]] | SEO to do |
| [[SEO Brief: Accounting for finance interviews]] | feed | [[Today List Bot]] | SEO to do |
| [[Thin Page Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Heading Depth Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Internal Link Count Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[FAQ Schema Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Article Schema Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Title Keyword Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Description Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Duplicate Title Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Duplicate Description Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Freshness Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Guide CTA Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Image Alt Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[H1 Match Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Page Length Balance Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[School Pages: Consulting]] | feed | [[Today List Bot]] | SEO to do |
| [[School Pages: Hedge funds]] | feed | [[Today List Bot]] | SEO to do |
| [[School Pages: Investment banking]] | feed | [[Today List Bot]] | SEO to do |
| [[School Pages: Private equity]] | feed | [[Today List Bot]] | SEO to do |
| [[School Pages: Sales and trading]] | feed | [[Today List Bot]] | SEO to do |
| [[School Page Sameness Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[School Coverage Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[School Hub Link Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Robots Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Sitemap Size Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Sitemap Date Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[llms.txt Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Canonical Conflict Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Noindex Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[URL Slug Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Page Weight Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Blocking Script Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Sitemap HTTPS Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Redirect Rule Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Breadcrumb Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[AI Citation Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Social Preview Checker]] | feed | [[Today List Bot]] | SEO to do |
| [[Career Center Link Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Club Resource Link Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Community Answer Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Unlinked Mention Finder]] | feed | [[Today List Bot]] | SEO to do |
| [[Roundup Page Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Newsletter Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Guest Spot Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Directory Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Reference Page Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Faculty Page Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Video Description Targets]] | feed | [[Today List Bot]] | SEO to do |
| [[Link Pitch Drafter]] | feed | [[Today List Bot]] | SEO to do |
| [[Learn Sample Size Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Snapshot Age Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Activation Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Feedback Tally Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Too-Hard Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Reach Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Drop-off Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Hard Levels Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Missed Questions Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Miss Rate Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tool Usage Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Ask Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tracking: Lessons]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tracking: Number reps]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tracking: Timed mock]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tracking: Model Lab]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tracking: Pitch Room]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Tracking Summary Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Topic Gap Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Certificate Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Case Study Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Template Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Free Hook Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Ladder Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Price Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Guarantee Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Community Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Proof Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Format Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Crawl Age Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Crawl Queue Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Crawl Source Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Brief Bot]] | feed | [[Dispatcher Bot]] | learn issues |
| [[Learn Sample Size Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Snapshot Age Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Activation Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Feedback Tally Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Too-Hard Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Reach Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Drop-off Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Hard Levels Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Missed Questions Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Miss Rate Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tool Usage Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Ask Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tracking: Lessons]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tracking: Number reps]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tracking: Timed mock]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tracking: Model Lab]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tracking: Pitch Room]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Tracking Summary Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Topic Gap Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Certificate Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Case Study Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Template Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Free Hook Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Ladder Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Price Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Guarantee Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Community Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Proof Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Format Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Crawl Age Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Crawl Queue Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Crawl Source Bot]] | feed | [[Today List Bot]] | learn to do |
| [[Learn Brief Bot]] | feed | [[Today List Bot]] | learn to do |

Types: **feed** passes findings, **act** gives work, **gate** can block, **recheck** verifies, **learn** changes future behavior.

## What it will never do
Deploy, push to `main`, send an email, delete anything, touch the Home page, billing code or auth. See [[Guardrails]].

## First live run (Nov 25)
All 7 sensors ran with 0 failures. 7 issues opened, 0 safely fixable, so the Fixer did nothing. That is the honest result: most real problems here need a person.

| Issue | Routed to |
|---|---|
| 164 questions where the right answer is the longest option (13%) | Human |
| 859 visitors saw a guide call-to-action, 2 clicked | Human |
| 98% of 1,864 visitors never start a level | Human |
| Ticker prices 4 days old | Human |
| 79 weak distractors (6%) | Watch |
| 267 guides mention past years near recruiting words | Watch |

Daily output lands in [[Circle digest 2026-11-25]].
