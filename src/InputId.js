'use strict';

/**
 * A value object representing an HTML form control ID.
 */
export default class InputId {
    /**
     * Make a new instance of InputId with a HTMLElement or options.
     * 
     * @param {HTMLElement|Object} options 
     * @param {HTMLElement|undefined} options.element The HTML element.
     * @param {String|undefined} options.name The element name.
     * @param {String|undefined} options.value The element value.
     * @param {String|undefined} options.type The element type.
     * @param {HTMLDocument|undefined} options.ownerDocument The element document.
     * @param {String|undefined} options.separator The ID parts separator.
     * @param {boolean|undefined} options.forceUniqueness Should the ID uniqueness be enforced?
     * @param {String|undefined} options.fallback Generated ID fallback (ex: when sanitization fails).
     */
    constructor(options = {}) {
        // set HTML element
        if (!(options instanceof Object)) {
            this._element = options;
        } else if (options.element) {
            this._element = options.element;
            options = Object.assign(
                {
                    name: this._element.name,
                    value: this._element.value,
                    type: this._element.type,
                    tagName: this._element.tagName,
                    ownerDocument: this._element.ownerDocument
                },
                options
            );
        }
        // set the ID parts separator and a base ID fallback
        this._separator = options.separator === undefined ? '_' : options.separator;
        this._fallback = options.fallback === undefined
            ? 'f'
            : options.fallback;
        // set the HTML element attributes
        this._ownerDocument = options.ownerDocument || global.document;
        if (options.name !== undefined) {
            this._name = options.name;
        }
        if (options.value !== undefined) {
            this._value = options.value;
        }
        if (options.prefix) {
            this._prefix = options.prefix;
        } else if (options.form && options.form.id) {
            this._prefix = options.form.id;
        }
        if (options.type) {
            this._type = options.type;
        } else if (options.tagName) {
            this._type = options.tagName.toLowerCase();
        }
        if (!this._name) {
            if (this._element && this._element.dataset && this._element.dataset.name) {
                this._name = this._element.dataset.name;
            } else if (!this._name && this._type === 'option') {
                const selectElement = getOptionSelectElement(options);
                this._name = selectElement ? selectElement.name : null;
            }
        }
        // check if ID uniqueness should be enforced
        this._forceUniqueness = !!this._element || !this._name;
        if (options.forceUniqueness !== undefined) {
            this._forceUniqueness = !!options.forceUniqueness;
        }
        // validate fields
        if (!this._fallback.match(/^[a-zA-Z][a-zA-Z0-9_\-]*$/g)) {
            throw new TypeError('The "fallback" option value is invalid');
        }
        if (!['_', '-', ''].includes(this._separator)) {
            throw new RangeError('The "separator" option value must be a "", or "_", or "-"');
        }
        if (this._element && !(this._element instanceof HTMLElement)) {
            throw new TypeError('The "element" option value must be HTMLElement');
        }
        if (!(this._ownerDocument instanceof HTMLDocument)) {
            throw new TypeError('The "ownerDocument" option value must be HTMLDocument');
        }
        this._string = null;
        Object.seal(this);
    }

    /**
     * @returns {String} The generated ID as a string.
     */
    valueOf() {
        return this.toString();
    }

    /**
     * 
     * @returns {String} The generated ID as a string.
     */
    toString() {
        if (this._string === null) {
            const parts = [];
            if (this._prefix !== undefined) {
                parts.push(this._prefix);
            }
            if (this._name) {
                parts.push(this._name);
            }
            if (
                this._type
                && this._value !== undefined
                && ['checkbox', 'radio', 'option'].includes(this._type)
            ) {
                parts.push(this._value);
            }
            let id = parts.join(this._separator);
            this._string = this._forceUniqueness
                ? generateUniqueFromBaseId(
                    id,
                    this._element || this._ownerDocument,
                    this._fallback,
                    this._separator
                )
                : clean(
                    id,
                    this._ownerDocument.doctype,
                    this._fallback,
                    this._separator
                );
            Object.freeze(this);
        }
        return this._string;
    }

    /**
     * @returns {Object} Data used to generate the ID as a string, excluding the HTML element.
     */
    toObject() {
        return {
            prefix: this._prefix,
            type: this._type,
            name: this._name,
            value: this._value,
            fallback: this._fallback,
            separator: this._separator,
            ownerDocument: this._ownerDocument,
            forceUniqueness: this._forceUniqueness
        };
    }

    /**
     * Copy the instance which might have a different element type.
     * @param {name} type The new element type.
     * @returns {InputId}
     */
    withType(type) {
        return new InputId(
            { ...this.toObject(), ...{ type: type } }
        );
    }

    /**
     * Copy the instance which might have a different element name.
     * @param {name} name The new element name.
     * @returns {InputId}
     */
    withName(name) {
        return new InputId(
            { ...this.toObject(), ...{ name: name } }
        );
    }

    /**
     * Copy the instance which might have a different element value.
     * @param {name} value The new element value.
     * @returns {InputId}
     */
    withValue(value) {
        return new InputId(
            { ...this.toObject(), ...{ value: value } }
        );
    }

    /**
     * Copy the instance but forcing the ID uniqueness.
     * @returns {InputId}
     */
    forceUniqueness() {
        return new InputId(
            { ...this.toObject(), ...{ forceUniqueness: true } }
        );
    }

    /**
     * Copy the instance but ignoring the ID uniqueness.
     * @returns {InputId}
     */
    ignoreUniqueness() {
        return new InputId(
            { ...this.toObject(), ...{ forceUniqueness: false } }
        );
    }

    /**
     * Find the element with an ID as the generated ID.
     * @returns {HTMLElement|null} A HTML element (if the element was found) or null.
     */
    getElement() {
        return this._ownerDocument.getElementById(this.toString());
    }

    /**
     * Find the labels associated to the element with an ID as the generated ID.
     * @returns {HTMLElement[]} A list of label elements. It's always an array.
     */
    getLabels() {
        const element = this.getElement();
        return element ? Array.from(element.labels) : [];
    }
}

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
        ? /[^0-9\p{L}\p{M}_\-]/ug
        : /[^0-9a-zA-Z_\-]/g;
    const cleanedHtmlId = uncleanedId
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(invalidCharactersRegex, () => '-')
        .replace(/-(-+)/, '-')
        .replace(/^\-+|\-+$|^_|_$/, '')
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
    let attemptNumber = 0;
    while (true) {
        const elementWithId = ownerDocument.getElementById(idAttempt);
        if (!elementWithId || elementWithId === node) {
            break;
        }
        idAttempt = `${cleanedBaseId}${separator}${++attemptNumber}`;
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
    let ancestor = null;
    while (ancestor = optionElement.parentNode) {
        if (ancestor.tagName.toLowerCase() === 'select') {
            return ancestor;
        }
    }
    return null;
}
