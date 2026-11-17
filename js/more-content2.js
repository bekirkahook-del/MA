/* Batch 2: recruiting, networking, PE structure, buy side, stock pitch questions */
(function(){
"use strict";
let n=0;const Q=(t,a,w,e)=>{const p=n++%4,o=w.slice();o.splice(p,0,a);return[t,o,p,e]};
const ADD={
"ib-0":[
Q("Which is a front-office role?","Investment banking analyst",["Compliance officer","Settlement clerk","Internal auditor"],"Front office people work directly with clients and deals."),
Q("ECM (equity capital markets) helps companies:","Raise equity, such as IPOs and follow-ons",["Raise only bank loans","Restructure debt","Trade commodities"],"ECM bankers advise on selling stock."),
Q("DCM (debt capital markets) helps clients:","Issue bonds and other debt",["Run IPOs","Value private companies","Manage payroll"],"DCM handles debt issuance."),
Q("On a sell-side M&A deal, the advisory fee is usually mostly:","A success fee paid at closing",["An hourly rate","A flat retainer only","Paid by the buyer's lender"],"Banks are paid largely when the deal closes."),
Q("Which title sits directly above Associate?","Vice President",["Analyst","Managing Director","Intern"],"The ladder is Analyst, Associate, VP, Director, Managing Director."),
Q("Elite boutique banks are typically:","Advisory-focused, without big lending businesses",["Retail banks","Insurance companies","Hedge funds"],"They advise on deals but do not lend off a large balance sheet."),
Q("Restructuring bankers mainly advise:","Distressed companies and their creditors",["Fast-growing startups","Index funds","Retail traders"],"They work on debt reorganizations and bankruptcies."),
Q("Leveraged finance groups mainly:","Arrange debt to fund buyouts and other leveraged deals",["Run IPO roadshows","Do equity research","Audit companies"],"Levfin works with sponsors on acquisition financing.")],
"ib-1":[
Q("Which is generally true of banking recruiting?","It often starts earlier than students expect, sometimes sophomore year",["It only starts senior year","It never involves internships","It starts after graduation"],"Many summer analyst programs recruit far ahead of the internship."),
Q("A return offer is usually given at the end of:","A summer internship",["Freshman orientation","A first phone call","Graduation"],"Banks convert strong interns into full-time analysts."),
Q("What helps most before you apply to banks?","Networking and learning the technicals",["Changing your name","Waiting for the deadline","Skipping the resume"],"Applications go further when someone knows you."),
Q("A HireVue is:","A recorded one-way video interview",["A live Superday","A modeling test","A resume format"],"You answer set questions on camera, often with a timer."),
Q("A Superday is:","A set of back-to-back final interviews in one day",["A one-week training","A networking event","An offer letter"],"It is usually several interviews with different bankers.")],
"ib-2":[
Q("Best goal of a first networking call:","Learn and build rapport",["Ask for a job","Ask about pay","Pitch yourself for 30 minutes"],"People help those they like, not those who ask too fast."),
Q("A good cold email is:","Short with a clear ask for 15 minutes",["Long with your whole story","Without a subject line","A mass copy and paste with no name"],"Make it easy to say yes."),
Q("After a call you should send a thank-you:","Within about 24 hours",["After a month","Never","Only if you get an offer"],"Prompt thanks keep you top of mind."),
Q("Which question works best with an analyst?","What does a typical week on your team look like?",["Can you get me a job?","How much did you make last year?","Is your boss nice?"],"Good questions invite them to talk about their work."),
Q("Alumni networks work well because:","A shared school gives an easy opening",["Alumni must reply","Alumni run recruiting","They are required by banks"],"Common ground raises reply rates."),
Q("No reply to a cold email. A reasonable next step:","Follow up once after about a week",["Email daily","Call the office","Give up forever"],"One polite nudge is normal.")],
"ib-4":[
Q("In a Superday, 'Walk me through your resume' should take about:","Two minutes",["Ten minutes","Thirty seconds","As long as the interviewer lets you"],"Keep a clear story and finish with why finance."),
Q("The strongest 'Why investment banking?' answer is:","Specific reasons tied to your skills and experience",["Only the pay","'I don't know yet'","A copy of the firm's website"],"Interviewers look for real motivation."),
Q("If you don't know a technical answer you should:","Reason through it out loud",["Guess silently","Say 'pass'","Change the subject"],"They are testing how you think."),
Q("Which is a red flag at a Superday?","Showing up late or unprepared",["Asking a thoughtful question","Taking a moment to think","Bringing a notepad"],"Basic professionalism matters."),
Q("After a Superday you should:","Send thank-you notes",["Wait silently","Ask for feedback in person only","Post about it online"],"A short thank-you is standard."),
Q("A good question to ask your interviewer:","What deals or projects have you enjoyed most?",["What is the salary?","How soon can I leave?","Do you like your job?"],"It shows curiosity and gets them talking.")],
"pe-0":[
Q("PE firms raise money from:","Limited partners such as pensions and endowments",["Retail depositors","Only their founders","Stock exchanges"],"LPs commit capital to the fund."),
Q("General partners (GPs):","Manage the fund and make the investments",["Provide most of the money","Lend to the fund","Audit the fund"],"GPs run the firm; LPs provide capital."),
Q("Carried interest is:","The GP's share of the fund's profits",["A management fee","Bank interest","A tax credit"],"It is commonly about 20% of profits above a hurdle."),
Q("PE management fees are usually charged on:","Committed capital, commonly around 2%",["Only profits","Share price","Employee count"],"They pay the firm's costs regardless of performance."),
Q("A typical PE fund lasts about:","Ten years",["One year","Five months","Fifty years"],"Funds invest early and exit over the later years."),
Q("Which is a common PE exit route?","Selling to a strategic buyer, another sponsor, or an IPO",["Giving shares to employees","Delisting only","Donating the company"],"Exits return cash to the fund.")],
"pe-4":[
Q("On-cycle PE recruiting means:","Firms hire analysts very early, often soon after they start banking jobs",["Hiring after five years","Hiring only MBAs","Hiring in December only"],"The process starts long before most analysts feel ready."),
Q("Headhunters in PE recruiting:","Connect candidates with firms",["Run the fund","Replace interviews","Set deal prices"],"They are a main path into on-cycle processes."),
Q("A typical PE modeling test is:","A timed LBO or paper LBO",["A trivia quiz","A marketing plan","A tax return"],"They want to see you can do the core analysis fast."),
Q("What do PE interviews stress most?","Judging deals and business quality",["Typing speed","Public speaking only","Memorizing tickers"],"PE is about picking good investments.")],
"pm-0":[
Q("Which is buy-side?","A hedge fund",["Investment bank research","Sales and trading desk","An M&A advisory team"],"Buy-side firms invest money; sell-side firms serve them."),
Q("Sell-side research analysts produce:","Ratings and reports for clients",["Fund returns","Tax filings","Loan agreements"],"Banks distribute research to institutional clients."),
Q("Hedge funds differ from mutual funds because they:","Face fewer rules and use more strategies and fees",["Cannot use leverage","Only hold bonds","Are always cheaper"],"Hedge funds have broader freedom but are for qualified investors."),
Q("AUM stands for:","Assets under management",["Annual unit margin","Average unit market","Assets under mortgage"],"It is the total money a manager runs."),
Q("A long-only fund:","Only buys securities, without shorting",["Only shorts","Only holds cash","Trades only options"],"It profits only if holdings rise.")],
"pm-2":[
Q("A stock pitch should open with:","The recommendation and the core thesis",["The company history","A long list of risks","The CEO's biography"],"Lead with what you want them to do and why."),
Q("A catalyst is:","An event that can move the price toward value",["A type of stock","A tax rule","An accounting policy"],"Without a catalyst, cheap stocks can stay cheap."),
Q("A variant perception is:","A view that differs from consensus, with a reason",["A rumor","A copy of analyst ratings","A short-term trade"],"You need an edge, not just agreement."),
Q("Target $60, price $40, downside case $30. Upside to downside ratio?","2 to 1",["1 to 1","3 to 1","1 to 2"],"Upside is $20 and downside is $10."),
Q("A pre-mortem lists:","Ways the thesis could be wrong",["Past wins","Analyst names","Dividend dates"],"It forces you to face the risks before buying."),
Q("EPS of $5 and a 14x target multiple give a price target of:","$70",["$19","$14","$50"],"5 × 14 = 70.")]
};
try{
 for(const tr of TRACKS)tr.levels.forEach((L,i)=>{const m=ADD[tr.id+"-"+i];if(!m)return;const have=new Set(L.q.map(q=>q[0]));m.forEach(q=>{if(!have.has(q[0])){L.q.push(q);have.add(q[0]);try{if(!QIDX.has(q[0]))QIDX.set(q[0],{tr,i,q})}catch(e){}}})});
}catch(e){console.error(e)}
try{renderWeakCard()}catch(e){}
})();
