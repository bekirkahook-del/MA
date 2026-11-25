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

**Sensors** find problems. **The Circle** routes, fixes, verifies, remembers and reports. **Drafters** prepare emails and never send.

Run it all: `node tools/bots/run.mjs circle` (plan mode, changes nothing). Add `--act` to let the [[Fixer Bot]] apply safe fixes on a non-main branch.
