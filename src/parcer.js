function xmlParser(xmlRaw){

const parser = new DOMParser();
const xmlDoc = parser.parseFromString(xmlRaw, "text/xml");
const dishes = xmlDoc.getElementsByTagName("dish")
}
