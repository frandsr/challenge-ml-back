const { Router } = require("express");
const axios = require("axios");

const router = Router();

const BASE_API_MELI_URL = "https://api.mercadolibre.com";
const ITEMS_SEARCH_MELI_URL = "/sites/MLA/search";
const CATEGORIES_URL = "/categories/";
const ITEM_URL = "/items/";
const ITEM_DESCRIPTION_URL = "/description";
const responseAuthor = {
  name: "Francisco",
  lastName: "de Sautu Riestra"
};

//////////// Endpoints ////////////////

router.get("/", async (req, res) => {
  const query = req.query.q || req.body.q;
  let data;
  try {
    const res = await axios(BASE_API_MELI_URL + ITEMS_SEARCH_MELI_URL, {
      params: {
        q: query
      }
    });
    data = res.data;
  } catch (error) {
    console.error(
      "Failed to retrieve items information on MELI api with error: ",
      error
    );
  }

  try {
    const formatedJsonResponse = await formatItemsJsonResponse(data);
    res.status(200).json(formatedJsonResponse);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

router.get("/:id", async (req, res) => {
  let itemId = req.params.id;
  let itemData;
  let itemDescriptionData;
  try {
    itemData = await axios.get(BASE_API_MELI_URL + ITEM_URL + itemId);
    itemDescriptionData = await axios.get(
      BASE_API_MELI_URL + ITEM_URL + itemId + ITEM_DESCRIPTION_URL
    );
  } catch (error) {
    console.error(
      "Failed to retrieve item information on MELI api with error: ",
      error
    );
    res.status(error.response.status).json(error.response.data);
  }
  try {
    const formatedJsonResponse = await formatItemJsonResponse(
      itemData,
      itemDescriptionData
    );
    res.status(200).json(formatedJsonResponse);
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
});

//////////// Helpers ////////////////

const getCategoriesArray = async (slicedResults) => {
  let slicedResultsCategoriesId = slicedResults.map((res) => res.category_id);
  let categories = [];
  let categoryPath = [];
  for (const cat of slicedResultsCategoriesId) {
    try {
      const res = await axios(BASE_API_MELI_URL + CATEGORIES_URL + cat);
      categoryInfo = res.data;
      categories.push(categoryInfo.name);
      if (categoryPath.length === 0)
        categoryPath = categoryInfo.path_from_root.map((cat) => cat.name);
    } catch (error) {
      throw error;
    }
  }
  return {categories, categoryPath};
};

const getDecimalsFromPrice = (price, decimalsQuantity) => {
  return Number(
    (Math.abs(price) - Math.floor(price))
      .toFixed(decimalsQuantity)
      .substring(decimalsQuantity)
  );
};

const formatItemsJsonResponse = async (itemsData) => {
  const slicedResults = itemsData.results.slice(0, 4);
  let responseCategories;

  try {
    responseCategories = await getCategoriesArray(slicedResults);
  } catch (error) {
    console.error(
      "Failed to retrieve categoies information on MELI app with error: ",
      error
    );
    throw error;
  }

  const responseItems = slicedResults.map((item) => ({
    id: item.id,
    title: item.title,
    price: {
      currency: item.currency_id,
      amount: item.price,
      decimals: getDecimalsFromPrice(item.price, 2)
    },
    picture: item.thumbnail,
    condition: item.condition,
    free_shipping: item.shipping.free_shipping,
    location: item.address.state_name
  }));

  const formatedJsonResponse = {
    author: responseAuthor,
    categories: responseCategories.categories,
    category_path: responseCategories.categoryPath,
    items: responseItems
  };
  return formatedJsonResponse;
};

const formatItemJsonResponse = async (itemData, itemDescriptionData) => {
  const item = itemData.data;
  const itemDescription = itemDescriptionData.data;
  const itemCategory = item.category_id;
  let categoryPath;
  try {
    const res = await axios(BASE_API_MELI_URL + CATEGORIES_URL + itemCategory);
    categoryPath = res.data.path_from_root;
  } catch (error) {
    console.error(
      "Failed to retrieve category information on MELI app with error: ",
      error
    );
    throw error;
  }

  const formatedJsonResponse = {
    author: responseAuthor,
    item: {
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: item.price,
        decimals: getDecimalsFromPrice(item.price, 2)
      },
      picture: item.pictures[0].url,
      condition: item.condition,
      free_shipping: item.shipping.free_shipping,
      sold_quantity: item.sold_quantity,
      description: itemDescription.plain_text
    },
    category_path: categoryPath.map((cat) => cat.name)
  };
  return formatedJsonResponse;
};

module.exports = router;
