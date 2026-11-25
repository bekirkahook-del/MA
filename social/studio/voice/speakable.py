"""Turn written finance text into how a person actually SAYS it, before TTS.
The AI voice mispronounces raw symbols, numbers and acronyms ("$15.1B", "EBITDA", "Q3", "7:15", "M&A").
Add new words to LEX as you hear problems; every narrator run uses this.
Usage: python speakable.py "Revenue hit $2.4B in Q3, up 12% at 7:15 AM"  -> prints the spoken form"""
import re, sys
from num2words import num2words

# finance/acronym lexicon: written -> spoken (spellings chosen so the TTS says them like a banker would)
LEX = {
    r"\bM&A\b": "M and A", r"\bIB\b": "I B", r"\bPE\b": "P E", r"\bVC\b": "V C", r"\bHF\b": "hedge fund",
    r"\bER\b": "equity research", r"\bMD\b": "M D", r"\bVP\b": "V P", r"\bPM\b": "P M", r"\bCEO\b": "C E O",
    r"\bCFO\b": "C F O", r"\bIPO\b": "I P O", r"\bDCF\b": "D C F", r"\bLBO\b": "L B O", r"\bEPS\b": "E P S",
    r"\bP/E\b": "P E ratio", r"\bEV\b": "enterprise value", r"\bEBITDA\b": "ee-bit-dah", r"\bEBIT\b": "ee-bit",
    r"\bWACC\b": "wack", r"\bCAGR\b": "kay-ger", r"\bROI\b": "R O I", r"\bROE\b": "R O E", r"\bYoY\b": "year over year",
    r"\bQoQ\b": "quarter over quarter", r"\bS&P\b": "S and P", r"\bNYSE\b": "N Y S E", r"\bNASDAQ\b": "naz-dack",
    r"\bSEC\b": "S E C", r"\bFed\b": "Fed", r"\bGDP\b": "G D P", r"\bCPI\b": "C P I", r"\bETF\b": "E T F",
    r"\bAI\b": "A I", r"\bUS\b": "U S", r"\bU\.S\.(?!\w)": "U S", r"\bJPMorgan\b": "J P Morgan", r"\bJ\.P\. Morgan\b": "J P Morgan", r"\bGoldman\b": "Goldman", r"\bNYC\b": "New York", r"\bACME\b": "Acme",
    r"\bNVIDIA\b": "en-vidia", r"\bNvidia\b": "en-vidia", r"\bTCU\b": "T C U", r"\bBYU\b": "B Y U", r"\bASU\b": "A S U",
    r"\bUSC\b": "U S C", r"\bNYU\b": "N Y U", r"\bUCLA\b": "U C L A", r"\bLSE\b": "L S E",
    r"\bvs\.?(?=\s|$)": "versus", r"\be\.g\.\b": "for example", r"\bi\.e\.\b": "that is", r"\betc\.\b": "and so on",
    r"\bSuperday\b": "super day", r"\bmnaprep\.com\b": "M and A prep dot com", r"\bAM\b": "A M",
}
SCALE = {'K': 'thousand', 'M': 'million', 'B': 'billion', 'T': 'trillion'}

def _n(x, **k):
    return num2words(x, **k).replace(' and ', ' ')   # American: "one hundred fifteen", not "...and fifteen"
def _num(s):
    return _n(float(s)) if '.' in s else _n(int(s.replace(',', '')))

def speakable(t):
    t = t.replace('–', '-').replace('—', ', ')
    # money with a written scale word: $2.52 billion -> two point five two billion dollars
    t = re.sub(r"\$(\d[\d,]*(?:\.\d+)?)\s?(thousand|million|billion|trillion)\b", lambda m: f"{_num(m.group(1))} {m.group(2)} dollars", t)
    # money with scale: $15.1B -> fifteen point one billion dollars
    t = re.sub(r"\$(\d[\d,]*(?:\.\d+)?)\s?([KMBT])\b", lambda m: f"{_num(m.group(1))} {SCALE[m.group(2)]} dollars", t)
    # plain money: $1.10 -> one dollar ten ; $100 -> one hundred dollars
    def money(m):
        v = m.group(1).replace(',', '')
        if '.' in v:
            d, c = v.split('.'); c = (c + '0')[:2]
            ds = num2words(int(d)) + (' dollar' if int(d) == 1 else ' dollars')
            if int(c) == 0: return ds
            if not int(d): return f"{_n(int(c))} cents"
            return f"{_n(int(d))} oh {_n(int(c))}" if int(c) < 10 else f"{_n(int(d))} {_n(int(c))}"   # $1.04 -> one oh four
        return num2words(int(v)) + (' dollar' if v == '1' else ' dollars')
    t = re.sub(r"\$(\d[\d,]*(?:\.\d+)?)", money, t)
    # percentages and multiples
    t = re.sub(r"(\d+(?:\.\d+)?)\s?%", lambda m: f"{_num(m.group(1))} percent", t)
    t = re.sub(r"(\d+(?:\.\d+)?)x\b", lambda m: f"{_num(m.group(1))} times", t)
    # times: 7:15 -> seven fifteen ; 7:00 -> seven ; 5:05 -> five oh five
    t = re.sub(r"\b(\d{1,2}):(\d{2})\b", lambda m: _n(int(m.group(1))) + ('' if m.group(2) == '00' else ' oh ' + _n(int(m.group(2))) if m.group(2)[0] == '0' else ' ' + num2words(int(m.group(2)))), t)
    # quarters and ranks: Q3 -> Q three ; #1 -> number one ; 1st -> first
    t = re.sub(r"\bQ([1-4])\b", lambda m: "Q " + num2words(int(m.group(1))), t)
    t = re.sub(r"#(\d+)", lambda m: "number " + _n(int(m.group(1))), t)
    t = re.sub(r"\b(\d+)(st|nd|rd|th)\b", lambda m: num2words(int(m.group(1)), to='ordinal'), t)
    # years read as years
    t = re.sub(r"\b(19|20)(\d{2})\b", lambda m: num2words(int(m.group(0)), to='year'), t)
    for k, v in LEX.items():
        t = re.sub(k, v, t)
    # any number left
    t = re.sub(r"\d[\d,]*(?:\.\d+)?", lambda m: _num(m.group(0)), t)
    return re.sub(r"\s+", " ", t).strip()

if __name__ == '__main__':
    print(speakable(' '.join(sys.argv[1:])))
