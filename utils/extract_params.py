import xml.etree.ElementTree as ET
import json

#
# TODO replace XML-Lib!
#


def parse_xml_to_json2(xml_string):
    root = ET.fromstring(xml_string)
    result = {}
    for param in root.findall('.//{http://knx.org/xml/project/20}Parameter'):
        result[param.get('Name')] = param.get('Value')
    return json.dumps(result, indent=2)


path = "lib/OFM-LogicModule/src/"
template_file = path + "Logikmodul.templ.xml"
output_file = path + "Logikmodul.templ.xml.params.json"
with open(template_file, "r", encoding='utf-8') as file:
    json_result = parse_xml_to_json2(file.read())
    with open(output_file, "w", encoding='utf-8') as file2:
        file2.write(json_result)
        print('written to ' + output_file)