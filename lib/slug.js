// --------------------------------------------------------------------------------------------------------------------

'use strict'

module.exports = function slug (str) {
  return str
    // lowercase the string first
    .toLowerCase()
    // replace spaces with dash
    .replace(/\s+/g, '-')
    // replace non-word characters with nothing
    .replace(/[^A-Za-z0-9-]+/g, '')
    // replace multiple dashes with one
    .replace(/-+/g, '-')
    // strip dashes from the beginning
    .replace(/^-+/, '')
    // strip dashes from the end
    .replace(/-+$/, '')
}

// --------------------------------------------------------------------------------------------------------------------
