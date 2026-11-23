#!/bin/sh
cd /home/user/jake2
for v in chad coffee; do mkdir -p $v/vo; n=$(/home/user/cb-env/bin/python -c "import json;print(len(json.load(open('$v/lines.json'))))");
 i=1; while [ $i -le $n ]; do
  t=$(/home/user/cb-env/bin/python -c "import json;print(json.load(open('$v/lines.json'))[$i-1][0])"); e=$(/home/user/cb-env/bin/python -c "import json;print(json.load(open('$v/lines.json'))[$i-1][1])")
  [ -f $v/vo/l$i.wav ] || /home/user/cb-env/bin/python /home/user/voicelab/narrator.py "$t" $v/vo/l$i.wav $e >> $v/vo.log 2>&1
  i=$((i+1)); done; done
echo ALLDONE >> /home/user/jake2/vo.done
