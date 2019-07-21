// ----------------------------------------------------------------------------
// setup

const fieldTxt = '                    '
const arrowTxt = '----->  '
const tabTxt = '        '

// ----------------------------------------------------------------------------

function arrow (msg) {
  console.log(arrowTxt + msg)
}

function spacer (msg) {
  console.log()
}

function msg (msg) {
  console.log(tabTxt + msg)
}

// field
function field (key, value) {
  console.log(tabTxt + key + fieldTxt.substr(key.length) + ' : ' + value)
}

// subfield
function subfield (key, value) {
  console.log(tabTxt + '- ' + key + fieldTxt.substr(key.length + 2) + ' : ' + value)
}

function li (msg) {
  console.log(tabTxt + '* ' + msg)
}

// ----------------------------------------------------------------------------

module.exports = {
  arrow,
  spacer,
  msg,
  field,
  subfield,
  li
}

// ----------------------------------------------------------------------------
