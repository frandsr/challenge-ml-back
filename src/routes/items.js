const { Router } = require("express");
const axios = require("axios");

const router = Router();

const BASE_API_MELI_URL = "https://api.mercadolibre.com";
const ITEMS_SEARCH_MELI_URL = "/sites/MLA/search";
const CATEGORIES_URL = "/categories/";

//Helpers
const getCategoriesArray = async (slicedResults) => {
  let slicedResultsCategoriesId = slicedResults.map((res) => res.category_id);
  let categories = [];
  for (const cat of slicedResultsCategoriesId) {
    try {
      const res = await axios(BASE_API_MELI_URL + CATEGORIES_URL + cat);
      categoryInfo = res.data;
      categories.push(categoryInfo.name);
    } catch (error) {
      throw error;
    }
  }
  return categories;
};

const formatItemsJsonResponse = async (axiosData) => {
  const slicedResults = axiosData.results.slice(0, 4);
  const author = {
    name: "Francisco",
    lastName: "de Sautu Riestra"
  };
  let categories;

  try {
    categories = await getCategoriesArray(slicedResults);
  } catch (error) {
    console.error(
      "Failed to retrieve categoies information on MELI app with error: ",
      error
    );
    throw error;
  }

  const formatedJsonResponse = {
    author,
    categories,
    items: slicedResults.map((item) => ({
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: item.price,
        decimals: (item.price % 1).toFixed(2).substring(2)
      },
      picture: item.thumbnail,
      condition: item.condition,
      free_shipping: item.shipping.free_shipping,
      location: item.address.state_name
    }))
  };
  return formatedJsonResponse;
};

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
      "Failed to retrieve items information on MELI app with error: ",
      error
    );
    res.status(error.response.status).json(error.response.data);
  }

  const formatedJsonResponse = await formatItemsJsonResponse(data);
  res.status(200).json(formatedJsonResponse);
});

module.exports = router;
