# Sort key for the "Investment banking by school" list: alphabetical by the university's full name.
import re
FULL = {
 "BYU": "Brigham Young", "Penn State": "Pennsylvania State", "FIU": "Florida International", "LSU": "Louisiana State", "MIT": "Massachusetts Institute of Technology",
 "NC State": "North Carolina State", "NYU Stern": "New York University", "Ole Miss": "Mississippi", "Pitt": "Pittsburgh",
 "RPI": "Rensselaer Polytechnic", "SMU": "Southern Methodist", "TCNJ": "New Jersey, College of", "TCU": "Texas Christian",
 "UC Berkeley": "California Berkeley", "UC Davis": "California Davis", "UC Irvine": "California Irvine", "UC San Diego": "California San Diego",
 "UC Santa Barbara": "California Santa Barbara", "UCLA": "California Los Angeles", "UCF": "Central Florida", "UChicago": "Chicago",
 "UConn": "Connecticut", "UMass Amherst": "Massachusetts Amherst", "UNC": "North Carolina", "UNH": "New Hampshire",
 "University at Buffalo": "Buffalo", "URI": "Rhode Island", "USC": "Southern California", "UT Austin": "Texas Austin",
 "UVA": "Virginia", "UVM": "Vermont", "Wharton": "Pennsylvania Wharton", "WashU": "Washington University in St. Louis",
}
def key(short):
    n = re.sub(r"^Investment banking from ", "", short).replace("&amp;", "&").replace("&#x27;", "'")
    n = FULL.get(n, n)
    return re.sub(r"^St\. ", "Saint ", n).lower()
