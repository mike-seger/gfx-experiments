(
echo export default { fileList: "["

find . -name index\*html | grep -v ^./index | sed -e "s#^./##" | sort |\
while read f; do 
	printf "%s,\n" "'$f'"
done
echo "null ] }"
) >FileList.js