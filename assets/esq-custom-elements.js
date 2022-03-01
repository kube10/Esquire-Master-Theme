class EsqProductForm extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productid;
    this.submitButton = this.querySelector(".addToCartButton");
    this.submitButton.addEventListener("click", () => {
      const body = {
        items: [
          {
            id: parseInt(this.querySelector("#variantField").value),
            quantity: 1,
          },
        ],
      };
      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => {
          openEsqMiniCart(esqMiniCartBtn);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }
}

customElements.define("esq-product-form", EsqProductForm);

class EsqVariantSelector extends HTMLElement {
  constructor() {
    super();
    this.variantSelectors = this.querySelectorAll(".variantSelector");
    this.variantField = this.querySelector("#variantField");
    this.variantSelectors.forEach((variantSelector, i) => {
      variantSelector.addEventListener("click", () => {
        const id = variantSelector.dataset.id;
        this.variantField.value = id;
        this.variantSelectors.forEach((variantSelector, i) => {
          variantSelector.classList.remove("selected");
        });
        variantSelector.classList.add("selected");
      });
    });
  }
}

customElements.define("esq-variant-selector", EsqVariantSelector);

class EsqCartItem extends HTMLElement {
  constructor() {
    super();

    this.removeButton = this.querySelector(".cart__item-remove-btn");
    this.removeButton.addEventListener("click", () => {
      this.removeItem(this.dataset.id);
    });

    this.changeQuantityButtons = this.querySelectorAll(".changeQuantityButton");
    this.quantityInput = this.querySelector(".quantityInput");
    this.changeQuantityButtons.forEach((button, i) => {
      button.addEventListener("click", (e) => {
        this.setQuantity(this.dataset.id, e, this.quantityInput);
      });
    });

    const $this = this;
    this.quantityInput.onchange = function () {
      $this.updateQuantity($this.dataset.id, this);
    };
  }

  //Sets the quantity of the input field in the cart line item when one of the buttons is used and triggers the onChange event on the input, updating the quantity in the cart.
  setQuantity(variant_id, evt, input) {
    if (evt.target.getAttribute("name") === "minus") {
      if (input.value > 0) {
        input.value = parseInt(input.value) - 1;
        input.onchange();
      }
    } else {
      input.value = parseInt(input.value) + 1;
      input.onchange();
    }
  }

  updateQuantity(variant_id, input) {
    const quantity = input.value;
    if (quantity === 0) {
      removeItem(variant_id);
    } else {
      const body = {
        id: variant_id,
        quantity: quantity,
      };

      fetch("/cart/change.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          renderCartItems(data);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  removeItem(variant_id) {
    const body = {
      id: variant_id,
      quantity: 0,
    };

    fetch("/cart/change.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        renderCartItems(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

customElements.define("esq-cart-item", EsqCartItem);
