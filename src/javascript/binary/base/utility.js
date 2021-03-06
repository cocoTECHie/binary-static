/**
 * Write loading image to a container for ajax request
 *
 * @param container: a DOM element
 * @param theme: dark or white
 */
const showLoadingImage = (container, theme = 'dark') => {
    const loading_div = createElement('div', { class: `barspinner ${theme}`, html: Array.from(new Array(5)).map((x, i) => `<div class="rect${i + 1}"></div>`).join('') });
    container.html(loading_div);
};

/**
 * Returns the highest z-index in the page.
 * Accepts a jquery style selector to only check those elements,
 * uses all container tags by default
 * If no element found, returns null.
 *
 * @param selector: a jquery style selector for target elements
 * @return int|null
 */
const getHighestZIndex = (selector = 'div,p,area,nav,section,header,canvas,aside,span') => {
    const elements = selector.split(',');
    const all      = [];

    for (let i = 0; i < elements.length; i++) {
        const els = document.getElementsByTagName(elements);
        for (let j = 0; j < els.length; j++) {
            if (els[i].offsetParent) {
                const z = els[i].style['z-index'];
                if (!isNaN(z)) {
                    all.push(z);
                }
            }
        }
    }

    return all.length ? Math.max(...all) : null;
};

const downloadCSV = (csv_contents, filename = 'data.csv') => {
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(new Blob([csv_contents], { type: 'text/csv;charset=utf-8;' }), filename);
    } else { // Other browsers
        const csv           = `data:text/csv;charset=utf-8,${csv_contents}`;
        const download_link = createElement('a', { href: encodeURI(csv), download: filename });

        if (document.body) {
            document.body.appendChild(download_link);
            download_link.click();
            document.body.removeChild(download_link);
        }
    }
};

const template = (string, content) => string.replace(/\[_(\d+)]/g, (s, index) => content[(+index) - 1]);

const isEmptyObject = (obj) => {
    let is_empty = true;
    if (obj && obj instanceof Object) {
        Object.keys(obj).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(obj, key)) is_empty = false;
        });
    }
    return is_empty;
};

const cloneObject = obj => (!isEmptyObject(obj) ? $.extend(true, Array.isArray(obj) ? [] : {}, obj) : obj);

const getPropertyValue = (obj, k) => {
    let keys = k;
    if (!Array.isArray(keys)) keys = [keys];
    if (!isEmptyObject(obj) && keys[0] in obj && keys && keys.length > 1) {
        return getPropertyValue(obj[keys[0]], keys.slice(1));
    }
    // else return clone of object to avoid overwriting data
    return obj ? cloneObject(obj[keys[0]]) : undefined;
};

const handleHash = () => {
    const hash = window.location.hash;
    if (hash) {
        document.querySelector(`a[href="${hash}"]`).click();
    }
};

const clearable = (element) => {
    element.addClass('clear');
    document.addEventListener('mousemove', (e) => {
        if (/clear/.test(e.target.classList)) {
            e.stopPropagation();
            e.target.toggleClass('onClear', e.target.offsetWidth - 18 < e.clientX - e.target.getBoundingClientRect().left);
        }
    });
    document.addEventListener('mousedown', (e) => {
        if (/onClear/.test(e.target.classList)) {
            e.stopPropagation();
            e.target.setAttribute('data-value', '');
            e.target.classList.remove('clear', 'onClear');
            e.target.value = '';
            e.target.dispatchEvent(new Event('change'));
        }
    });
};

/**
 * Creates a DOM element and adds any attributes to it.
 *
 * @param {String} tag_name: the tag to create, e.g. 'div', 'a', etc
 * @param {Object} attributes: all the attributes to assign, e.g. { id: '...', class: '...', html: '...', ... }
 * @return the created DOM element
 */
const createElement = (tag_name, attributes) => {
    const el = document.createElement(tag_name);
    Object.keys(attributes).forEach((attr) => {
        const value = attributes[attr];
        if (attr === 'text') {
            el.textContent = value;
        } else if (attr === 'html') {
            el.html(value);
        } else {
            el.setAttribute(attr, value);
        }
    });
    return el;
};

/**
 * Apply function to all elements based on selector passed
 *
 * @param {String|Element} selector: selector of the elements to apply the function to, e.g. '.class', '#id', 'tag', etc
 * can also be a DOM element
 * @param {Function} funcToRun: function to apply
 * @param {String} func_selector: method of finding the selector, optional
 * @param {Element} el_parent: parent of the selector, document by default
 */
const applyToAllElements = (selector, funcToRun, func_selector, el_parent) => {
    if (!selector || !funcToRun) {
        return;
    }

    let function_selector = func_selector;
    let element_to_select = selector;
    if (!func_selector && !element_to_select.nodeName) {
        if (/[\s#]/.test(element_to_select) || element_to_select.lastIndexOf('.') !== 0) {
            function_selector = 'querySelectorAll';
        } else if (element_to_select.lastIndexOf('.') === 0) {
            function_selector = 'getElementsByClassName';
            element_to_select = element_to_select.substring(1);
        } else if (/^[a-zA-Z]+$/.test(element_to_select)) {
            function_selector = 'getElementsByTagName';
        }
    }
    const parent_element = el_parent || document;
    const el = element_to_select.nodeName || typeof element_to_select === 'object' ? element_to_select : parent_element[function_selector](element_to_select);
    for (let i = 0; i < el.length; i++) {
        funcToRun(el[i]);
    }
};

/**
 * Checks if the element matches the selector - equivalent to jquery is()
 *
 * @param {Element} el      : element to check
 * @param {String}  selector: selector to check against, e.g. '.class', '#id', 'tag', or a combination of them
 */
const isMatch = (el, selector) => {
    const div = document.createElement('div');
    div.innerHTML = el.outerHTML;
    return !!div.querySelector(selector);
};

/**
 * Returns the first parent element that matches the selector (including el itself)
 *
 * @param {Element} el      : element to start looking for parent
 * @param {String}  selector: selector to find the element that matches to, e.g. '.class', '#id', 'tag', or a combination of them
 */
const findParent = (el, selector) => {
    if (el && el.nodeName !== 'BODY') {
        return isMatch(el, selector) ? el : findParent(el.parentNode, selector);
    }
    return null;
};

module.exports = {
    showLoadingImage,
    getHighestZIndex,
    downloadCSV,
    template,
    isEmptyObject,
    getPropertyValue,
    handleHash,
    clearable,
    createElement,
    applyToAllElements,
    findParent,
};
