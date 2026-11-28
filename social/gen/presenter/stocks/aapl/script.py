segs=[("hook",["Apple just pulled in [[four hundred seventy-nine billion dollars|$479B]] in one year.","Analysts rate the stock a buy.","Here's why we're bullish too."]),
("1",["Reason one is the iPhone.","It brought in [[fifty-seven point six billion dollars|$57.6B]] last quarter, a September quarter record."]),
("2",["Reason two is services.","Things like the App Store, iCloud and Apple Music hit an all-time high of [[thirty-one point six billion dollars|$31.6B]] in one quarter."]),
("3",["Reason three is buybacks.","Apple spent [[eighty-six billion dollars|$86B]] buying back its own stock in [[fiscal twenty twenty-six|fiscal 2026]], which shrinks the share count."]),
("4",["Reason four is the cash machine.","It made [[twenty-eight billion dollars|$28B]] in operating cash flow last quarter alone, and returned all of it to shareholders."]),
("risk",["The risk?","Apple trades at about [[forty times|40x]] earnings, so any slowdown could hit the stock hard."]),
("cta",["This is our opinion, not financial advice.","Follow Blue Chip Financial for more."])]
import re
def spoken(p): return re.sub(r"\[\[(.*?)\|(.*?)\]\]",r"\1",p)
