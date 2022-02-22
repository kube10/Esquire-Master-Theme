class EsqProductForm extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productid;
    this.submitButton = this.querySelector('.addToCartButton');
    this.variantId = this.querySelector('#variantField').value;

    this.submitButton.addEventListener('click', () => {
      const body = {
        "items": [
          {
            "id": parseInt(this.variantId),
            "quantity": 1
          }
        ]
      }
      fetch('/cart/add.js', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }).then(response => {
        console.log(response.json());
      }).catch(error => {
        console.log(error);
      })
    })
  }
}

customElements.define('esq-product-form', EsqProductForm);

class EsqVariantSelector extends HTMLElement {
  constructor() {
    super();
    this.variantSelectors = this.querySelectorAll('.variantSelector');
    this.variantField = this.querySelector('#variantField');
    this.variantSelectors.forEach((variantSelector, i) => {
      variantSelector.addEventListener('click', () => {
        const id = variantSelector.dataset.id;
        this.variantField.value = id;
        this.variantSelectors.forEach((variantSelector, i) => {
          variantSelector.classList.remove('selected');
        });
        variantSelector.classList.add('selected');
      });
    });
  }
}

customElements.define('esq-variant-selector', EsqVariantSelector);
