const {getOptionSelectElement} = require('./functions');

module.exports = class InputIdOptions {
    constructor(options) {
        this.options = options;
        Object.freeze(this);
    }

    get element() {
        let hmtlElement = this.options instanceof Object
            ? this.options.element
            : this.options;
        if (
            hmtlElement
            && !(hmtlElement instanceof HTMLElement)
        ) {
            throw new TypeError('The "element" option value must be HTMLElement');
        }
        return hmtlElement || null;
    }

    get type() {
        if (this.options.type) {
            return this.options.type;
        }
        const element = this.element;
        if (element) {
            if (element.type) {
                return element.type;
            }
            if (element.tagName) {
                return element.tagName.toLowerCase();
            }
        }
        return null;
    }

    get name() {
        if (this.options.name) {
            return this.options.name;
        }
        const element = this.element;
        if (
            element
            && element.dataset
            && element.dataset.name
        ) {
            return element.dataset.name;
        }
        if (this.type === 'option') {
            const selectElement = getOptionSelectElement(this.options);
            return selectElement ? selectElement.name : null;
        }
        return null;
    }

    get value() {
        return 'value' in this.options
            ? this.options.value
            : null;
    }

    get ownerDocument() {
        let ownerDocument = global.document;
        if (this.options.ownerDocument) {
            ownerDocument = this.options.ownerDocument;
        } else if (this.element) {
            ownerDocument = this.element.ownerDocument;
        }
        if (!(ownerDocument instanceof HTMLDocument)) {
            throw new TypeError('The "ownerDocument" option value must be HTMLDocument');
        }
        return ownerDocument;
    }

    get prefix() {
        if (this.options.prefix) {
            return this.options.prefix;
        }
        if (this.options.form && this.options.form.id) {
            return this.options.form.id;
        }
        return null;
    }

    get separator() {
        if (!('separator' in this.options)) {
            return '_';
        }
        if (!['_', '-', ''].includes(this.options.separator)) {
            throw new RangeError('The "separator" option value must be a "", or "_", or "-"');
        }
        return this.options.separator;
    }

    get fallback() {
        if (!('fallback' in this.options)) {
            return 'f';
        }
        if (!this.options.fallback.match(/^[a-zA-Z][a-zA-Z0-9_-]*$/g)) {
            throw new TypeError('The "fallback" option value is invalid');
        }
        return this.options.fallback;
    }

    get forceUniqueness() {
        if ('forceUniqueness' in this.options) {
            return !!this.options.forceUniqueness;
        }
        return !!this.element || !this.name;
    }
};
