const { constants, accessSync } = require('fs');
const path = require('path');

function getFileName(req, file, PATH) {
  let fileNum = 0;
  const [fileName, fileExtention] = file.split('.');

  function getFileNumber(n) {
    try {
      accessSync(path.join(PATH,
        fileName + (n !== 0 ? `(${n})` : ``) +
        `.${fileExtention}`), constants.F_OK);
      getFileNumber(++n);
    } catch (_) {
      fileNum = n;    
    }
  }

  getFileNumber(fileNum)
  return req.nameForSave = (fileName +
    (fileNum !== 0 ? `(${fileNum})` : ``) + `.${fileExtention}`); 
}
module.exports = {
    getFileName
}