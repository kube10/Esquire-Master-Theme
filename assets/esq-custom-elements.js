class EsqProductForm extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productid;
    this.submitButton = this.querySelector(".addToCartButton");
    this.submitButton.addEventListener("click", () => {
      this.addToCart(this, function () {
        openEsqMiniCart(esqMiniCartBtn);
      });
    });

    if (this.querySelector(".directCheckoutButton")) {
      this.directCheckoutButton = this.querySelector(".directCheckoutButton");
      this.directCheckoutButton.addEventListener("click", () => {
        this.addToCart(this, function () {
          window.location.href = "/checkout";
        });
      });
    }
  }

  addToCart(form, callback) {
    const body = {
      items: [
        {
          id: parseInt(form.querySelector("#variantField").value),
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
        callback();
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

customElements.define("esq-product-form", EsqProductForm);

class EsqVariantSelector extends HTMLElement {
  constructor() {
    super();
    this.variantField = this.querySelector("#variantField");
    this.optionBadges = this.querySelectorAll(".esq-option-badge");
    this.productHandle = this.dataset.producthandle;

    if (this.optionBadges.length > 0) {
      this.variants = [];

      fetch("/products/" + this.productHandle + ".js")
        .then((res) => res.json())
        .then((data) => {
          this.variants = data.variants;
          const firstSelected = this.querySelector(
            ".esq-option-badge.selected"
          );
          console.log(firstSelected);
          this.variants.forEach((variant, i) => {
            if (variant.options.includes(firstSelected.dataset.value)) {
              if (!variant.available) {
                variant.options.forEach((option, i) => {
                  if (i != firstSelected.dataset.key) {
                    const optionToDisable = this.querySelector(
                      ".esq-option-badge[data-value=" + option + "]"
                    );
                    optionToDisable.classList.add("disabled");
                  }
                });
              }
            }
          });
        })
        .catch((err) => {
          console.log(err);
        });

      this.selectedOptions = [];

      this.optionBadges.forEach((optionBadge, i) => {
        if (optionBadge.classList.contains("selected")) {
          this.selectedOptions.push(optionBadge.dataset.value);
          console.log(this.selectedOptions);
          console.log(this.variants);
          if (this.optionAvailable(this.selectedOptions, this.variants)) {
            console.log("Selected options available");
          }
        }
        optionBadge.onclick = () => {
          const key = optionBadge.dataset.key;
          const value = optionBadge.dataset.value;

          this.selectedOptions[key] = value;

          this.optionBadges.forEach((badge, i) => {
            if (badge.dataset.key === key) {
              badge.classList.remove("selected");
            } else {
              const optionToCheck = this.selectedOptions;
              optionToCheck[badge.dataset.key] = badge.dataset.value;
              if (this.optionAvailable(optionToCheck, this.variants)) {
                badge.classList.remove("disabled");
              } else {
                badge.classList.remove("selected");
                badge.classList.add("disabled");
              }
            }
          });

          optionBadge.classList.add("selected");

          this.variants.forEach((variant, i) => {
            if (
              JSON.stringify(variant.options) ==
              JSON.stringify(this.selectedOptions)
            ) {
              this.variantField.value = variant.id;
            }
          });
        };
      });
    }
  }

  optionAvailable(optionArray, variants) {
    let available = false;
    variants.forEach((variant, i) => {
      if (JSON.stringify(variant.options) == JSON.stringify(optionArray)) {
        if (variant.available === true) {
          available = true;
        }
      }
    });
    return available;
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

class EsqSlideshowClassic extends HTMLElement {
  constructor() {
    super();

    this.thumbnails = this.querySelectorAll(
      ".esq-slideshow-classic__thumbnail"
    );

    this.currentImage = this.querySelector("#currentImage");

    this.nextSlideBtn = this.querySelector(
      ".esq-slideshow-classic__next-slide"
    );

    this.nextSlideBtn.onclick = (e) => {
      let activeThumbnailIndex;

      this.thumbnails.forEach((thumbnail, i) => {
        if (
          thumbnail.getAttribute("src") ===
          this.currentImage.getAttribute("src")
        ) {
          activeThumbnailIndex = i;
        }
      });

      if (activeThumbnailIndex === this.thumbnails.length - 1) {
        this.setImageActive(this.thumbnails[0].getAttribute("src"));
      } else {
        this.setImageActive(
          this.thumbnails[activeThumbnailIndex + 1].getAttribute("src")
        );
      }
    };

    this.thumbnails.forEach((thumbnail, i) => {
      thumbnail.onclick = (e) => {
        this.setImageActive(e.target.getAttribute("src"));
      };
    });

    this.scrollBox = this.querySelector(".esq-slideshow-classic__bottom");

    let clientXStart;

    this.scrollBox.addEventListener("dragstart", (e) => {
      console.log(e.clientX);
      clientXStart = e.clientX;
    });

    this.scrollBox.addEventListener("dragend", (e) => {
      if (e.clientX > clientXStart + 150) {
        console.log("To the right");
        this.scrollBox.scroll({
          left: 500,
          behavior: "smooth",
        });
      } else if (e.clientX < clientXStart - 150) {
        console.log("To the left");
        this.scrollBox.scroll({
          left: 0,
          behavior: "smooth",
        });
      }
    });
  }

  setImageActive(src) {
    this.currentImage.classList.add("changing-slides");
    setTimeout(function () {
      this.currentImage.setAttribute("src", src);
    }, 250);
    setTimeout(function () {
      this.currentImage.classList.remove("changing-slides");
    }, 550);
  }
}

customElements.define("esq-slideshow-classic", EsqSlideshowClassic);
