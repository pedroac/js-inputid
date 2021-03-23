const InputId = require('inputid');

describe('inputId', () => {
    beforeEach(() => {
        document.documentElement.innerHTML = '';
    });

    test('generates an ID from a name', () => {
        const element = document.createElement('input');
        element.id = new InputId({name: 'username'});
        expect(element.id).toEqual('username');
    });

    test('generates an ID from a name and a prefix', () => {
        const element = document.createElement('input');
        element.id = new InputId({
            prefix: 'personal-info',
            name: 'username'
        });
        expect(element.id).toEqual('personal-info_username');
    });

    test('generates an ID from a name and a value', () => {
        expect(
            (new InputId({
                type: 'text',
                name: 'color',
                value: 'red'
            })).valueOf()
        ).toEqual('color');
        expect(
            (new InputId({
                type: 'radio',
                name: 'color',
                value: 'red'
            })).toString()
        ).toEqual('color_red');
        expect(
            (new InputId({
                type: 'checkbox',
                name: 'color',
                value: 'green'
            })).toString()
        ).toEqual('color_green');
        expect(
            (new InputId({
                type: 'option',
                name: 'color',
                value: 'blue'
            })).toString()
        ).toEqual('color_blue');
    });

    test('generates an ID from a input text element', () => {
        const element = document.createElement('input');
        element.type = 'text';
        element.name = 'username';
        element.id = new InputId(element);
        expect(element.id).toEqual('username');
    });

    test('generates an ID from an option element inside a select element', () => {
        const selectElement = document.createElement('select');
        selectElement.name = 'color';
        const optionElement = document.createElement('option');
        optionElement.value = 'red';
        selectElement.appendChild(optionElement);
        optionElement.id = new InputId(optionElement);
        expect(optionElement.id).toEqual('color_red');
    });

    test('generates an ID from an option element outside a select element', () => {
        const optionElement = document.createElement('option');
        optionElement.value = 'red';
        optionElement.id = new InputId(optionElement);
        expect(optionElement.id).toEqual('red');
    });

    test('generates an ID from a element without a name', () => {
        const element = document.createElement('input');
        element.type = 'text';
        element.id = new InputId(element);
        expect(element.id).toEqual('f');
    });

    test('copies instances with different properties', () => {
        const element = document.createElement('input');
        element.id = (new InputId())
            .withType('checkbox')
            .withName('likes')
            .withValue('programming')
            .forceUniqueness();
        expect(element.id).toEqual('likes_programming');
    });

    test('generates an ID from an HTMLElement outside a document', () => {
        const element = document.createElement('input');
        element.setAttribute('type', 'radio');
        element.setAttribute('name', 'color');
        element.setAttribute('value', 'red');
        element.id = new InputId(element);
        expect(element.id).toEqual('color_red');
    });

    test('generates an ID from an HTMLElement inside a form element with an ID', () => {
        const formElement = document.createElement('form');
        formElement.setAttribute('id', 'personal-info');
        const inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'radio');
        inputElement.setAttribute('name', 'color');
        inputElement.setAttribute('value', 'red');
        formElement.appendChild(inputElement);
        inputElement.id = new InputId(inputElement);
        expect(inputElement.id).toEqual('personal-info_color_red');
    });

    test('generates an unique ID in a document', () => {
        const inputElementA = document.createElement('input');
        inputElementA.setAttribute('type', 'text');
        inputElementA.setAttribute('name', 'name');
        const inputElementB = document.createElement('input');
        inputElementB.setAttribute('type', 'text');
        inputElementB.setAttribute('name', 'name');
        const inputElementC = document.createElement('input');
        inputElementC.setAttribute('type', 'text');
        inputElementC.setAttribute('name', 'name');
        document.body.appendChild(inputElementA);
        inputElementA.id = new InputId(inputElementA);
        document.body.appendChild(inputElementB);
        inputElementB.id = new InputId(inputElementB);
        document.body.appendChild(inputElementC);
        inputElementC.id = new InputId(inputElementC);
        expect(inputElementA.id).toEqual('name');
        expect(inputElementB.id).toEqual('name_1');
        expect(inputElementC.id).toEqual('name_2');
    });

    test('allows ignoring ID uniqueness', () => {
        const inputElementA = document.createElement('input');
        inputElementA.setAttribute('type', 'text');
        inputElementA.setAttribute('name', 'name');
        const inputElementB = document.createElement('input');
        inputElementB.setAttribute('type', 'text');
        inputElementB.setAttribute('name', 'name');
        const inputElementC = document.createElement('input');
        inputElementC.setAttribute('type', 'text');
        inputElementC.setAttribute('name', 'name');
        document.body.appendChild(inputElementA);
        inputElementA.id = new InputId(inputElementA).ignoreUniqueness();
        document.body.appendChild(inputElementB);
        inputElementB.id = new InputId(inputElementB).ignoreUniqueness();
        document.body.appendChild(inputElementC);
        inputElementC.id = new InputId(inputElementC).ignoreUniqueness();
        expect(inputElementA.id).toEqual('name');
        expect(inputElementB.id).toEqual('name');
        expect(inputElementC.id).toEqual('name');
    });

    test('sanitizes generated IDs in HTML5 documents', () => {
        document.doctype.parentNode.replaceChild(
            document.implementation.createDocumentType('html', '', ''),
            document.doctype
        );
        const inputElement = document.createElement('input');
        inputElement.id = new InputId({
            name: 'çÃó-Çªº亜[123][]'
        });
        expect(inputElement.id).toEqual('cao-cao亜-123');
    });

    test('sanitizes a generated ID in HTML4 documents', () => {
        document.doctype.parentNode.replaceChild(
            document.implementation.createDocumentType(
                'html',
                '-//W3C//DTD HTML 4.01 Transitional//EN',
                'http://www.w3.org/TR/html4/loose.dtd'
            ),
            document.doctype
        );
        const inputElement = document.createElement('input');
        inputElement.id = new InputId({
            name: 'çÃó-Çªº亜[123][]'
        });
        expect(inputElement.id).toEqual('cao-cao-123');
    });

    test('sanitizes a generated ID which first character is not a letter in HTML4 documents', () => {
        document.doctype.parentNode.replaceChild(
            document.implementation.createDocumentType(
                'html',
                '-//W3C//DTD HTML 4.01 Transitional//EN',
                'http://www.w3.org/TR/html4/loose.dtd'
            ),
            document.doctype
        );
        const inputElement = document.createElement('input');
        inputElement.id = new InputId({
            name: '1çÃó-Çªº亜[123][]'
        });
        expect(inputElement.id).toEqual('f_1cao-cao-123');
    });

    test('handles elements with a data-name attribute', () => {
        const inputElement = document.createElement('input');
        inputElement.setAttribute('data-name', 'age');
        inputElement.id = new InputId(inputElement);
        expect(inputElement.id).toEqual('age');
    });

    test('handles the "element" property', () => {
        const inputElement = document.createElement('input');
        inputElement.id = new InputId({
            element: inputElement,
            name: 'year'
        });
        expect(inputElement.id).toEqual('year');
    });

    test('gets the element with a generated ID', () => {
        const inputElement = document.createElement('input');
        inputElement.id = new InputId({
            prefix: 'pi-form',
            name: 'age'
        });
        document.body.appendChild(inputElement);
        expect(
            (new InputId({
                prefix: 'pi-form',
                name: 'age'
            })).getElement()
        ).toEqual(inputElement);
    });

    test('handles elements without associated labels', () => {
        expect(
            (new InputId({
                prefix: 'pi-form',
                name: 'age'
            })).getLabels()
        ).toHaveLength(0);
    });

    test('gets labels for an element with a generated ID', () => {
        const inputElement = document.createElement('input');
        inputElement.id = new InputId({
            prefix: 'pi-form',
            name: 'age'
        });
        document.body.appendChild(inputElement);
        const labelElement = document.createElement('label');
        labelElement.setAttribute('for', inputElement.id);
        document.body.appendChild(labelElement);
        expect(
            (new InputId({
                prefix: 'pi-form',
                name: 'age'
            })).getLabels()[0]
        ).toEqual(labelElement);
    });

    test('throws exception when fallback base ID is invalid', () => {
        expect(() => {
            new InputId({fallback: 'a0_b-c'});
        }).not.toThrow();
        expect(() => {
            new InputId({fallback: ''});
        }).toThrow();
        expect(() => {
            new InputId({fallback: '0'});
        }).toThrow();
        expect(() => {
            new InputId({fallback: 'aç'});
        }).toThrow();
    });

    test('throws exception when the separator is invalid', () => {
        expect(() => {
            new InputId({separator: '_-'});
        }).toThrow();
        expect(() => {
            new InputId({separator: 'a'});
        }).toThrow();
        expect(() => {
            new InputId({separator: '_'});
        }).not.toThrow();
        expect(() => {
            new InputId({separator: '-'});
        }).not.toThrow();
        expect(() => {
            new InputId({separator: ''});
        }).not.toThrow();
    });

    test('throws exception when the ownDocument option is invalid', () => {
        expect(() => {
            new InputId({ownerDocument: 'aaa'});
        }).toThrow();
    });

    test('throws exception when the element option is invalid', () => {
        expect(() => {
            new InputId({element: document.createElement('input')});
        }).not.toThrow();
        expect(() => {
            new InputId({
                element: document.createTextNode('txt')
            });
        }).toThrow();
        expect(() => {
            new InputId(document.createTextNode('txt'));
        }).toThrow();
    });

    test('handles empty options', () => {
        const inputElementA = document.createElement('input');
        const inputElementB = document.createElement('input');
        const inputElementC = document.createElement('input');
        document.body.appendChild(inputElementA);
        document.body.appendChild(inputElementB);
        document.body.appendChild(inputElementC);
        inputElementA.id = new InputId;
        inputElementB.id = new InputId;
        inputElementC.id = new InputId;
        expect(inputElementA.id).toEqual('f');
        expect(inputElementB.id).toEqual('f_1');
        expect(inputElementC.id).toEqual('f_2');
    });
});
