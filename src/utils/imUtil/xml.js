export default {
  // key获取value
  codeToValue (code, xml) {
    let label = ''
    if (xml && xml.length > 0) {
      for (let i = 0; i < xml.length; i++) {
        if (xml[i]['value'] === code + '') {
          label = xml[i]['label']
          break
        }
      }
    }
    return label
  }
}
