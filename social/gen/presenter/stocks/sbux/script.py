segs=[("hook",["Starbucks same-store sales just jumped [[seven percent|7%]].","Wall Street says buy.","Here's why we're bullish."]),
("1",["Reason one is that customers are coming back.","In North America, transactions rose [[two point seven percent|2.7%]], so it's not just higher prices."]),
("2",["Reason two is margins.","The adjusted operating margin hit [[fourteen percent|14%]], up [[four point six|4.6]] points from a year ago."]),
("3",["Reason three is earnings.","Starbucks guided to [[three fifteen to three twenty-five|$3.15–$3.25]] a share next year, up from [[two seventy-two|$2.72]]."]),
("4",["Reason four is that it's still growing.","Starbucks plans about [[twelve hundred|1,200]] new stores next year, and its dividend yields over [[two percent|2%]]."]),
("risk",["The risk?","Total revenue is guided slightly lower next year after the China sale, and the stock trades at over [[thirty times|30x]] forward earnings."]),
("cta",["This is our opinion, not financial advice.","Follow Blue Chip Financial for more."])]
import re
def spoken(p): return re.sub(r"\[\[(.*?)\|(.*?)\]\]",r"\1",p)
