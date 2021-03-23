/**
 * Sanitize suggested element id value, enforcing a valid HTML id value.
 * Invalid characters are removed or replaced by a "-".
 * If the sanitization fails, then a fallback is used:
 * it might be used to replace the entire unsanitized ID or added as a prefix.
 * @see {@link https://www.w3.org/TR/html4/types.html#type-id}
 * @see {@link https://html.spec.whatwg.org/multipage/dom.html#the-id-attribute}
 * @see {@link https://stackoverflow.com/a/79022/4067232}
 * 
 * @param {String} uncleanedId The ID before the sanitization.
 * @param {DocumentType} doctype The document type.
 * @param {String} fallback A fallback for the base ID. 
 * @param {String} separator A separator used for a prefix.
 * @returns {String} The sanitized up id value.
 */
function clean(uncleanedId, doctype, fallback, separator) {
    const isHtml5 = doctype.name === 'html'
        && !doctype.publicId
        && !doctype.systemId;
    const invalidCharactersRegex = isHtml5
        ? /[^0-9\p{L}\p{M}_-]/ug
        : /[^0-9a-zA-Z_-]/g;
    const cleanedHtmlId = uncleanedId
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(invalidCharactersRegex, () => '-')
        .replace(/-(-+)/g, '-')
        .replace(/^-+|-+$|^_|_$/g, '')
        .toLowerCase();
    if (cleanedHtmlId.length === 0) {
        return fallback;
    }
    return (!isHtml5 && cleanedHtmlId[0].match(/[^a-zA-Z]/))
        ? `${fallback}${separator}${cleanedHtmlId}`
        : cleanedHtmlId;
}

/**
 * Generate a unique ID in a document with a base ID.
 * If the ID already exists in the document and the element with that ID is not
 * the one that should have it, a suffix is appended.
 * That suffix is a separator (ex: '_') and a positive integer.
 * The base ID is sanitized. A fallback base ID might be used when the sanitization
 * was not possible.
 * 
 * @param {String} baseId The base ID.
 * @param {Node} node A document or a element which should have the ID.
 * @param {String} fallback A fallback for the base ID. 
 * @param {String} separator A separator used for a suffix.
 * @returns {String} The generated ID.
 */
function generateUniqueFromBaseId(baseId, node, fallback, separator) {
    const ownerDocument = node.ownerDocument || node;
    const cleanedBaseId = clean(baseId, ownerDocument.doctype, fallback, separator);
    let idAttempt = cleanedBaseId;
    for (let attemptNumber = 1;;++attemptNumber) {
        const elementWithId = ownerDocument.getElementById(idAttempt);
        if (!elementWithId || elementWithId === node) {
            break;
        }
        idAttempt = `${cleanedBaseId}${separator}${attemptNumber}`;
    }
    return idAttempt;
}

/**
 * Get the "select" element associated with a specified "option" element.
 * 
 * @param {HTMLOptionElement} optionElement The specified "option" element.
 * @returns {HTMLSelectElement|null} The "select" element or null.
 */
function getOptionSelectElement(optionElement) {
    for (let ancestor = optionElement.parentNode; ancestor; ancestor = optionElement.parentNode) {
        if (ancestor.tagName.toLowerCase() === 'select') {
            return ancestor;
        }
    }
    return null;
}

module.exports = {
    clean,
    generateUniqueFromBaseId,
    getOptionSelectElement
};
