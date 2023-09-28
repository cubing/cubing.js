#!/usr/bin/env -S fish --no-config

echo "export const svgFiles = {" > index.ts
for i in *.svg
  echo -n "  \"$i\": `" >> index.ts
    cat $i >> index.ts
  echo "`," >> index.ts
end
echo "};" >> index.ts
