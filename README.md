# InputId


[![npm version](https://img.shields.io/npm/v/inputid.svg?style=flat-square)](https://www.npmjs.org/package/inputid)
[![Build Status](https://travis-ci.com/pedroac/js-inputid.svg?branch=master)](https://travis-ci.com/pedroac/js-inputid)
[![codecov](https://codecov.io/gh/pedroac/js-inputid/branch/master/graph/badge.svg?token=430RWSEDD2)](https://codecov.io/gh/pedroac/js-inputid)
[![Open Source Helpers](https://www.codetriage.com/pedroac/js-inputid/badges/users.svg)](https://www.codetriage.com/pedroac/js-inputid)
[![Buy me a coffee](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg)](https://www.buymeacoffee.com/pedroac)

A Javascript value object representing an HTML [form control](https://stackoverflow.com/questions/31739685/what-is-a-form-control-in-html) ID, making sure the ID generation is deterministic and unique in a document.

## :triangular_flag_on_post: Table of contents

* [Why](#why)
* [Features](#features)
* [Installation](#installation)
* [Usage](#usage)
    * [Generating an ID from a HTML element](#generating-an-id-from-a-html-element)
    * [Generating IDs for several elements](#generating-ids-for-several-elements)
    * [Generating an ID without an element](#generating-an-id-without-an-element)
    * [Generating an ID for an element that does not have a name](#generating-an-id-for-an-element-that-does-not-have-a-name)
    * [Finding an element by its ID](#finding-an-element-by-its-id)
    * [Making sure the ID is unique](#making-sure-the-id-is-unique)
    * [Generating more IDs from an ID](#generating-more-ids-from-an-id)
    * [Dealing with problematic characters](#dealing-with-problematic-characters)
* [Contributing](#contributing)
* [License](#license)

## :thinking: Why?

According to the [W3C Web Accessibility Tutorials website](https://www.w3.org/WAI/tutorials/forms/labels/):

> Whenever possible, use the label element to associate text with form elements explicitly. The `for` attribute of the label must exactly match the id of the form control.

Usually, the exact ID is a detail that is not important for a project specification. It might be anything, assuming it's unique and valid. 

Also, writing HTML forms can be tedious, crufty and error-prone. It might be better to abstract the repeatitive code, for instance, using a component. If you're using, for instance, Vuejs, and you're required to specificy an ID, you'd have to do something like this:

```html
<checkbox
    id="form_colors_red"
    label="Colors"
    name="colors"
    value="red"
    v-model="form.colors" />
```

If someone is implementing form controls dynamically (ex: a component for form input fields), it might be a good idea to generate the IDs automatically instead, especially if it's part of a library.

It might seem a good idea to generate IDs randomly or sequentially, but there's a collision risk that might cause undesirable consequences which are very hard to be detected. Also, if the result is not deterministic, it's hard to retrieve a specific element by its ID. And it would be nice if the IDs are user-friendly and valid ID in the HTML document.

`InputId` was implemented to solve all those hurdles.

## :art: Features

* Deterministic ID generation based on HTML element attributes
* Unique ID generation in a document
* ID sanitization according to the document type
* Removal of characters that might be problematic in CSS selectors
* ID generation to find an element by its ID attribute or its related labels

## :rocket: Installation

Using npm:

```bash
npm install inputid
```

## :feet: Usage

An `InputId` instantiation is a [value object](https://www.martinfowler.com/bliki/ValueObject.html) representing a form control ID. It should be immutable and can be used as a String.

It doesn't require any arguments or configuration:
```js
const InputId = require('inputid');

labelElement.htmlFor = inputElement.id = new InputId();
```

But you'd get better results if an HTML element or options are provided as an argument.

### Generating an ID from a HTML element

If the `InputId` is instantiated with a HTMLElement instance as an argument, it will generate a unique element ID in the element's document which can be used as the element's ID attribute:

```js
inputElement.id = new InputId(inputElement);
labelElement.htmlFor = element.id;
```

### Generating IDs for several elements

It's possible to loop several elements in a document and set their `id` attribute values with `InputId`: 

```js
const elements = document.getElementsByTagName('input');
elements.forEach(element => {
    element.id = new InputId(element);
    element.parentNode.getElementsByTagName('label')[0].htmlFor = element.id;
});
```

### Generating an ID without an element

`InputId` also accepts several options as an argument:

```js
inputElement.id = new InputId({
    prefix: 'form-personal-info',
    type: 'radio',
    name: 'gender',
    value: 'male'
});
labelElement.htmlFor = element.id;
```

The `type` value is the element `type` attribute value or the element `tagName`. The `type` and `value` options are redundant if the element is neither a radio button, nor a checkbox, nor an option element.

The `prefix` should be the form ID attribute value, but that is not enforced.

### Generating an ID for an element that does not have a name

Usually, a form control has at a least name:
```js
const element = document.createElement('input');
element.dataset.name = 'cpr';
element.id = new InputId(element);
```

But sometimes there are good reasons to not have a name. For instance, some value must be a number, but the input field shown to the user should be a formatted text. In that case, the formatted text shouldn't be submitted, and [form controls lacking a name are not submitted](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefname). It's easy to handle those case by providing a name in the `InputId` construction arguments besides the element which lacks the `name` attribute:

```js
const hiddenElement = document.createElement('input');
hiddenElement.name = 'cpr';
const visibleElement = document.createElement('input');
hiddenElement.type = 'text';
visibleElement.id = new InputId({
    element: visibleElement,
    name: 'cpr'
});
```

### Finding an element by its ID

It's easy to find an element by its ID if the options used to instantiate InputId is known (but `forceUniqueness` must not be `true`):

```js
const inputId = new InputId({
    prefix: 'form-personal-info',
    type: 'radio',
    name: 'gender',
    value: 'male'
});
const element = inputId.getElement();
const label = inputId.getLabels()[0];
```

### Making sure the ID is unique

There shouldn't exist elements with the same name and value in a form, but if (for some reason) that's a possibility, make sure "the `forceUniqueness` option value is `true`:

```js
inputElement.id = new InputId({
    prefix: 'form-personal-info',
    type: 'radio',
    name: 'gender',
    value: 'male',
    forceUniqueness: true
});
labelElement.htmlFor = element.id;
```

If an HTML element is not provided (as the constructor argument or an option), `forceUniqueness` is `false` by default.

### Generating more IDs from an ID

Each InputId instantiation is immutable, but it can produce modified copies with [method chaining](https://medium.com/backticks-tildes/understanding-method-chaining-in-javascript-647a9004bd4f):

```js
const baseId = new InputId({prefix: 'form-personal-info'})
    .forceUniqueness();
nameElement.id = new InputId({name: 'name'});
genderElement.id = baseId
    .withType('radio')
    .withName('gender')
    .withValue('male');
```

### Dealing with problematic characters

[In HTML4, an "id" attribute value must](https://www.w3.org/TR/html4/types.html#type-id):
> begin with a letter ([A-Za-z]) and may be followed by any number of letters, digits ([0-9]), hyphens ("-"), underscores ("_"), colons (":<zero-width space>"), and periods (".")

To conform to that specification, if the document is not an HTML5 document, all the invalid characters are removed or replaced. If the first character is not a letter, a prefix is added.

In any case, some characters are always replaced to avoid possible issues in CSS selectors. It's also guaranteed the generated ID is not empty at least using a fallback (by default it's the letter "f"), which can be changed:
```js
const element = inputElement.id = new InputId({
    fallback: 'hidden_name'
});
```

## :wrench: Contributing

Improvements and suggestions are welcome.

Before sending a pull request, make sure all the tests pass after changing the code:
```bash
npm test
```

The test implementations are inside the `./tests` folder.

## :scroll: License
ISC (see the [LICENSE.txt](LICENSE.txt) file)
