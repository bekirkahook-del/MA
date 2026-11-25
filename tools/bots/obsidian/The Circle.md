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
