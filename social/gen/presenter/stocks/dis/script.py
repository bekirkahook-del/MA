segs=[("hook",["Disney just grew revenue [[sixteen percent|16%]] and raised its dividend by a third.","Wall Street says buy.","Here's why we're bullish."]),
("1",["Reason one is streaming.","Streaming profit more than doubled to [[eight hundred twenty-four million|$824M]] last quarter."]),
("2",["Reason two is the parks.","Parks profit rose [[twenty percent|20%]] to [[two point two five billion|$2.25B]], and Disney World bookings are pacing up."]),
("3",["Reason three is cash back to you.","Disney is raising its dividend to [[two dollars|$2]] a share, and plans about [[nine billion|$9B]] in buybacks."]),
("4",["Reason four is the price.","Disney expects double-digit earnings growth next year, and trades at about [[sixteen times|16x]] forward earnings."]),
("risk",["The risk?","Content spending jumps to [[twenty-six billion|$26B]] next year, and parks in Shanghai and Hong Kong are under pressure."]),
("cta",["This is our opinion, not financial advice.","Follow Blue Chip Financial for more."])]
import re
def spoken(p): return re.sub(r"\[\[(.*?)\|(.*?)\]\]",r"\1",p)
