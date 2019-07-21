// ----------------------------------------------------------------------------
// setup

const fieldTxt = '                    '
const arrowTxt = '----->  '
const tabTxt = '        '
const newline = '\n'

// ----------------------------------------------------------------------------

let stream = process.stdout

function setStream (newStream) {
  stream = newStream
}

function arrow (msg) {
  stream.write(arrowTxt + msg + newline)
}

function spacer (msg) {
  stream.write(newline)
}

function msg (msg) {
  stream.write(tabTxt + msg + newline)
}

function field (key, value) {
  stream.write(tabTxt + key + fieldTxt.substr(key.length) + ' : ' + value + newline)
}

function subfield (key, value) {
  stream.write(tabTxt + '- ' + key + fieldTxt.substr(key.length + 2) + ' : ' + value + newline)
}

function li (msg) {
  stream.write(tabTxt + '* ' + msg + newline)
}

// ----------------------------------------------------------------------------

module.exports = {
  setStream,
  arrow,
  spacer,
  msg,
  field,
  subfield,
  li
}

// ----------------------------------------------------------------------------
