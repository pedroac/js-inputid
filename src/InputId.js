const InputIdOptions = require('./InputIdOptions');
const {clean, generateUniqueFromBaseId} = require('./functions');

/**
 * A value object representing an HTML form control ID.
 */
module.exports = class InputId {
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
        const resolvedOptions = new InputIdOptions(options);
        this._element = resolvedOptions.element;
        this._fallback = resolvedOptions.fallback;
        this._forceUniqueness = resolvedOptions.forceUniqueness;
        this._name = resolvedOptions.name;
        this._value = resolvedOptions.value;
        this._ownerDocument = resolvedOptions.ownerDocument;
        this._prefix = resolvedOptions.prefix;
        this._separator = resolvedOptions.separator;
        this._type = resolvedOptions.type;
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
            let id = this.toArray().join(this._separator);
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
     * @returns {Array} The components used to build the ID string
     *  before sanitizing and checking if it's unique in the document.
     */
    toArray() {
        const parts = [];
        if (this._prefix !== null) {
            parts.push(this._prefix);
        }
        if (this._name) {
            parts.push(this._name);
        }
        if (
            this._type
            && this._value !== null
            && ['checkbox', 'radio', 'option'].includes(this._type)
        ) {
            parts.push(this._value);
        }
        return parts;
    }

    /**
     * Copy the instance which might have a different element type.
     * @param {name} type The new element type.
     * @returns {InputId}
     */
    withType(type) {
        return new InputId(
            {...this.toObject(), ...{ type: type } }
        );
    }

    /**
     * Copy the instance which might have a different element name.
     * @param {name} name The new element name.
     * @returns {InputId}
     */
    withName(name) {
        return new InputId(
            {...this.toObject(), ...{ name: name } }
        );
    }

    /**
     * Copy the instance which might have a different element value.
     * @param {name} value The new element value.
     * @returns {InputId}
     */
    withValue(value) {
        return new InputId(
            {...this.toObject(), ...{ value: value } }
        );
    }

    /**
     * Copy the instance but forcing the ID uniqueness.
     * @returns {InputId}
     */
    forceUniqueness() {
        return new InputId(
            {...this.toObject(), ...{ forceUniqueness: true } }
        );
    }

    /**
     * Copy the instance but ignoring the ID uniqueness.
     * @returns {InputId}
     */
    ignoreUniqueness() {
        return new InputId(
            {...this.toObject(), ...{ forceUniqueness: false } }
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
};
