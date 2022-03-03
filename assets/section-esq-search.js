const searchQuery = document.getElementById("search-section").dataset.query;
const sortBy = document.getElementById("search-section").dataset.sort;
let url = new URL(window.location.href);
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const collectionsParam = urlParams.get("collections");

const filterCheckboxes = document.querySelectorAll(".filter-checkbox");
const resultWrappers = document.querySelectorAll(".result__wrapper");
const resultsCountSpan = document.getElementById("results_count");

(function () {
  if (collectionsParam) {
    const filterCollections = collectionsParam.split(",");
    console.log(filterCollections);
    filterCollections.forEach((collection, i) => {
      filterCheckboxes.forEach((checkbox, i) => {
        if (checkbox.value === collection) {
          checkbox.checked = true;
        }
      });
    });

    filterResults(filterCollections);
  }
})();

filterCheckboxes.forEach((checkbox, i) => {
  checkbox.onchange = () => {
    const activeFilterValues = [];

    filterCheckboxes.forEach((checkbox, i) => {
      if (checkbox.checked) {
        activeFilterValues.push(checkbox.value);
        console.log(activeFilterValues);
      }
    });

    url.searchParams.set("collections", activeFilterValues.join());
    console.log(url);
    window.location.href = url;
  };
});

function filterResults(activeFilterValues) {
  if (activeFilterValues.length === 0) {
    resultWrappers.forEach((result, i) => {
      result.classList.remove("hidden");
    });
    resultsCountSpan.innerHTML = resultWrappers.length;
  } else {
    resultWrappers.forEach((result, i) => {
      result.classList.add("hidden");
    });

    let resultsCount = 0;

    resultWrappers.forEach((result, i) => {
      const collections = result.querySelectorAll(".result__collection");
      collections.forEach((collection, i) => {
        if (activeFilterValues.indexOf(collection.innerHTML) > -1) {
          result.classList.remove("hidden");
          resultsCount++;
        }
      });
    });

    resultsCountSpan.innerHTML = resultsCount;
  }
}
