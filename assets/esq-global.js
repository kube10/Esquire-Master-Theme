const esqMiniCart = document.querySelector(".esq-mini-cart");
const cartItemsContainers = document.querySelectorAll(".cartItemsContainer");
const cardItemTemplate = document.querySelector(".cart__item.hidden");
const cartEmptyStates = document.querySelectorAll(".cartEmptyState");
const cartDefault = document.querySelectorAll(".cartDefault");

function closeEsqMiniCart() {
  esqMiniCart.classList.remove("open");
  document.querySelector("html").classList.remove("esq-mini-cart-open");
}

function openEsqMiniCart() {
  esqMiniCart.classList.add("open");
  const cartItems = fetch("/cart.js")
    .then((response) => response.json())
    .then((data) => {
      renderCartItems(data);
    });
  document.querySelector("html").classList.add("esq-mini-cart-open");
}

function renderCartItems(cartData) {
  if (cartData.items.length === 0) {
    cartDefault.forEach((cartTotal, i) => {
      cartTotal.classList.add("hidden");
    });
    cartEmptyStates.forEach((cartEmptyState, i) => {
      cartEmptyState.classList.remove("hidden");
    });
  } else {
    cartEmptyStates.forEach((cartEmptyState, i) => {
      if (!cartEmptyState.classList.contains("hidden")) {
        cartEmptyState.classList.add("hidden");
      }
    });

    cartDefault.forEach((cartTotal, i) => {
      cartTotal.classList.remove("hidden");
    });
  }

  cartItemsContainers.forEach((cartItemsContainer, i) => {
    cartItemsContainer.classList.add("loading");

    cartItemsContainer.innerHTML = "";

    const itemsArray = cartData.items;

    itemsArray.forEach((item, i) => {
      const cartItem = cardItemTemplate.cloneNode(true);
      cartItem.querySelector(".cart__item-title").innerHTML =
        item.product_title;
      cartItem.dataset.id = item.variant_id;
      cartItem.classList.remove("hidden");
      cartItem
        .querySelector(".cart__item-img")
        .setAttribute("src", item.featured_image.url);
      const options = item.options_with_values;
      if (options.length > 0) {
        options.forEach((option, i) => {
          if (option.name != "Title") {
            const optionHtml = `
                  <span class="p-small">${option.name}</span>
                  <div class="option-badge">${option.value}</div>`;
            cartItem.querySelector(
              ".cart__item-options"
            ).innerHTML += optionHtml;
          }
        });
      }

      cartItem.querySelector(
        ".cart__item-quantity-input-btn.quantity-badge"
      ).value = item.quantity;

      const singlePriceWrap = cartItem.querySelector(
        ".cart__item-single-price"
      );

      if (item.original_price > item.discounted_price) {
        const discountedPriceHtml = `<span class="p-small">Price:</span>
        <span class="p-small price-old">${shopifyPriceToCurrency(
          item.original_price,
          "de-DE",
          cartData.currency
        )}</span>
        <span class="p-small price-new">${shopifyPriceToCurrency(
          item.discounted_price,
          "de-DE",
          cartData.currency
        )}</span>`;
        singlePriceWrap.innerHTML = discountedPriceHtml;
      } else {
        const regularPriceHtml = `<span class="p-small">Price:</span>
        <span class="p-small color-heading">${shopifyPriceToCurrency(
          item.price,
          "de-DE",
          cartData.currency
        )}</span>`;
        singlePriceWrap.innerHTML = regularPriceHtml;
      }

      cartItem.querySelector(
        ".cart__item-line-price"
      ).innerHTML = shopifyPriceToCurrency(
        item.line_price,
        "de-DE",
        cartData.currency
      );

      const itemStock = cartItem.querySelector(".cart__item-stock");
      const inStock = variantIsAvailable(item.handle, item.id);
      if (inStock) {
        itemStock.classList.add("cart__item-in-stock");
        itemStock.innerHTML = "In stock";
      } else {
        itemStock.classList.add("cart__item-out-stock");
        itemStock.innerHTML = "Out of stock";
      }

      cartItemsContainer.appendChild(cartItem);
    });

    const subTotalWrappers = document.querySelectorAll(".cart__subtotal");

    subTotalWrappers.forEach((subTotal, i) => {
      subTotal.innerHTML = shopifyPriceToCurrency(
        cartData.total_price,
        "de-DE",
        cartData.currency
      );
    });

    cartItemsContainer.classList.remove("loading");
  });
}

function clearCart() {
  fetch("/cart/clear.js", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      renderCartItems(data);
    });
}

function shopifyPriceToCurrency(price, localeCode, currency) {
  return new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: currency,
  }).format(price / 100);
}

async function variantIsAvailable(productHandle, variant_id) {
  const product = fetch(`/products/${productHandle}.js`)
    .then((response) => response.json())
    .then((product) => {
      const variant = product.variants.find(
        (variant) => variant.id === variant_id
      );
      if (variant.available) {
        return true;
      } else {
        return false;
      }
    });
}
