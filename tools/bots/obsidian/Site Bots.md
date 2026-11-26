---
title: Site Bots (hub)
tags: [ma-prep, bots, hub]
created: 2026-11-25
project: M&A Prep
circle_role: hub
status: built, not scheduled
---

# Site Bots

Fifteen bots that watch mnaprep.com and **depend on each other**. See [[The Circle]] for how a run works and [[Guardrails]] for what they can never do.

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
    grsnap["Snapshot Puller"]
    grmetri["Metricool Puller"]
    grtag["Source Tagger"]
    gralert["Sign-up Alert"]
    grreply["Reply Triage"]
    grnudge["Nudge Writer"]
    grcomp["Competitor Watcher"]
    grreview["Review Collector"]
    grpay["Paywall Tester"]
    grchurn["Churn Watch"]
    grqdoc["Question Doctor"]
    grspeed["Page Speed Watcher"]
    grwinner["Guide Winner"]
    grleak["Funnel Leak"]
    grlink["Link Booster"]
    grref["Referral Bot"]
    grwelcome["Welcome Coverage"]
    grreact["Reactivation Bot"]
    grab["Test Planner"]
    grpost["Post-to-Signup"]
    grdigest["Morning Digest"]
    grseason["Season Bot"]
    grmagnet["Lead Magnet Bot"]
    grshare["Share Loop Bot"]
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
  grsnap -->|grow issues| dispatcher
  grmetri -->|grow issues| dispatcher
  grtag -->|grow issues| dispatcher
  gralert -->|grow issues| dispatcher
  grreply -->|grow issues| dispatcher
  grnudge -->|grow issues| dispatcher
  grcomp -->|grow issues| dispatcher
  grreview -->|grow issues| dispatcher
  grpay -->|grow issues| dispatcher
  grchurn -->|grow issues| dispatcher
  grqdoc -->|grow issues| dispatcher
  grspeed -->|grow issues| dispatcher
  grwinner -->|grow issues| dispatcher
  grleak -->|grow issues| dispatcher
  grlink -->|grow issues| dispatcher
  grref -->|grow issues| dispatcher
  grwelcome -->|grow issues| dispatcher
  grreact -->|grow issues| dispatcher
  grab -->|grow issues| dispatcher
  grpost -->|grow issues| dispatcher
  grdigest -->|grow issues| dispatcher
  grseason -->|grow issues| dispatcher
  grmagnet -->|grow issues| dispatcher
  grshare -->|grow issues| dispatcher
  grsnap -->|grow to do| todaylist
  grmetri -->|grow to do| todaylist
  grtag -->|grow to do| todaylist
  gralert -->|grow to do| todaylist
  grreply -->|grow to do| todaylist
  grnudge -->|grow to do| todaylist
  grcomp -->|grow to do| todaylist
  grreview -->|grow to do| todaylist
  grpay -->|grow to do| todaylist
  grchurn -->|grow to do| todaylist
  grqdoc -->|grow to do| todaylist
  grspeed -->|grow to do| todaylist
  grwinner -->|grow to do| todaylist
  grleak -->|grow to do| todaylist
  grlink -->|grow to do| todaylist
  grref -->|grow to do| todaylist
  grwelcome -->|grow to do| todaylist
  grreact -->|grow to do| todaylist
  grab -->|grow to do| todaylist
  grpost -->|grow to do| todaylist
  grdigest -->|grow to do| todaylist
  grseason -->|grow to do| todaylist
  grmagnet -->|grow to do| todaylist
  grshare -->|grow to do| todaylist
  reporter ==>|digest and deploy question| H
```

| Bot | Role | Job |
|---|---|---|
| [[Question QA Bot]] | Sensor | Audits all 1,248 questions for wrong keys, duplicate options, giveaways. |
| [[Site Health Bot]] | Sensor | Links, function syntax, every level opens, JS errors. |
| [[Content Freshness Bot]] | Sensor | Stale wire data and guides that mention past years. |
| [[Cost Guard Bot]] | Sensor | Netlify credits (15 per deploy) and AI usage vs limits. |
| [[Funnel Bot]] | Sensor | Where visitors drop between landing and sign-up. |
| [[Billing Audit Bot]] | Sensor | Paid vs access mismatches between Stripe and the site. |
| [[Superfeedbackbot]] | Sensor | Judges user feedback with a rubric and a consensus gate. |
| [[Retention Bot]] | Drafter | Plans review-due reminders (dry run, never sends). |
| [[Outreach Bot]] | Drafter | Drafts club and career-center emails (never sends). |
| [[Dispatcher Bot]] | Circle | Dedupes issues, scores priority, routes each to the fixer, a human, or watch. |
| [[Guard Bot]] | Circle | Allows or blocks every action: kill switch, protected files, caps, loop breaker, marketing gates. |
| [[Fixer Bot]] | Circle | Applies the few fixes that are safe to automate. Everything else becomes a packet for a human. |
| [[Verifier Bot]] | Circle | Re-runs the sensor and the tests after a fix. Reverts the patch if either fails. |
| [[Historian Bot]] | Circle | Remembers which fix types worked or got reverted and demotes the ones that fail. |
| [[Reporter Bot]] | Circle | Writes the daily digest for Bekir and says when a deploy question is due. |
| [[SEO Meta Bot]] | Sensor | Titles, descriptions, h1, canonical and og tags on every guide. |
| [[Sitemap Bot]] | Sensor | sitemap.xml vs the guide pages that really exist, and robots.txt. |
| [[Structured Data Bot]] | Sensor | JSON-LD on every guide parses and has the fields search engines need. |
| [[Accessibility Bot]] | Sensor | Missing alt text, unlabeled buttons and fields, lang, viewport, heading order. |
| [[Performance Budget Bot]] | Sensor | File weight and render-blocking scripts against a budget. |
| [[Secrets and Headers Bot]] | Sensor | Live keys committed to the repo (never prints them) and missing security headers. |
| [[Duplicate Content Bot]] | Sensor | Near-identical guide pages that search engines merge or demote. |
| [[Readability Bot]] | Sensor | Reading grade level of lessons and guides. |
| [[Rep Auditor Bot]] | Sensor | Runs every practice-problem generator 300 times and checks each problem is sane. |
| [[Coverage Gap Bot]] | Sensor | Which of the 49 levels lack a lesson, number reps or a model. |
| [[Test Coverage Bot]] | Sensor | Scripts and functions that no test names. |
| [[Dead Code Bot]] | Sensor | Scripts and functions that nothing references. |
| [[Changelog Bot]] | Circle | Plain-English list of what is waiting on staging and whether it triggers a build. |
| [[Release Bot]] | Circle | GO, CAUTION or NO-GO before a deploy. Advises only, never deploys. |
| [[Strategist Bot]] | Circle | Ranks what to build next from the other bots' evidence. |
| [[Internal Link Bot]] | Sensor | Guides nothing links to, and guides that link out to almost nothing. |
| [[Thin Content Bot]] | Sensor | Guides with too few words to rank or teach. |
| [[Keyword Cannibalization Bot]] | Sensor | Guides with the same headline competing against each other. |
| [[Typo Bot]] | Sensor | Common misspellings and repeated words in guides and the home page. |
| [[Encoding Bot]] | Sensor | Garbled characters from wrong text encoding. |
| [[Broken Image Bot]] | Sensor | Image and social-preview references that point at missing files. |
| [[Redirect Bot]] | Sensor | netlify.toml redirects that loop, chain, repeat or point at nothing. |
| [[Feed Bot]] | Sensor | feed.xml and llms.txt must only list pages that exist. |
| [[Duplicate ID Bot]] | Sensor | Repeated id attributes that break scripts and screen readers. |
| [[Leftover Debug Bot]] | Sensor | console.log and debugger statements left in shipped scripts. |
| [[Localhost Bot]] | Sensor | Development addresses left in files that ship. |
| [[External Link Bot]] | Sensor | Insecure http links, new-tab links without noopener, and which outside sites we send students to. |
| [[Install (PWA) Bot]] | Sensor | Manifest and service worker that make the site installable. |
| [[Timeout Bot]] | Sensor | Netlify functions that call outside services with no timeout (10 second limit). |
| [[Env Var Bot]] | Sensor | Inventory of environment variable names the functions read, and lookalike names. |
| [[Dependency Bot]] | Sensor | package.json hygiene and known vulnerabilities. |
| [[Wire Schema Bot]] | Sensor | Shape check on data/wire.json (ticker, calendar, earnings, news, deals). |
| [[Company List Bot]] | Sensor | The 5,800-row company directory behind Market search. |
| [[Privacy Bot]] | Sensor | Personal emails and phone numbers in public files (never prints them). |
| [[Pricing Consistency Bot]] | Sensor | The same plan must show the same price everywhere. |
| [[Claims Bot]] | Sensor | Numbers the site brags about versus what really exists. |
| [[Question Length Bot]] | Sensor | Questions and options too long to read on a phone. |
| [[Stale Year Bot]] | Sensor | Questions that name a year that is already over. |
| [[Explanation Quality Bot]] | Sensor | Explanations that are too short or only repeat the answer. |
| [[Test Runner Bot]] | Sensor | Runs the whole test suite. The Release Bot uses its answer. |
| [[Drift Bot]] | Sensor | How far staging is from main and whether merging would conflict. |
| [[Console Error Bot]] | Sensor | Opens the real site in a headless browser and records JavaScript errors. |
| [[Mobile Layout Bot]] | Sensor | Sideways scrolling, tiny tap targets and tiny text at phone width. |
| [[Sign-up and Sign-in Diagnostic Bot]] | Sensor | Funnel, code, Supabase settings and the live form for the account flow. Never signs in or submits anything. |
| [[Trend Bot]] | Circle | One snapshot a day so the digest says better or worse than yesterday. |
| [[Meta Bot]] | Circle | Audits the circle itself: stale issues, idle sensors, demoted fixers, missing bot files. |
| [[Post Log Bot]] | Sensor | Posts old enough to score (48h) that still have no views in the winners log: these are the numbers the whole flywheel runs on. |
| [[Scoreboard Sync Bot]] | Sensor | Idea types that appear in the post log but have no row in the platform scoreboard, so routing has no evidence for them. |
| [[Idea Average Bot]] | Sensor | Average views per post for every idea type, computed straight from the log. The ranking every other flywheel bot uses. |
| [[Growth Rate Bot]] | Sensor | Week-over-week change in average views per post, doubling time, and whether the log is on the compounding goal. The honest scoreboard for 'growing exponentially'. |
| [[Compounding Bot]] | Sensor | Views per post now versus the first full week in the log, as a multiple. The one number that says whether the flywheel is turning. |
| [[Spike Bot]] | Sensor | Posts over 2x the average that still have no sequel. Your rule: a spike gets a sequel within 3 days. |
| [[Flop Bot]] | Sensor | Idea types whose last three posts all stayed under 120 views on both platforms. Your rule: three in a row sends the idea to LOSERS. |
| [[Loser Watch Bot]] | Sensor | Recent or planned posts whose idea type is already in your LOSERS table, so nothing you decided to stop sneaks back in. |
| [[Saturation Bot]] | Sensor | One idea type taking over the feed, or a winner that has gone quiet. Winners fade when you repeat them every day. |
| [[Repost Bot]] | Sensor | Winners from the last 5 days that have not been reposted. Your finding: reposting a winner 18h later worked (coffee chat 1,185 vs 1,216) and reposting a flop did not. |
| [[Hook Bot]] | Sensor | Which kind of opening line wins (number-first, question-first, conflict-first), from the punch log views. |
| [[Style Rotation Bot]] | Sensor | Your video rules: never the same style twice in a row, and rotate Top 5 / 7 / 10. Also which style performs best. |
| [[Winner Board Bot]] | Sensor | Rebuilds the idea ranking from the log and says when the 'Idea types ranked' table in winners.md is out of date. |
| [[Experiment Bot]] | Sensor | Designs the one test slot for tomorrow with a written hypothesis and a pass/fail rule, so tests teach something instead of just filling a slot. |
| [[Promotion Bot]] | Sensor | Test ideas whose posts already beat the overall average, so a promising idea gets a second sample instead of being forgotten. |
| [[Retirement Bot]] | Sensor | Idea types with 3+ scored posts averaging under 120 views: retire them so slots go to winners. |
| [[Final Numbers Bot]] | Sensor | Posts still marked 'at ~34h' or 'score Nov 25' that are now old enough for final numbers. |
| [[Slot Planner]] | Sensor | Tomorrow's 3-4 post slots: at least 2 from your top winners, at most 1 test, platforms routed from the scoreboard, times spaced over 12pm to 10pm ET. |
| [[Topic Backlog Bot]] | Sensor | How many fresh, unposted topics each winning idea type has. A winner with an empty backlog is the first thing that stalls the flywheel. |
| [[Question Mine Bot]] | Sensor | Interview-question posts pulled from your own question bank: ready-to-use questions with numbers and the right answer, so the tiered-question winner never runs dry. |
| [[Newsjack Bot]] | Sensor | Live-market post candidates from your wire data: $10B+ deals, earnings today or tomorrow, macro releases. Live headline posts are a top-3 winner and only work within 24 hours. |
| [[Series Queue Bot]] | Sensor | The RANKED conference series: which conferences are still unmade, and whether the series has gone quiet. A promised conference is a promise to the audience. |
| [[Character Series Bot]] | Sensor | Your rule: one character-story episode every 2-3 days. Days since the last one, and what is already scheduled. |
| [[Timing Bot]] | Sensor | Post times for tomorrow, spaced at least 2 hours apart between 12pm and 10pm ET, with a small daily jitter so the schedule does not look robotic. |
| [[Caption Ending Bot]] | Sensor | Rotates the caption endings from your growth sprint so the same call to action is not on every post, and every post ends with a reason to visit. |
| [[Hook Template Bot]] | Sensor | Opening-line templates built from your own winning examples (conflict-first, number-first). It supplies the pattern, never a made-up number. |
| [[Repurpose Bot]] | Sensor | Winning posts missing from a platform where that idea type wins. A post that did well on one network should be cut for the others. |
| [[Platform Router Bot]] | Sensor | Where each idea type should and should not go, from your platform scoreboard (green/yellow/untested = post, red = skip). |
| [[Daily Mix Bot]] | Sensor | Whether today's posts exist yet and meet your daily rules: 3-4 posts, at least one video, nothing missing. |
| [[Gap Day Bot]] | Sensor | The next 3 days with no content made yet, so batching happens before the day starts, not during it. |
| [[Video Streak Bot]] | Sensor | Days in the last week with no video at all. Your rule: at least one video a day, and videos are where the winners are. |
| [[CTA Gate]] | Sensor | Every deck needs a call to action: your rule is every caption ends with a reason to visit mnaprep.com. |
| [[Source Gate]] | Sensor | Ranking and stat decks need a source on the slides. Your rule: source every number. |
| [[Render Gate]] | Sensor | Each deck must have one rendered image per slide in its folder before posting. |
| [[Blackout Gate]] | Sensor | No-post days you declared in DAILY.md. Nothing may be made for or logged on them. |
| [[TikTok Cap Gate]] | Sensor | Max 4 TikToks a day (your Nov 24 note: possible throttle after 6). Flags any day over the cap. |
| [[Link Gate]] | Sensor | Decks that link to the bare homepage. Your growth sprint says send social traffic to the Superday test with a utm tag. |
| [[Video Log Bot]] | Sensor | Video files that are not mentioned in any of your logs, so every video is scored 48h later. |
| [[Duplicate Post Gate]] | Sensor | Topics repeated inside 30 days. Your rule: never repeat a topic unless it was a top-3 performer, and then make a sequel. |
| [[Placeholder Gate]] | Sensor | Placeholder or filler text left in upcoming decks (lorem, TODO, coming soon, XXX). |
| [[Slide Readability Gate]] | Sensor | Slides with too many words to read in about 3 seconds, and first slides with a weak, wordy hook. |
| [[Quora Cadence Bot]] | Sensor | Days since your last Quora answer and answers per week. Quora is your one channel that can still link to the site. |
| [[Quora Repeat Bot]] | Sensor | Quora questions answered twice, which Quora treats as spam. |
| [[Quora Link Rule Bot]] | Sensor | Your hard rule: no mnaprep.com link in Quora answers. Scans the Quora drafts folder for one. |
| [[Quora Log Bot]] | Sensor | Log rows with a missing or malformed answer link, so every answer can be checked and scored later. |
| [[Directory Bot]] | Sensor | The next 2 free directory listings to submit today (your note: 1-2 a day, never all at once), from your directories file. |
| [[Listing Copy Bot]] | Sensor | Measures your directory copy against the limits it states: tagline 60 characters, short description 160. |
| [[Product Hunt Ready Bot]] | Sensor | Product Hunt image sizes: thumbnail 240x240 and gallery images 1270x760 (Product Hunt's stated sizes). Also the next launch dates, Tuesday to Thursday. |
| [[Share Card Bot]] | Sensor | The home-page share image used by directories and link previews: it should exist at roughly 1200x630. |
| [[Social Link Bot]] | Sensor | Every mnaprep.com page you link to in your social files and decks must exist on the site, or the link you posted is a dead end. |
| [[Outreach Bump Bot]] | Sensor | Follow-up emails that are due: club emails (bump after 5 days) and career-center emails (after 7), from the send dates in outreach-log.json. |
| [[Pending Outreach Bot]] | Sensor | Contacts you have not emailed yet (clubs with only a form, career centers with no verified inbox), so the list does not get forgotten. |
| [[Deploy Planner]] | Sensor | What is staged, whether it builds the site (15 credits) and how many deploys the month still affords. It advises; only you say deploy. |
| [[Staging Age Bot]] | Sensor | How long the oldest change has sat on staging. Work that waits too long goes stale and conflicts with main. |
| [[Free Merge Bot]] | Sensor | Staged commits that touch no site files (bots, tests, notes) and so would not trigger a build. |
| [[Credit Burn Bot]] | Sensor | Netlify credit use against the 1,000 a month and the reset date you noted (the 3rd). |
| [[Home Page Guard]] | Sensor | Your hard rule: nothing is added to the Home page unless you ask. Flags any new element id on index.html since the saved baseline. |
| [[Calendar Freshness Bot]] | Sensor | Calendar events on the wire that are already over, and no events in the next 3 days. |
| [[Earnings Freshness Bot]] | Sensor | Earnings rows dated before yesterday still sitting on the wire. |
| [[News Age Bot]] | Sensor | Headlines on the wire older than 2 days, and how old the whole wire is. |
| [[Deals Freshness Bot]] | Sensor | How recent the newest deal on the wire is. Deals are your live-market content engine. |
| [[Deal Value Bot]] | Sensor | Deals whose text value and numeric usd field disagree (for example $41.0B vs 4.1). |
| [[News Quiz Bot]] | Sensor | News quiz questions with an answer index that does not exist, or that are not about anything on today's wire. |
| [[Ticker Gap Bot]] | Sensor | Ticker rows with a missing price or a dash, so the tape never shows an empty cell. |
| [[Testimonial Slot Bot]] | Sensor | Whether the testimonial slot on the site holds any real quotes. Real quotes only; this bot never writes one. |
| [[Mailing Address Bot]] | Sensor | Marketing email needs a physical mailing address (CAN-SPAM). Looks for one on your legal pages; flags it if none exists. |
| [[Refund Window Bot]] | Sensor | The refund promise on the refund page versus what the pricing text says, so the site never promises two different windows. |
| [[Sender Address Bot]] | Sensor | Every Netlify email function should send from the same default address (hello@mnaprep.com). |
| [[Feedback Bot Idle Bot]] | Sensor | Days since the feedback bot last ran. Student feedback is your fastest signal. |
| [[Digest Age Bot]] | Sensor | Whether the circle has run today. If not, every number in the digest is yesterday's. |
| [[Canonical Tag Bot]] | Sensor | Guide pages with no canonical link or one that points somewhere else. Your social traffic lands on these pages. |
| [[Guide Share Image Bot]] | Sensor | Guides with no share image, so a guide posted on social shows as a bare link. |
| [[Answer Position Bot]] | Sensor | Where the right answers sit (A, B, C, D). Your hub note says the keys skew to B; students notice and game it. |
| [[Content Brief Bot]] | Circle | The flywheel's daily page: growth, tomorrow's slots, what to fix before posting, what to stop. |
| [[Today List Bot]] | Circle | One ranked do-today list from every warning the 73 flywheel and operator bots raised. |
| [[Hook Maker: ranked schools]] | Sensor | three hook drafts for tomorrow, each copying the shape of one of this family's best posts (RANKED schools). |
| [[Caption Maker: ranked schools]] | Sensor | a caption skeleton: hook line, one value line, source line, call to action (RANKED schools). |
| [[CTA Picker: ranked schools]] | Sensor | the call to action for tomorrow, rotated by day so no two posts in a row end the same way (RANKED schools). |
| [[Script Outline Maker: ranked schools]] | Sensor | a 5-beat video outline for the family's next topic (RANKED schools). |
| [[Slide Plan Maker: ranked schools]] | Sensor | a carousel plan: cover, body slides, a source slide, a call-to-action slide (RANKED schools). |
| [[Title Card Maker: ranked schools]] | Sensor | three title-card options built from the words of the best posts (RANKED schools). |
| [[Sequel Maker: ranked schools]] | Sensor | the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days (RANKED schools). |
| [[Pinned Comment Maker: ranked schools]] | Sensor | a pinned-comment question that gets replies, which the platforms count as engagement (RANKED schools). |
| [[Hook Maker: character stories]] | Sensor | three hook drafts for tomorrow, each copying the shape of one of this family's best posts (Character stories). |
| [[Caption Maker: character stories]] | Sensor | a caption skeleton: hook line, one value line, source line, call to action (Character stories). |
| [[CTA Picker: character stories]] | Sensor | the call to action for tomorrow, rotated by day so no two posts in a row end the same way (Character stories). |
| [[Script Outline Maker: character stories]] | Sensor | a 5-beat video outline for the family's next topic (Character stories). |
| [[Slide Plan Maker: character stories]] | Sensor | a carousel plan: cover, body slides, a source slide, a call-to-action slide (Character stories). |
| [[Title Card Maker: character stories]] | Sensor | three title-card options built from the words of the best posts (Character stories). |
| [[Sequel Maker: character stories]] | Sensor | the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days (Character stories). |
| [[Pinned Comment Maker: character stories]] | Sensor | a pinned-comment question that gets replies, which the platforms count as engagement (Character stories). |
| [[Hook Maker: tiered interview questions]] | Sensor | three hook drafts for tomorrow, each copying the shape of one of this family's best posts (Tiered interview questions). |
| [[Caption Maker: tiered interview questions]] | Sensor | a caption skeleton: hook line, one value line, source line, call to action (Tiered interview questions). |
| [[CTA Picker: tiered interview questions]] | Sensor | the call to action for tomorrow, rotated by day so no two posts in a row end the same way (Tiered interview questions). |
| [[Script Outline Maker: tiered interview questions]] | Sensor | a 5-beat video outline for the family's next topic (Tiered interview questions). |
| [[Slide Plan Maker: tiered interview questions]] | Sensor | a carousel plan: cover, body slides, a source slide, a call-to-action slide (Tiered interview questions). |
| [[Title Card Maker: tiered interview questions]] | Sensor | three title-card options built from the words of the best posts (Tiered interview questions). |
| [[Sequel Maker: tiered interview questions]] | Sensor | the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days (Tiered interview questions). |
| [[Pinned Comment Maker: tiered interview questions]] | Sensor | a pinned-comment question that gets replies, which the platforms count as engagement (Tiered interview questions). |
| [[Hook Maker: live market news]] | Sensor | three hook drafts for tomorrow, each copying the shape of one of this family's best posts (Live market news). |
| [[Caption Maker: live market news]] | Sensor | a caption skeleton: hook line, one value line, source line, call to action (Live market news). |
| [[CTA Picker: live market news]] | Sensor | the call to action for tomorrow, rotated by day so no two posts in a row end the same way (Live market news). |
| [[Script Outline Maker: live market news]] | Sensor | a 5-beat video outline for the family's next topic (Live market news). |
| [[Slide Plan Maker: live market news]] | Sensor | a carousel plan: cover, body slides, a source slide, a call-to-action slide (Live market news). |
| [[Title Card Maker: live market news]] | Sensor | three title-card options built from the words of the best posts (Live market news). |
| [[Sequel Maker: live market news]] | Sensor | the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days (Live market news). |
| [[Pinned Comment Maker: live market news]] | Sensor | a pinned-comment question that gets replies, which the platforms count as engagement (Live market news). |
| [[Hook Maker: league tables]] | Sensor | three hook drafts for tomorrow, each copying the shape of one of this family's best posts (League tables). |
| [[Caption Maker: league tables]] | Sensor | a caption skeleton: hook line, one value line, source line, call to action (League tables). |
| [[CTA Picker: league tables]] | Sensor | the call to action for tomorrow, rotated by day so no two posts in a row end the same way (League tables). |
| [[Script Outline Maker: league tables]] | Sensor | a 5-beat video outline for the family's next topic (League tables). |
| [[Slide Plan Maker: league tables]] | Sensor | a carousel plan: cover, body slides, a source slide, a call-to-action slide (League tables). |
| [[Title Card Maker: league tables]] | Sensor | three title-card options built from the words of the best posts (League tables). |
| [[Sequel Maker: league tables]] | Sensor | the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days (League tables). |
| [[Pinned Comment Maker: league tables]] | Sensor | a pinned-comment question that gets replies, which the platforms count as engagement (League tables). |
| [[Club Finder Queries: Ohio]] | Sensor | three search queries to find undergraduate finance clubs (Ohio). |
| [[School Roster: Ohio]] | Sensor | which schools in the region still have no club emailed (Ohio). |
| [[Region De-dupe: Ohio]] | Sensor | schools in the region already emailed, so none gets a second email (Ohio). |
| [[Club Finder Queries: Big Ten]] | Sensor | three search queries to find undergraduate finance clubs (Big Ten). |
| [[School Roster: Big Ten]] | Sensor | which schools in the region still have no club emailed (Big Ten). |
| [[Region De-dupe: Big Ten]] | Sensor | schools in the region already emailed, so none gets a second email (Big Ten). |
| [[Club Finder Queries: SEC]] | Sensor | three search queries to find undergraduate finance clubs (SEC). |
| [[School Roster: SEC]] | Sensor | which schools in the region still have no club emailed (SEC). |
| [[Region De-dupe: SEC]] | Sensor | schools in the region already emailed, so none gets a second email (SEC). |
| [[Club Finder Queries: ACC]] | Sensor | three search queries to find undergraduate finance clubs (ACC). |
| [[School Roster: ACC]] | Sensor | which schools in the region still have no club emailed (ACC). |
| [[Region De-dupe: ACC]] | Sensor | schools in the region already emailed, so none gets a second email (ACC). |
| [[Club Finder Queries: Big 12]] | Sensor | three search queries to find undergraduate finance clubs (Big 12). |
| [[School Roster: Big 12]] | Sensor | which schools in the region still have no club emailed (Big 12). |
| [[Region De-dupe: Big 12]] | Sensor | schools in the region already emailed, so none gets a second email (Big 12). |
| [[Club Finder Queries: Ivy League]] | Sensor | three search queries to find undergraduate finance clubs (Ivy League). |
| [[School Roster: Ivy League]] | Sensor | which schools in the region still have no club emailed (Ivy League). |
| [[Region De-dupe: Ivy League]] | Sensor | schools in the region already emailed, so none gets a second email (Ivy League). |
| [[Club Finder Queries: West]] | Sensor | three search queries to find undergraduate finance clubs (West). |
| [[School Roster: West]] | Sensor | which schools in the region still have no club emailed (West). |
| [[Region De-dupe: West]] | Sensor | schools in the region already emailed, so none gets a second email (West). |
| [[Club Finder Queries: New York area]] | Sensor | three search queries to find undergraduate finance clubs (New York area). |
| [[School Roster: New York area]] | Sensor | which schools in the region still have no club emailed (New York area). |
| [[Region De-dupe: New York area]] | Sensor | schools in the region already emailed, so none gets a second email (New York area). |
| [[Club Finder Queries: Texas]] | Sensor | three search queries to find undergraduate finance clubs (Texas). |
| [[School Roster: Texas]] | Sensor | which schools in the region still have no club emailed (Texas). |
| [[Region De-dupe: Texas]] | Sensor | schools in the region already emailed, so none gets a second email (Texas). |
| [[Club Finder Queries: Southeast]] | Sensor | three search queries to find undergraduate finance clubs (Southeast). |
| [[School Roster: Southeast]] | Sensor | which schools in the region still have no club emailed (Southeast). |
| [[Region De-dupe: Southeast]] | Sensor | schools in the region already emailed, so none gets a second email (Southeast). |
| [[Meta Description Fixer]] | Sensor | Finds meta description over 160 characters across the public pages and writes the exact fix. Proposals only. |
| [[Title Length Fixer]] | Sensor | Finds page title over 65 characters across the public pages and writes the exact fix. Proposals only. |
| [[Canonical Fixer]] | Sensor | Finds page without a canonical link across the public pages and writes the exact fix. Proposals only. |
| [[OG Image Fixer]] | Sensor | Finds page without an og:image across the public pages and writes the exact fix. Proposals only. |
| [[Image Alt Fixer]] | Sensor | Finds images without alt text across the public pages and writes the exact fix. Proposals only. |
| [[Language Tag Fixer]] | Sensor | Finds page without a lang attribute across the public pages and writes the exact fix. Proposals only. |
| [[Viewport Fixer]] | Sensor | Finds page without a viewport meta across the public pages and writes the exact fix. Proposals only. |
| [[Missing H1 Fixer]] | Sensor | Finds page without an h1 across the public pages and writes the exact fix. Proposals only. |
| [[Double H1 Fixer]] | Sensor | Finds page with more than one h1 across the public pages and writes the exact fix. Proposals only. |
| [[Insecure Link Fixer]] | Sensor | Finds links that start with http:// across the public pages and writes the exact fix. Proposals only. |
| [[Link Safety Fixer]] | Sensor | Finds target=_blank links without rel=noopener across the public pages and writes the exact fix. Proposals only. |
| [[Empty Link Fixer]] | Sensor | Finds links with an empty href across the public pages and writes the exact fix. Proposals only. |
| [[Leftover Text Fixer]] | Sensor | Finds TODO or lorem text left on a page across the public pages and writes the exact fix. Proposals only. |
| [[Double Space Fixer]] | Sensor | Finds double spaces inside visible text across the public pages and writes the exact fix. Proposals only. |
| [[Twitter Card Fixer]] | Sensor | Finds page without a twitter:card tag across the public pages and writes the exact fix. Proposals only. |
| [[Theme Color Fixer]] | Sensor | Finds page without a theme-color meta across the public pages and writes the exact fix. Proposals only. |
| [[Email Link Fixer]] | Sensor | Finds mailto links with a malformed address across the public pages and writes the exact fix. Proposals only. |
| [[Deck Source Fixer]] | Sensor | Finds upcoming decks with no source line and writes the exact fix. Proposals only. |
| [[Deck CTA Fixer]] | Sensor | Finds upcoming decks with no call to action and writes the exact fix. Proposals only. |
| [[Render Count Fixer]] | Sensor | Finds decks whose rendered slide count does not match the spec and writes the exact fix. Proposals only. |
| [[Wire Past Rows Fixer]] | Sensor | Finds calendar rows already in the past and writes the exact fix. Proposals only. |
| [[Ticker Null Fixer]] | Sensor | Finds ticker rows with a missing price and writes the exact fix. Proposals only. |
| [[Log Date Fixer]] | Sensor | Finds post-log rows with no views after 4 days and writes the exact fix. Proposals only. |
| [[Idea Type Fixer]] | Sensor | Finds post-log rows whose idea type matches no family and writes the exact fix. Proposals only. |
| [[Posted Log Fixer]] | Sensor | Finds posted.md rows missing a date and writes the exact fix. Proposals only. |
| [[Punch Log Fixer]] | Sensor | Finds punch-log rows with no style and writes the exact fix. Proposals only. |
| [[Topics Gap Fixer]] | Sensor | Finds families with an empty topic list and writes the exact fix. Proposals only. |
| [[Legal Address Fixer]] | Sensor | Finds legal pages without the mailing address and writes the exact fix. Proposals only. |
| [[Email Template Fixer]] | Sensor | Finds outreach email template missing address or opt-out and writes the exact fix. Proposals only. |
| [[Service Worker Fixer]] | Sensor | Finds service worker cache version older than the last site change and writes the exact fix. Proposals only. |
| [[Sitemap Fixer]] | Sensor | Finds guides missing from the sitemap and writes the exact fix. Proposals only. |
| [[Metricool Followers Reader]] | Sensor | Followers per platform, read from the Metricool snapshot. |
| [[Metricool Followers Trend]] | Sensor | Followers change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Views Reader]] | Sensor | Views per platform, read from the Metricool snapshot. |
| [[Metricool Views Trend]] | Sensor | Views change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Reach Reader]] | Sensor | Reach per platform, read from the Metricool snapshot. |
| [[Metricool Reach Trend]] | Sensor | Reach change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Likes Reader]] | Sensor | Likes per platform, read from the Metricool snapshot. |
| [[Metricool Likes Trend]] | Sensor | Likes change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Comments Reader]] | Sensor | Comments per platform, read from the Metricool snapshot. |
| [[Metricool Comments Trend]] | Sensor | Comments change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Shares Reader]] | Sensor | Shares per platform, read from the Metricool snapshot. |
| [[Metricool Shares Trend]] | Sensor | Shares change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Saves Reader]] | Sensor | Saves per platform, read from the Metricool snapshot. |
| [[Metricool Saves Trend]] | Sensor | Saves change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Posts published Reader]] | Sensor | Posts published per platform, read from the Metricool snapshot. |
| [[Metricool Posts published Trend]] | Sensor | Posts published change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Profile visits Reader]] | Sensor | Profile visits per platform, read from the Metricool snapshot. |
| [[Metricool Profile visits Trend]] | Sensor | Profile visits change per platform against the previous snapshot; warns at -25% or worse. |
| [[Metricool Link clicks Reader]] | Sensor | Link clicks per platform, read from the Metricool snapshot. |
| [[Metricool Link clicks Trend]] | Sensor | Link clicks change per platform against the previous snapshot; warns at -25% or worse. |
| [[Duplicate Email Guard]] | Sensor | Hard-rule check: the same address or organization appearing twice in the sent log. |
| [[Daily Email Cap Guard]] | Sensor | Hard-rule check: more than 9 new emails in one day. |
| [[School Cap Guard]] | Sensor | Hard-rule check: more than 2 clubs emailed at one school. |
| [[Send Window Guard]] | Sensor | Hard-rule check: email sent outside Mon-Fri 9am-4pm ET (checks the log dates for weekends). |
| [[Opt-out Guard]] | Sensor | Hard-rule check: addresses on the opt-out list that were emailed anyway. |
| [[Opt-out Line Guard]] | Sensor | Hard-rule check: an email template with no opt-out line. |
| [[Mailing Address Guard]] | Sensor | Hard-rule check: an email template with no mailing address. |
| [[Email Length Guard]] | Sensor | Hard-rule check: an email body over 90 words. |
| [[Claim Words Guard]] | Sensor | Hard-rule check: guarantee-style claims in decks or email templates. |
| [[Unsourced Number Guard]] | Sensor | Hard-rule check: upcoming decks with numbers but no source line. |
| [[Blackout Guard]] | Sensor | Hard-rule check: an upcoming deck dated on a no-post blackout day. |
| [[TikTok Cap Guard]] | Sensor | Hard-rule check: more than 4 TikToks planned in one day. |
| [[Post Hours Guard]] | Sensor | Hard-rule check: posts planned outside 12pm-10pm ET. |
| [[Quora Mute Guard]] | Sensor | Hard-rule check: any Quora task that is still queued although Quora is dropped. |
| [[Sent Log Hygiene Guard]] | Sensor | Hard-rule check: sent-log entries whose date is not YYYY-MM-DD. |
| [[Home Baseline Guard]] | Sensor | Hard-rule check: any change to the Home page without your OK. |
| [[SEO Brief: Investment banking interview questions]] | Sensor | Content brief for the "Investment banking interview questions" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: LBO model]] | Sensor | Content brief for the "LBO model" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: DCF]] | Sensor | Content brief for the "DCF" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Accretion and dilution]] | Sensor | Content brief for the "Accretion and dilution" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Comparable company analysis]] | Sensor | Content brief for the "Comparable company analysis" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Private equity recruiting]] | Sensor | Content brief for the "Private equity recruiting" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Superday]] | Sensor | Content brief for the "Superday" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Networking and cold email]] | Sensor | Content brief for the "Networking and cold email" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Resume]] | Sensor | Content brief for the "Resume" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Restructuring]] | Sensor | Content brief for the "Restructuring" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Hedge funds]] | Sensor | Content brief for the "Hedge funds" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[SEO Brief: Accounting for finance interviews]] | Sensor | Content brief for the "Accounting for finance interviews" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers. |
| [[Thin Page Checker]] | Sensor | Scans every guide for guides under 400 words. |
| [[Heading Depth Checker]] | Sensor | Scans every guide for guides with fewer than 3 sections. |
| [[Internal Link Count Checker]] | Sensor | Scans every guide for guides linking to fewer than 3 other guides. |
| [[FAQ Schema Checker]] | Sensor | Scans every guide for guides with no FAQ markup. |
| [[Article Schema Checker]] | Sensor | Scans every guide for guides with no Article or BreadcrumbList markup. |
| [[Title Keyword Checker]] | Sensor | Scans every guide for titles that do not contain the page's main topic words. |
| [[Description Checker]] | Sensor | Scans every guide for guides with a missing or very short meta description. |
| [[Duplicate Title Checker]] | Sensor | Scans every guide for guides sharing the exact same title. |
| [[Duplicate Description Checker]] | Sensor | Scans every guide for guides sharing the exact same description. |
| [[Freshness Checker]] | Sensor | Scans every guide for guides with no visible updated date. |
| [[Guide CTA Checker]] | Sensor | Scans every guide for guides with no link into the training site. |
| [[Image Alt Checker]] | Sensor | Scans every guide for guides with images missing alt text. |
| [[H1 Match Checker]] | Sensor | Scans every guide for pages whose h1 shares no words with the title. |
| [[Page Length Balance Checker]] | Sensor | Scans every guide for the spread of guide lengths, to spot template pages that are all the same. |
| [[School Pages: Consulting]] | Sensor | Checks the school-specific Consulting guides for thin or copy-paste content. |
| [[School Pages: Hedge funds]] | Sensor | Checks the school-specific Hedge funds guides for thin or copy-paste content. |
| [[School Pages: Investment banking]] | Sensor | Checks the school-specific Investment banking guides for thin or copy-paste content. |
| [[School Pages: Private equity]] | Sensor | Checks the school-specific Private equity guides for thin or copy-paste content. |
| [[School Pages: Sales and trading]] | Sensor | Checks the school-specific Sales and trading guides for thin or copy-paste content. |
| [[School Page Sameness Checker]] | Sensor | How similar the school pages are to each other. Near-identical text across hundreds of pages is the main ranking risk of a programmatic site. |
| [[School Coverage Checker]] | Sensor | Schools that have some career pages but not all five. |
| [[School Hub Link Checker]] | Sensor | Whether each school page links to the school's other career pages, which spreads ranking power across the set. |
| [[Robots Checker]] | Sensor | Checks robots.txt blocking pages it should not. |
| [[Sitemap Size Checker]] | Sensor | Checks sitemap URL count against the guide count. |
| [[Sitemap Date Checker]] | Sensor | Checks sitemap entries with no lastmod. |
| [[llms.txt Checker]] | Sensor | Checks llms.txt, the file AI search tools read. |
| [[Canonical Conflict Checker]] | Sensor | Checks canonicals pointing at a different page. |
| [[Noindex Checker]] | Sensor | Checks pages accidentally set to noindex. |
| [[URL Slug Checker]] | Sensor | Checks slugs that are very long. |
| [[Page Weight Checker]] | Sensor | Checks guide pages over 300 KB of HTML. |
| [[Blocking Script Checker]] | Sensor | Checks guides with render-blocking scripts in the head. |
| [[Sitemap HTTPS Checker]] | Sensor | Checks sitemap URLs that are not https on the main domain. |
| [[Redirect Rule Checker]] | Sensor | Checks redirect rules in netlify.toml. |
| [[Breadcrumb Checker]] | Sensor | Checks guides with no breadcrumb markup. |
| [[AI Citation Checker]] | Sensor | Checks guides that answer a question in the first 150 words, which is what AI search quotes. |
| [[Social Preview Checker]] | Sensor | Checks guides missing og:title or og:description. |
| [[Career Center Link Targets]] | Sensor | Search queries that find university career-center resource pages that list free prep tools. |
| [[Club Resource Link Targets]] | Sensor | Queries that find club sites with a resources or links page. |
| [[Community Answer Targets]] | Sensor | Questions students ask in public forums that a guide here answers. List only; answer by hand, one useful reply at a time, never a drive-by link. |
| [[Unlinked Mention Finder]] | Sensor | Queries that find pages that mention M&A Prep without linking to it. |
| [[Roundup Page Targets]] | Sensor | Queries that find 'best free resources' lists that could add the site. |
| [[Newsletter Targets]] | Sensor | Queries for student finance newsletters that feature tools. |
| [[Guest Spot Targets]] | Sensor | Queries for student-run finance podcasts and blogs that take guests or guest posts. |
| [[Directory Targets]] | Sensor | Queries for free education and tool directories. |
| [[Reference Page Targets]] | Sensor | Queries for public wiki or guide pages that cite free study tools. |
| [[Faculty Page Targets]] | Sensor | Queries for faculty or program pages that list free student tools. |
| [[Video Description Targets]] | Sensor | Where to put the site link in your own video descriptions and bios, from your posted log. |
| [[Link Pitch Drafter]] | Sensor | A short, honest pitch for a resource-page link: what the site is, one fact it can support, no numbers you cannot show. |
| [[Learn Sample Size Bot]] | Sensor | Says how much to trust the usage numbers. Under 100 users, treat every pattern as a hint, not a result. |
| [[Learn Snapshot Age Bot]] | Sensor | Warns when the usage snapshot is old so decisions are not made on stale numbers. |
| [[Learn Activation Bot]] | Sensor | How many sign-ups ever clear a level. The first-level wall is the biggest leak in a learning site. |
| [[Learn Feedback Tally Bot]] | Sensor | Counts what users actually told you, by poll answer and report type. |
| [[Learn Too-Hard Bot]] | Sensor | Finds the 'too hard' signal in feedback and ties it to the levels where stars are lowest. |
| [[Learn Reach Bot]] | Sensor | How many players reached each level, per track. Shows where people stop. |
| [[Learn Drop-off Bot]] | Sensor | Flags a level where at least half the players from the level before never show up. |
| [[Learn Hard Levels Bot]] | Sensor | Levels where players average under 2.3 stars (out of 3). These are where it feels hardest. |
| [[Learn Missed Questions Bot]] | Sensor | Lists questions most players get wrong so they get reviewed, re-worded or taught first. |
| [[Learn Miss Rate Bot]] | Sensor | Overall share of answers that are wrong. |
| [[Learn Tool Usage Bot]] | Sensor | Which practice tools anyone has used: timed mock, spaced review, rapid, gauntlet. |
| [[Learn Ask Bot]] | Sensor | Writes the next question to ask users, picked from what is least known. |
| [[Learn Tracking: Lessons]] | Sensor | Checks that Lessons reports usage events, so you can see if anyone uses it. |
| [[Learn Tracking: Number reps]] | Sensor | Checks that Number reps reports usage events, so you can see if anyone uses it. |
| [[Learn Tracking: Timed mock]] | Sensor | Checks that Timed mock reports usage events, so you can see if anyone uses it. |
| [[Learn Tracking: Model Lab]] | Sensor | Checks that Model Lab reports usage events, so you can see if anyone uses it. |
| [[Learn Tracking: Pitch Room]] | Sensor | Checks that Pitch Room reports usage events, so you can see if anyone uses it. |
| [[Learn Tracking Summary Bot]] | Sensor | Counts the learn tools that send no events. |
| [[Learn Topic Gap Bot]] | Sensor | Topics competitors teach or sell that your lessons and guides never mention. |
| [[Learn Certificate Bot]] | Sensor | Competitors give certificates. Do you? |
| [[Learn Case Study Bot]] | Sensor | BIWS sells Excel case studies as the core of its courses. How many does Model Lab have? |
| [[Learn Template Bot]] | Sensor | Competitors sell downloadable Excel templates. Do you give any? |
| [[Learn Free Hook Bot]] | Sensor | How competitors turn free readers into emails and what you have. |
| [[Learn Ladder Bot]] | Sensor | BIWS sorts courses into Levels 1-3 so buyers know the next step. Do your tracks say what to do next? |
| [[Learn Price Bot]] | Sensor | Your prices next to what competitors show publicly. |
| [[Learn Guarantee Bot]] | Sensor | BIWS uses a 90-day money-back guarantee as the conversion lever. What do you offer? |
| [[Learn Community Bot]] | Sensor | WSO's value is the community and bank-by-bank question lists. What social features do you have? |
| [[Learn Proof Bot]] | Sensor | CFI shows ratings and review counts. Do you show proof of results? |
| [[Learn Format Bot]] | Sensor | Formats competitors use that you do not: video lessons, certificates, live sessions. |
| [[Learn Crawl Age Bot]] | Sensor | Warns when competitor facts are over 14 days old. |
| [[Learn Crawl Queue Bot]] | Sensor | The next public sites worth reading, not yet in the file. |
| [[Learn Crawl Source Bot]] | Sensor | Every competitor entry must name its page. No unsourced claims. |
| [[Learn Brief Bot]] | Sensor | One short list: the best things to build in the Learn section next, in order, with the reason for each. |
| [[Snapshot Puller]] | Sensor | Warns when the usage snapshot is over a day old. The daily scheduled task refreshes it with the read-only SQL in state/learn/refresh.sql. |
| [[Metricool Puller]] | Sensor | Checks the Metricool numbers file exists and is fresh; the scheduled task fills it. |
| [[Source Tagger]] | Sensor | Finds mnaprep.com links in your posts and bio lists that carry no utm_source, so sign-ups can be traced to a platform. |
| [[Sign-up Alert]] | Sensor | Flags a day with zero sign-ups or a spike of more than 5, so you look at what changed. |
| [[Reply Triage]] | Sensor | Sorts email replies (opt-out, interest, question, decline, auto) from state/learn/replies.json and finds opt-outs not yet on the suppression list. |
| [[Nudge Writer]] | Sensor | Drafts one reminder text for users who signed up but never cleared a level. Draft only; bulk email is never sent. |
| [[Competitor Watcher]] | Sensor | Warns when competitor facts are over 7 days old; the weekly task re-reads the public pages. |
| [[Review Collector]] | Sensor | Counts happy users and review asks. Real reviews only; none are invented. |
| [[Paywall Tester]] | Sensor | Click and dismiss rates for the upgrade bar and prompt, from site events. |
| [[Churn Watch]] | Sensor | Paying members, cancel-at-end and users gone quiet for 7 days. |
| [[Question Doctor]] | Sensor | Prints the hardest questions with their text and key so each gets checked for a wrong key, vague wording or a missing lesson. |
| [[Page Speed Watcher]] | Sensor | Tracks size of the main scripts against a saved baseline so slow pages are caught. |
| [[Guide Winner]] | Sensor | Which step of the guide funnel loses the most people. |
| [[Funnel Leak]] | Sensor | Walks the sign-up funnel and names the biggest drop. |
| [[Link Booster]] | Sensor | Guide pages that link to no other guide, which wastes the page's ranking and the reader's next step. |
| [[Referral Bot]] | Sensor | Shows whether the referral code is pulling people in. |
| [[Welcome Coverage]] | Sensor | How many users got the welcome email. |
| [[Reactivation Bot]] | Sensor | Drafts one win-back note for users quiet 7+ days. Draft only. |
| [[Test Planner]] | Sensor | Sample-size math: how many visitors a test needs before the result means anything. |
| [[Post-to-Signup]] | Sensor | Lines up what you posted each day with sign-ups that day. |
| [[Morning Digest]] | Sensor | One-line morning summary built from the other grow bots. |
| [[Season Bot]] | Sensor | Flags US holidays when outreach and posting land on closed campuses. |
| [[Lead Magnet Bot]] | Sensor | Checks whether any free download or emailed guide exists to capture emails. |
| [[Share Loop Bot]] | Sensor | Checks that clearing a level offers a share action, the cheapest growth loop. |

**Sensors** find problems. **The Circle** routes, fixes, verifies, remembers and reports. **Drafters** prepare emails and never send.

Run it all: `node tools/bots/run.mjs circle` (plan mode, changes nothing). Add `--act` to let the [[Fixer Bot]] apply safe fixes on a non-main branch.
