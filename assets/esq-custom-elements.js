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
        }
        optionBadge.onclick = () => {
          const key = optionBadge.dataset.key;
          const value = optionBadge.dataset.value;

          this.selectedOptions[key] = value;

          this.optionBadges.forEach((badge, i) => {
            if (badge.dataset.key === key) {
              badge.classList.remove("selected");
            } else {
              let optionToCheck = [];

              this.selectedOptions.forEach((option, i) => {
                optionToCheck.push(option);
              });

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
              this.setActiveMedia(variant);
            }
          });
        };
      });
    }
  }

  setActiveMedia(variant) {
    const mediaContainer = document.querySelector(".esq-main-product__media");
    if (mediaContainer) {
      if (variant.featured_image) {
        const src = variant.featured_media.preview_image.src;
        mediaContainer
          .querySelector(".esq-media-component")
          .activateMediaByVariantSrc(src);
      }
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

class EsqProductLightBox extends HTMLElement {
  constructor() {
    super();

    this.mediaWrapper = this.querySelector(
      ".esq-product-lightbox__current-image--wrap"
    );

    this.thumbnails = this.querySelectorAll(".esq-product-lightbox__thumbnail");

    this.currentImage = this.querySelector("#currentImage");

    this.nextSlideBtn = this.querySelector(".esq-product-lightbox__next-slide");

    this.scrollBox = this.querySelector(".esq-product-lightbox__bottom-scroll");

    if (this.nextSlideBtn) {
      this.nextSlideBtn.onclick = (e) => {
        let activeThumbnailIndex;

        this.thumbnails.forEach((thumbnail, i) => {
          if (!this.mediaWrapper.querySelector("video")) {
            if (
              thumbnail.dataset.src === this.currentImage.getAttribute("src")
            ) {
              activeThumbnailIndex = i;
            }
          } else {
            const videoSource = this.mediaWrapper.querySelector(
              "video > source"
            );

            if (thumbnail.dataset.src === videoSource.getAttribute("src")) {
              activeThumbnailIndex = i;
            }
          }
        });

        if (activeThumbnailIndex === this.thumbnails.length - 1) {
          this.setMediaItem(this.thumbnails[0]);
          this.scrollToThumbnail(0);
        } else {
          this.setMediaItem(this.thumbnails[activeThumbnailIndex + 1]);
          this.scrollToThumbnail(activeThumbnailIndex + 1);
        }
      };

      this.thumbnails.forEach((thumbnail, i) => {
        thumbnail.onclick = (e) => {
          this.setMediaItem(e.target);
          this.scrollToThumbnail(i);
        };
      });

      this.scrollLeftBtn = this.querySelector(
        ".esq-product-lightbox__bottom-scroll--left"
      );

      this.scrollRightBtn = this.querySelector(
        ".esq-product-lightbox__bottom-scroll--right"
      );

      const containerWidth = this.scrollBox.offsetWidth;

      this.scrollRightBtn.onclick = (e) => {
        const currentScroll = this.scrollBox.scrollLeft;
        this.scrollBox.scroll({
          left: currentScroll + containerWidth,
          behavior: "smooth",
        });
      };

      this.scrollLeftBtn.onclick = (e) => {
        const currentScroll = this.scrollBox.scrollLeft;
        this.scrollBox.scroll({
          left: currentScroll - containerWidth,
          behavior: "smooth",
        });
      };

      this.scrollBox.onscroll = (e) => {
        if (this.scrollBox.scrollLeft === 0) {
          this.scrollLeftBtn.classList.add("hide");
        } else {
          this.scrollLeftBtn.classList.remove("hide");
        }

        const imagesWidth = this.scrollBox.querySelector(
          ".esq-product-lightbox__bottom-images"
        ).offsetWidth;

        if (
          this.scrollBox.scrollLeft + this.scrollBox.offsetWidth >=
          this.scrollBox.scrollWidth
        ) {
          this.scrollRightBtn.classList.add("hide");
        } else {
          this.scrollRightBtn.classList.remove("hide");
        }
      };
    }

    this.fullWidthImage = this.querySelector("#fullWidthImage");
    this.fullWidthModal = this.querySelector(
      ".esq-product-lightbox__full-width"
    );

    this.currentImage.onclick = (e) => {
      const src = e.target.getAttribute("src");
      this.fullWidthImage.setAttribute("src", src);
      this.fullWidthModal.classList.add("show");
      document
        .querySelector("html")
        .classList.add("esq-product-lightbox-modal-open");
    };

    this.closeFullWidthModalBtn = this.querySelector(
      ".esq-product-lightbox__close-full-width"
    );

    this.closeFullWidthModalBtn.onclick = (e) => {
      this.fullWidthModal.classList.remove("show");
      document
        .querySelector("html")
        .classList.remove("esq-product-lightbox-modal-open");
    };
  }

  activateMediaByVariantSrc(src) {
    this.thumbnails.forEach((thumbnail, i) => {
      if (`https:${thumbnail.dataset.src}` === src) {
        if (this.currentImage.getAttribute("src") != thumbnail.dataset.src) {
          this.setMediaItem(thumbnail);
          this.scrollToThumbnail(i);
        }
      }
    });
  }

  scrollToThumbnail(index) {
    index = index + 1;
    const imageWrapWidth = this.scrollBox.querySelector(
      ".esq-product-lightbox__bottom-images"
    ).offsetWidth;

    if (index != this.thumbnails.length) {
      this.scrollBox.scroll({
        left: (imageWrapWidth / this.thumbnails.length) * index,
        behavior: "smooth",
      });
    } else {
      this.scrollBox.scroll({
        left: 0,
        behavior: "smooth",
      });
    }
  }

  setMediaItem(thumbnail) {
    const mediaWrapper = this.mediaWrapper;
    const imageWrap = document.querySelector("#currentImage");

    const src = thumbnail.dataset.src;

    mediaWrapper.classList.add("changing-slides");

    if (thumbnail.classList.contains("video")) {
      //VIDEO
      const format = thumbnail.dataset.format;

      const ratio = thumbnail.dataset.width / thumbnail.dataset.height;

      const html = `<video width="100%" height="auto" class="esq-lightbox__video" controls><source src="${src}" type="video/${format}"/></video>`;

      if (mediaWrapper.querySelector(".esq-product-lightbox__video-wrap")) {
        mediaWrapper
          .querySelector(".esq-product-lightbox__video-wrap")
          .remove();
      }

      const htmlWrap = document.createElement("div");

      htmlWrap.classList.add("esq-product-lightbox__video-wrap");

      htmlWrap.innerHTML = html;

      mediaWrapper.classList.add("changing-slides");

      setTimeout(function () {
        imageWrap.classList.add("hidden");
        mediaWrapper.appendChild(htmlWrap);
        if (ratio === 16 / 9) {
          mediaWrapper.classList.add("wide-screen");
        } else if (ratio === 1) {
          mediaWrapper.classList.remove("wide-screen");
        }
      }, 250);

      setTimeout(function () {
        mediaWrapper.classList.remove("changing-slides");
      }, 550);
    } else {
      //IMAGE
      mediaWrapper.classList.add("changing-slides");

      setTimeout(function () {
        if (mediaWrapper.querySelector("video")) {
          mediaWrapper
            .querySelector(".esq-product-lightbox__video-wrap")
            .remove();
          mediaWrapper.classList.remove("wide-screen");
          const imageWrap = document.querySelector("#currentImage");
          imageWrap.classList.remove("hidden");
        }
        imageWrap.setAttribute("src", src);
      }, 250);
      setTimeout(function () {
        mediaWrapper.classList.remove("changing-slides");
      }, 550);
    }
  }
}

customElements.define("esq-product-lightbox", EsqProductLightBox);
