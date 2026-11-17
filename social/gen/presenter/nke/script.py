# [[spoken words|DISPLAY]] = what the voice says | what the caption shows
segs=[("hook",["Nike stock is down [[almost eighty percent|ALMOST 80%]] from its peak.","Wall Street says hold.","Here's why we're bullish anyway."]),
("1",["Reason one is earnings.","Nike is targeting [[three dollars to three fifty|$3–$3.50]] a share by [[twenty thirty-one|2031]].","That's more than double this year's guidance."]),
("2",["Reason two is margins.","The goal is a [[twelve to fourteen percent|12–14%]] operating margin, more than double the [[six percent|6%]] expected this year."]),
("3",["Reason three is that running is back.","Running grew double digits last quarter, and Nike expects [[four billion|$4B]] of its [[five billion|$5B]] in new sales to come from sports like running."]),
("4",["Reason four is that you get paid to wait.","Nike has raised its dividend [[twenty-four|24]] years in a row, and the yield is over [[four percent|4%]]."]),
("risk",["The risk?","Nike expects sales to shrink for about two more years, and China is still weak."]),
("cta",["This is our opinion, not financial advice.","Follow Blue Chip Financial for more."])]
import re
def spoken(p): return re.sub(r"\[\[(.*?)\|(.*?)\]\]",r"\1",p)
