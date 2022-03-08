let url = new URL(window.location.href);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const collectionsParam = urlParams.get("collections");
const optionsParam = urlParams.get("options");
const sortParam = urlParams.get("sort_by");
const priceParam = urlParams.get("price");

const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
const resultWrappers = document.querySelectorAll(".result__wrapper");
const resultsCountSpan = document.getElementById("results_count");
const productGrid = document.querySelector(".product-grid");

(function () {
  if (collectionsParam) {
    const collections = collectionsParam.split(",");

    collections.forEach((collection, i) => {
      filterCheckboxes.forEach((checkbox, i) => {
        if (checkbox.value === collection) {
          checkbox.checked = true;
        }
      });
    });
  }
  if (sortParam) {
    const sortByInputs = document.querySelectorAll(".sort-by-input");

    sortByInputs.forEach((input, i) => {
      input.classList.remove("active");
      if (input.dataset.value === sortParam) {
        input.classList.add("active");
      }
    });
  }
  if (optionsParam) {
    const options = optionsParam.split(",");

    options.forEach((option, i) => {
      filterCheckboxes.forEach((checkbox, i) => {
        if (checkbox.classList.contains("optionCheckbox")) {
          if (checkbox.value === option) {
            checkbox.checked = true;
          }
        }
      });
    });
  }
  if (priceParam) {
    const prices = priceParam.split(",");
    prices.forEach((price, i) => {
      filterCheckboxes.forEach((checkbox, i) => {
        if (checkbox.classList.contains("priceCheckbox")) {
          if (checkbox.value === price) {
            checkbox.checked = true;
          }
        }
      });
    });
  }
  let options, collections, price;
  try {
    options = optionsParam.split(",");
  } catch (e) {
    options = [""];
  }

  try {
    collections = collectionsParam.split(",");
  } catch (e) {
    collections = [""];
  }

  try {
    prices = priceParam.split(",");
  } catch (e) {
    prices = [""];
  }

  filterResults(options, collections, prices);
})();

filterCheckboxes.forEach((checkbox, i) => {
  checkbox.onchange = () => {
    const activeFilterValues = [];
    const activeOptionValues = [];
    const activePriceValues = [];

    filterCheckboxes.forEach((checkbox, i) => {
      if (checkbox.checked) {
        if (checkbox.classList.contains("optionCheckbox")) {
          activeOptionValues.push(checkbox.value);
        } else if (checkbox.classList.contains("priceCheckbox")) {
          activePriceValues.push(checkbox.value);
        } else {
          activeFilterValues.push(checkbox.value);
        }
      }
    });

    url.searchParams.set("price", activePriceValues.join());
    url.searchParams.set("collections", activeFilterValues.join());
    url.searchParams.set("options", activeOptionValues.join());
    console.log(url);
    window.location.href = url;
  };
});

function filterResults(
  activeOptionValues,
  activeCollectionValues,
  activePriceRanges
) {
  if (
    activeOptionValues[0] === "" &&
    activeCollectionValues[0] === "" &&
    activePriceRanges[0] === ""
  ) {
    resultsCountSpan.innerHTML = resultWrappers.length;
    productGrid.classList.remove("loading");
  } else {
    resultWrappers.forEach((result, i) => {
      result.classList.add("hidden");
    });

    let resultsCount = 0;

    resultWrappers.forEach((result, i) => {
      const collections = result.querySelectorAll(".result__collection");
      const options = result.querySelectorAll(".result__option");
      const price = result.dataset.price;

      let collectionMatch = false;

      collections.forEach((collection, i) => {
        if (activeCollectionValues.indexOf(collection.innerHTML) > -1) {
          collectionMatch = true;
        }
      });

      let optionMatch = false;

      options.forEach((option, i) => {
        if (activeOptionValues.indexOf(option.innerHTML) > -1) {
          optionMatch = true;
        }
      });

      if (activeOptionValues[0] === "") {
        if (collectionMatch) {
          result.classList.remove("hidden");
        }
      } else if (activeCollectionValues[0] === "") {
        if (optionMatch) {
          result.classList.remove("hidden");
        }
      } else {
        if (optionMatch && collectionMatch && priceMatch) {
          result.classList.remove("hidden");
        }
      }

      if (!result.classList.contains("hidden")) {
        resultsCount++;
      }
    });
    resultsCountSpan.innerHTML = resultsCount;
    productGrid.classList.remove("loading");
    filterOnPrice(activePriceRanges);
  }
}

function filterOnPrice(activePriceRanges) {
  resultWrappers.forEach((result, i) => {
    const price = result.dataset.price;

    let priceMatch = false;
    if (activePriceRanges[0] === "") {
      priceMatch = "all";
    }
    activePriceRanges.forEach((priceRange, i) => {
      const priceArray = priceRange.split("-");
      const minPrice = parseInt(priceArray[0]);
      const maxPrice = parseInt(priceArray[1]);

      if (minPrice <= price && price <= maxPrice) {
        priceMatch = true;
      }
    });

    if (!priceMatch) {
      result.classList.add("hidden");
    }
  });
}

function sortResults(targetElement) {
  const sortBy = targetElement.dataset.value;
  url.searchParams.set("sort_by", sortBy);
  window.location.href = url;
}
