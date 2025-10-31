import { store } from "../redux/store";
import api from "./apiMiddleware";
import * as apiEndPoints from "./apiEndPoints";
import toast from "react-hot-toast";

// 1. Settings Api
export const get_settings = async () => {
  try {
    const response = await api.post(apiEndPoints.getSettings);

    if (response.status !== 200) {
      throw new Error("Failed to fetch settings");
    }

    return response?.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

// 2. Get places api for web
export const getPlacesForWebApi = async ({ input }) => {
  try {
    const url = `${apiEndPoints.getPlacesForWeb}?input=${input}`;
    const response = await api.get(url);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response; // Assuming response.data contains FAQs data
  } catch (error) {
    console.error("Error in getPlacesForWeb:", error);
    throw error;
  }
};
// 3. Get Places Details API
export const getPlacesDetailsForWebApi = async ({
  latitude,
  longitude,
  place_id,
}) => {
  try {
    // Build query parameters dynamically
    const params = new URLSearchParams();
    if (latitude) params.append("latitude", latitude);
    if (longitude) params.append("longitude", longitude);
    if (place_id) params.append("place_id", place_id);

    // Construct the URL with valid query parameters
    const url = `${apiEndPoints.getPlacesDeatilsForWeb}?${params.toString()}`;

    const response = await api.get(url); // Using the GET request with the URL

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response; // Assuming response.data contains the location details
  } catch (error) {
    console.error("Error in getPlacesDetailsForWebApi:", error);
    throw error;
  }
};
// 4. landing page api
export const getWebLandingPageApi = async () => {
  const formData = new FormData();
  try {
    const response = await api.post(apiEndPoints.getWebLandingPage, formData);

    return response?.data;
  } catch (error) {
    console.error("Error in resend_OTP:", error);
    throw error;
  }
};

// 5. home screen api
export const getHomeScreenDataApi = async ({
  latitude = "",
  longitude = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    const response = await api.post(apiEndPoints.getHomePage, formData);

    if (response.status !== 200) {
      throw new Error("Failed to fetch data");
    }

    return response?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

// 6. get categories api
export const getCategoriesApi = async ({
  latitude = "",
  longitude = "",
  category_id = "",
  slug = "",
  search = null,
  is_landing_page = 0,
}) => {
  try {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("category_id", category_id);
    formData.append("slug", slug);
    formData.append("is_landing_page", is_landing_page);
    if (search) {
      formData.append("search", search);
    }

    const response = await api.post(apiEndPoints.getCategory, formData);

    if (response.status !== 200) {
      throw new Error("Failed to fetch categories");
    }

    return response?.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

// 7. contact us api
export const contactUsApi = async ({
  name = "",
  subject = "",
  message = "",
  email = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("subject", subject);
    formData.append("message", message);
    formData.append("email", email);

    const response = await api.post(apiEndPoints.contactUsApi, formData);

    return response?.data;
  } catch (error) {
    console.error("Error in send_message:", error);
    throw error;
  }
};

// 8. all providers api
export const getProviders = async ({
  latitude = "",
  longitude = "",
  id = "",
  search = "",
  category_id = 0,
  slug = "",
  subcategory_id = 0,
  order = "asc",
  filter = null,
  limit = "",
  offset = "",
  category_slug = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    if (id > 0) {
      formData.append("partner_id", id);
    }
    if (search) {
      formData.append("search", search);
    }
    if (category_id > 0) {
      formData.append("category_id", category_id);
    }
    if (slug) {
      formData.append("slug", slug);
    }
    if (subcategory_id > 0) {
      formData.append("subcategory_id", subcategory_id);
    }
    if (order) {
      formData.append("order", order);
    }
    if (filter) {
      formData.append("filter", filter);
    }
    if (limit) {
      formData?.append("limit", limit);
    }
    // if (offset) {
    formData?.append("offset", offset);
    // }
    if (category_slug) {
      formData?.append("category_slug", category_slug);
    }

    const response = await api.post(apiEndPoints.getProviders, formData);

    if (response.status !== 200) {
      throw new Error("Failed to fetch providers");
    }

    return response?.data;
  } catch (error) {
    console.error("Error fetching providers:", error);
    return null;
  }
};

// 9. verify user api
export const verifyUserApi = async ({
  phone = "",
  country_code = "",
  uid = "",
}) => {
  try {
    const formData = new FormData();
    if (phone) formData.append("mobile", phone);
    if (country_code) formData.append("country_code", country_code);
    if (uid) formData.append("uid", uid);

    const response = await api.post(apiEndPoints.verifyUser, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains verification result
  } catch (error) {
    console.error("Error in VerifyUser:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 10. manage user api
export const registerUserApi = async ({
  email = "",
  mobile = "",
  web_fcm_id = "",
  loginType = "",
  uid = "",
  countryCodeName = "",
  username = "",
  country_code = "",
}) => {
  try {
    const formData = new FormData();
    if (email) formData.append("email", email);
    if (mobile) formData.append("mobile", mobile);
    if (web_fcm_id) formData.append("web_fcm_id", web_fcm_id);
    if (loginType) formData.append("loginType", loginType);
    if (uid) formData.append("uid", uid);
    if (countryCodeName) formData.append("countryCodeName", countryCodeName);
    if (username) formData.append("username", username);
    if (country_code) formData.append("country_code", country_code);

    const response = await api.post(apiEndPoints.manageUser, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains registration result
  } catch (error) {
    console.error("Error in registerUser:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 11. get services
export const allServices = async ({
  id = "",
  partner_id = "",
  company_name = "",
  latitude = "",
  longitude = "",
  offset = "",
  limit = "",
  search = "",
  slug = "",
  provider_slug = "",
}) => {
  try {
    const formData = new FormData();
    if (id) {
      formData.append("id", id);
    }
    if (latitude) {
      formData.append("latitude", latitude);
    }
    if (longitude) {
      formData.append("longitude", longitude);
    }
    if (partner_id) {
      formData.append("partner_id", partner_id);
    }
    if (company_name) {
      formData.append("company_name", company_name);
    }
    if (offset) {
      formData.append("offset", offset);
    }
    if (limit) {
      formData.append("limit", limit);
    }
    if (search) {
      formData.append("search", search);
    }
    if (slug) {
      formData.append("slug", slug);
    }
    if (provider_slug) {
      formData.append("provider_slug", provider_slug);
    }

    const response = await api.post(apiEndPoints.getServices, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains the services data
  } catch (error) {
    console.error("Error in allServices:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 12. search_services_providers
export const search_services_providers = async ({
  search = "",
  latitude = "",
  longitude = "",
  type = "",
  limit = 10,
  offset = 0,
}) => {
  try {
    const formData = new FormData();
    formData.append("search", search);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("type", type);
    formData.append("limit", limit);
    formData.append("offset", offset);

    const response = await api.post(
      apiEndPoints.searchServicesProviders,
      formData
    );

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming the response is JSON
  } catch (error) {
    console.error("Error in search_services_providers:", error);
    throw error;
  }
};

// 13. update user
export const update_user = async ({
  mobile = "",
  username = "",
  email = "",
  country_code = "",
  image = null,
}) => {
  try {
    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("username", username);
    formData.append("country_code", country_code);
    formData.append("email", email);

    if (image !== null) {
      formData.append("image", image);
    }

    const response = await api.post(apiEndPoints.updateUser, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains user update result
  } catch (error) {
    console.error("Error in update_user:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 14. get subcateory api
export const getSubCategory = async ({
  latitude = "",
  longitude = "",
  category_id = "",
  slug = "",
  title = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("category_id", category_id);
    formData.append("slug", slug);
    if (title) formData.append("title", title);

    const response = await api.post(apiEndPoints.getSubCategories, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains subcategories
  } catch (error) {
    console.error("Error in getSubCategory:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 15. get reviews api
export const getRatings = async ({
  partner_id = "",
  service_id = "",
  limit = "",
  offset = "",
  order = "desc",
  provider_slug = "",
  slug = "",
}) => {
  try {
    const formData = new FormData();
    if (partner_id) {
      formData.append("partner_id", partner_id);
    }
    if (service_id) {
      formData.append("service_id", service_id);
    }
    if (limit) {
      formData.append("limit", limit);
    }
    if (offset) {
      formData.append("offset", offset);
    }
    if (order) {
      formData.append("order", order);
    }
    if (provider_slug) {
      formData.append("provider_slug", provider_slug);
    }
    if (slug) {
      formData.append("slug", slug);
    }

    const response = await api.post(apiEndPoints.getRating, formData);

    return response?.data; // Assuming response.data contains the ratings data
  } catch (error) {
    console.error("Error in getRating:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 16. get promo codes api
export const getPromoCodeApi = async ({
  partner_id = 0,
  provider_slug = "",
}) => {
  try {
    const formData = new FormData();
    if (partner_id) {
      formData.append("partner_id", partner_id);
    }
    if (provider_slug) {
      formData.append("provider_slug", provider_slug);
    }

    const response = await api.post(apiEndPoints.getPromoCodes, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }
    return response?.data; // Assuming response.data contains the promo codes data
  } catch (error) {
    console.error("Error in Promocode:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 17. set bookmark
export const bookmark = async ({
  type = "",
  lat = "",
  lng = "",
  partner_id = "",
  limit = "",
  offset = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("type", type);
    formData.append("latitude", lat);
    formData.append("longitude", lng);
    formData.append("order", "desc");
    formData.append("limit", limit);
    formData.append("offset", offset);
    if (partner_id) {
      formData.append("partner_id", partner_id);
    }

    const response = await api.post(apiEndPoints.getBookmark, formData);

    if (response.status !== 200) {
      throw new Error("Failed to fetch bookmarks");
    }

    return response?.data;
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return null;
  }
};

// 18. user notifications

export const userNotifications = async ({ limit = "", offset = "" }) => {
  try {
    const formData = new FormData();
    formData.append("limit", limit);
    formData.append("offset", offset);

    const response = await api.post(apiEndPoints.getNotifications, formData);

    return response?.data; // Assuming response.data contains notifications data
  } catch (error) {
    console.error("Error in userNotifications:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 19. get cart api
export const getCartApi = async ({ order_id } = {}) => {
  try {
    const formData = new FormData();

    if (order_id) formData.append("order_id", order_id);

    const response = await api.post(apiEndPoints.getCart, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

// 20. manage cart api
export const ManageCartApi = async ({ id = 0, qty = 0 }) => {
  try {
    const formData = new FormData();
    formData.append("service_id", id);
    formData.append("qty", qty);

    const response = await api.post(apiEndPoints.manageCart, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data;
  } catch (error) {
    console.error("Error in ManageCart:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 21. remove from cart
export const removeCartApi = async ({ itemId = "", provider_id = "" }) => {
  try {
    const formData = new FormData();
    formData.append("service_id", itemId);
    formData.append("provider_id", provider_id);

    const response = await api.post(apiEndPoints.removeFromCart, formData);

    return response?.data; // Assuming response.data contains the result of the remove operation
  } catch (error) {
    console.error("Error in removeCart:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 22. validate promocode api
export const validatePromocodeApi = async ({
  provider_id = "",
  promo_code_id = "",
  overall_amount = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("partner_id", provider_id);
    formData.append("promo_code_id", promo_code_id);
    formData.append("final_total", overall_amount);

    const response = await api.post(apiEndPoints.validatePromoCode, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains validation result
  } catch (error) {
    console.error("Error in validatePromocodeApi:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 23. place order api
export const placeOrderApi = async ({
  method = "",
  date = "",
  time = "",
  addressId = 0,
  order_note = "",
  promo_code_id = "",
  at_store = "",
  order_id = "",
  custom_job_request_id = "",
  bidder_id = "",
}) => {
  try {
    const state = store.getState(); // Assuming you have a store object available
    const cartData = state.cart;

    const formData = new FormData();
    if (method) {
      formData.append("payment_method", method);
    }
    // If delivery mode is home, include address_id; otherwise, leave it empty
    if (addressId) {
      formData.append("address_id", addressId);
    }
    formData.append("status", "awaiting");
    if (order_note) {
      formData.append("order_note", order_note);
    }
    if (date) {
      formData.append("date_of_service", date);
    }
    if (time) {
      formData.append("starting_time", time);
    }
    if (promo_code_id) {
      formData.append("promo_code_id", promo_code_id);
    }
    if (at_store) {
      formData.append("at_store", at_store);
    }
    if (order_id) {
      formData.append("order_id", order_id);
    }
    if (custom_job_request_id) {
      formData.append("custom_job_request_id", custom_job_request_id);
    }
    if (bidder_id) {
      formData.append("bidder_id", bidder_id);
    }

    const response = await api.post(apiEndPoints.placeOrder, formData);

    return response?.data;
  } catch (error) {
    console.error("Error in placeOrder:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 24. get address api
export const getAddressApi = async () => {
  try {
    const response = await api.post(apiEndPoints.getAddress);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains address data
  } catch (error) {
    console.error("Error in getAddress:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 25. add address api
export const AddAddressApi = async ({
  id = "",
  mobile = "",
  address = "",
  city_id = "",
  city_name = "",
  lattitude = "",
  longitude = "",
  area = "",
  type = "",
  country_code = "",
  pincode = "",
  state = "",
  country = "",
  is_default = "",
  landmark = "",
}) => {
  try {
    const formData = new FormData();
    if (id !== null) {
      formData.append("address_id", id);
    }
    if (mobile) {
      formData.append("mobile", mobile);
    }
    if (address) {
      formData.append("address", address);
    }
    if (city_id) {
      formData.append("city_id", city_id);
    }
    if (city_name) {
      formData.append("city_name", city_name);
    }
    if (lattitude) {
      formData.append("lattitude", lattitude);
    } // Corrected spelling to latitude
    if (longitude) {
      formData.append("longitude", longitude);
    }
    if (area) {
      formData.append("area", area);
    }
    if (type) {
      formData.append("type", type);
    }
    if (country_code) {
      formData.append("country_code", country_code);
    }
    if (pincode) {
      formData.append("pincode", pincode);
    }
    if (state) {
      formData.append("state", state);
    }
    if (country) {
      formData.append("country", country);
    }
    if (is_default) {
      formData.append("is_default", is_default);
    }
    if (landmark) {
      formData.append("landmark", landmark);
    }
    if (mobile) {
      formData.append("alternate_mobile", mobile);
    } // Assuming alternate_mobile is same as mobile

    const response = await api.post(apiEndPoints.addAddress, formData);

    return response?.data;
  } catch (error) {
    console.error("Error in AddAddress:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 26. get available time slots api
export const getAvailableSlotApi = async ({
  partner_id = 0,
  selectedDate = "",
  custom_job_request_id,
}) => {
  try {
    const formData = new FormData();
    if (partner_id) {
      formData.append("partner_id", partner_id);
    }
    formData.append("date", selectedDate); // Convert date to ISO string format
    if (custom_job_request_id) {
      formData.append("custom_job_request_id", custom_job_request_id);
    } // Convert date to ISO string format

    const response = await api.post(apiEndPoints.getAvailableSlot, formData);

    return response?.data;
  } catch (error) {
    console.error("Error in get_available_slot:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 27. check available slots api
export const checkSlotsApi = async ({
  partner_id = "",
  date = "",
  time = "",
  order_id = "",
  custom_job_request_id = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("partner_id", partner_id);
    formData.append("date", date);
    formData.append("time", time);
    if (order_id) formData.append("order_id", order_id);
    if (custom_job_request_id)
      formData.append("custom_job_request_id", custom_job_request_id);
    const response = await api.post(apiEndPoints.checkAvailableSlot, formData);

    return response?.data;
  } catch (error) {
    console.error("Error in checkSlots:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 28. check provider availability api
export const providerAvailableApi = async ({
  latitude = "",
  longitude = "",
  isCheckout = 0,
  custom_job_request_id = "",
  bidder_id = "",
  order_id = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("is_checkout_process", isCheckout);
    if (custom_job_request_id) {
      formData.append("custom_job_request_id", custom_job_request_id);
    }
    if (bidder_id) {
      formData.append("bidder_id", bidder_id);
    }
    if (order_id) {
      formData.append("order_id", order_id);
    }

    const response = await api.post(
      apiEndPoints.providerCheckAvailability,
      formData
    );

    return response?.data;
  } catch (error) {
    console.error("Error in providerAvailable:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 29. get orders api
export const getOrdersApi = async ({
  id = "",
  slug = "",
  limit = "",
  offset = "",
  status = "",
  order_statuses = "",
  custom_request_orders = "",
}) => {
  try {
    const formData = new FormData();

    if (status) {
      formData.append("status", status);
    }
    if (id) {
      formData.append("id", id);
    }
    if (slug) {
      formData.append("slug", slug);
    }
    if (offset) {
      formData.append("offset", offset);
    }
    if (limit) {
      formData.append("limit", limit);
    }
    if (custom_request_orders) {
      formData.append("custom_request_orders", custom_request_orders);
    }

    const response = await api.post(apiEndPoints.getOrders, formData);

    return response?.data; // Assuming response.data contains order data
  } catch (error) {
    console.error("Error in getOrders:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 30. change booking order status api
export const changeOrderStatusApi = async ({
  order_id = "",
  status = "",
  date = "",
  time = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("order_id", order_id);
    formData.append("status", status);
    formData.append("date", date);
    formData.append("time", time);

    const response = await api.post(apiEndPoints.updateOrderStatus, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data;
  } catch (error) {
    console.error("Error in change_order_status:", error);
    throw error;
  }
};

// 31. fetch custom job request api
export const fetchMyCustomJobRequestsApi = async ({ offset, limit }) => {
  const formData = new FormData();
  if (offset) {
    formData.append("offset", offset);
  }
  if (limit) {
    formData.append("limit", limit);
  }
  try {
    const response = await api.post(
      apiEndPoints.fetchMyCustomJobRequests,
      formData
    );

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data;
  } catch (error) {
    console.error("Error in fetchMyCustomJobRequests:", error);
    throw error;
  }
};

// 32. fetch custom job req bidder page api
export const fetchMyCustomJobBiddersApi = async ({
  custom_job_request_id,
  limit,
  offset,
}) => {
  const formData = new FormData();
  if (custom_job_request_id) {
    formData.append("custom_job_request_id", custom_job_request_id);
  }
  if (limit) {
    formData.append("limit", limit);
  }
  formData.append("offset", offset);

  try {
    const response = await api.post(
      apiEndPoints.fetchMyCustomJobBidders,
      formData
    );

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains FAQs data
  } catch (error) {
    console.error("Error in fetchMyCustomJobBidders:", error);
    throw error;
  }
};

// 33. cancle custom job api

export const cancelCustomJobReqApi = async ({ custom_job_request_id }) => {
  const formData = new FormData();
  if (custom_job_request_id) {
    formData.append("custom_job_request_id", custom_job_request_id);
  }

  try {
    const response = await api.post(apiEndPoints.cancleCustomJobReq, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains FAQs data
  } catch (error) {
    console.error("Error in cancleCustomJobReq:", error);
    throw error;
  }
};

// 34. download invoice

export const download_invoices = async ({ order_id = "" }) => {
  try {
    const formData = new FormData();
    formData.append("order_id", order_id);

    const response = await api.post(apiEndPoints.downloadInvoices, formData, {
      responseType: "blob", // Important for downloading files
    });

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // The blob data
  } catch (error) {
    console.error("Error in download_invoices:", error);
    throw error;
  }
};

// 35. become provider page api
export const getBecomeProviderSetttingsApi = async ({
  latitude = "",
  longitude,
}) => {
  try {
    const formData = new FormData();
    formData.append("latitude", longitude);

    const response = await api.post(
      apiEndPoints.getBecomeProviderSetings,
      formData
    );

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response?.data; // Assuming response.data contains FAQs data
  } catch (error) {
    console.error("Error in getBecomeProviderSetings:", error);
    throw error;
  }
};

// 36. fetch provider chat list
export const fetch_providr_chat_list = async ({ limit = "", offset = "", filter_type = "" }) => {
  try {
    const formData = new FormData();
    formData.append("limit", limit);
    formData.append("offset", offset);
    if (filter_type) {
      formData.append("filter_type", filter_type);
    }

    const response = await api.post(apiEndPoints.getChatProviderList, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains deletion status
  } catch (error) {
    console.error("Error in fetching chat list:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 37. fetch chat history
export const fetch_chat_history = async ({
  type = "",
  booking_id = "",
  provider_id = "",
  limit = "",
  offset = "",
}) => {
  const formData = new FormData();
  if (type) {
    formData.append("type", type);
  }
  if (booking_id) {
    formData.append("booking_id", booking_id);
  }
  if (provider_id) {
    formData.append("provider_id", provider_id);
  }
  if (limit) {
    formData.append("limit", limit);
  }
  if (offset) {
    formData.append("offset", offset);
  }

  try {
    const response = await api.post(apiEndPoints.getChatHistory, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains deletion status
  } catch (error) {
    console.error("Error in fetching chat list:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 38. send msg api
export const send_chat_message = async ({
  receiver_id = "",
  booking_id = "",
  message = "",
  attachment = [],
  receiver_type = "",
}) => {
  const formData = new FormData();
  if (receiver_id) {
    formData.append("receiver_id", receiver_id);
  }
  if (booking_id) {
    formData.append("booking_id", booking_id);
  }
  if (message) {
    formData.append("message", message);
  }
  if (attachment && attachment.length > 0) {
    attachment.forEach((attachment, index) => {
      formData.append(`attachment[${index}]`, attachment);
    });
  }
  if (receiver_type) {
    formData.append("receiver_type", receiver_type);
  }

  try {
    const response = await api.post(apiEndPoints.sendChatMessage, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains deletion status
  } catch (error) {
    console.error("Error in sending chat message:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 36. add transactions api

export const addTransactionsApi = async ({
  order_id = "",
  status = "",
  is_additional_charge = "",
  payment_method = "",
  transaction_id = "",
  is_reorder = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("order_id", order_id);
    formData.append("status", status);
    if (is_additional_charge) {
      formData.append("is_additional_charge", is_additional_charge);
    }
    if (payment_method) {
      formData.append("payment_method", payment_method);
    }
    if (transaction_id) {
      formData.append("transaction_id", transaction_id);
    }
    if (is_reorder) {
      formData.append("is_reorder", is_reorder);
    }

    const response = await api.post(apiEndPoints.addTransaction, formData);

    return response.data;
  } catch (error) {
    console.error("Error in add_transactions:", error);
    throw error;
  }
};

// 37. razorpay intent api
// create razorpay order
export const createRazorOrderApi = async ({
  orderId = "",
  is_additional_charge = "",
}) => {
  try {
    const formData = new FormData();
    formData.append("order_id", orderId);
    if (is_additional_charge) {
      formData.append("is_additional_charge", is_additional_charge);
    }

    const response = await api.post(apiEndPoints.createRazorOrder, formData);

    return response.data;
  } catch (error) {
    console.error("Error in createRazorOrder:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 38. delete address api
export const DeleteAddressApi = async ({ address_id = 0 }) => {
  try {
    const formData = new FormData();
    formData.append("address_id", address_id);

    const response = await api.post(apiEndPoints.deleteAddress, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains deletion result
  } catch (error) {
    console.error("Error in DeleteAddress:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

//39. get transaction api
export const getTransactionApi = async ({ limit = "10", offset = 0 }) => {
  try {
    const formData = new FormData();
    formData.append("limit", limit);
    formData.append("offset", offset);

    const response = await api.post(apiEndPoints.getTransaction, formData);

    return response.data; // Assuming response.data contains transactions data
  } catch (error) {
    console.error("Error in getTransaction:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};

// 40. add custom service api
export const makeCustomJobRequestApi = async ({
  category_id,
  service_title,
  service_short_description,
  min_price,
  max_price,
  requested_start_date,
  requested_start_time,
  requested_end_date,
  requested_end_time,
  latitude,
  longitude,
}) => {
  const formData = new FormData();
  if (category_id) {
    formData.append("category_id", category_id);
  }
  if (service_title) {
    formData.append("service_title", service_title);
  }
  if (service_short_description) {
    formData.append("service_short_description", service_short_description);
  }
  if (min_price) {
    formData.append("min_price", min_price);
  }
  if (max_price) {
    formData.append("max_price", max_price);
  }
  if (requested_start_date) {
    formData.append("requested_start_date", requested_start_date);
  }
  if (requested_start_time) {
    formData.append("requested_start_time", requested_start_time);
  }
  if (requested_end_date) {
    formData.append("requested_end_date", requested_end_date);
  }
  if (requested_end_time) {
    formData.append("requested_end_time", requested_end_time);
  }
  if (latitude) {
    formData.append("latitude", latitude);
  }
  if (longitude) {
    formData.append("longitude", longitude);
  }
  try {
    const response = await api.post(
      apiEndPoints.makeCustomJobRequest,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error in make Custom Job Request:", error);
    throw error;
  }
};

// 41. rate service api
export const applyRateServiceApi = async ({
  id = "",
  rating = "",
  comment = "",
  images = "",
  custom_job_request_id = "",
}) => {
  try {
    const formData = new FormData();
    if (id) {
      formData.append("service_id", id);
    }
    formData.append("rating", rating);
    formData.append("comment", comment);
    if (custom_job_request_id) {
      formData.append("custom_job_request_id", custom_job_request_id);
    }

    if (Array.isArray(images)) {
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    const response = await api.post(apiEndPoints.addRating, formData);

    return response.data;
  } catch (error) {
    console.error("Error in apply_rating:", error);
    throw error;
  }
};

// 42. verify otp api
export const verifyOTPApi = async ({
  phone = "",
  otp = "",
  country_code = "",
}) => {
  const formData = new FormData();
  if (phone) {
    formData.append("phone", phone);
  }
  if (otp) {
    formData.append("otp", otp);
  }
  if (country_code) {
    formData.append("country_code", country_code);
  }

  try {
    const response = await api.post(apiEndPoints.verifyOTP, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains user data
  } catch (error) {
    console.error("Error in verify_OTP:", error);
    throw error;
  }
};

// 43. resend otp api
export const resendOTPApi = async ({ mobile = "" }) => {
  const formData = new FormData();
  if (mobile) {
    formData.append("mobile", mobile);
  }
  try {
    const response = await api.post(apiEndPoints.resendOTP, formData);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains user data
  } catch (error) {
    console.error("Error in resend_OTP:", error);
    throw error;
  }
};

// 44. delete account api
export const deleteUserAccountApi = async () => {
  try {
    const response = await api.post(apiEndPoints.deleteUserAccount);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains deletion status
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};
// 45. get all categories api
export const getAllCategoriesApi = async () => {
  try {
    const response = await api.post(apiEndPoints.allCategories);

    if (response.status === 401) {
      toast.error("Something Went Wrong");
      return false;
    }

    return response.data; // Assuming response.data contains deletion status
  } catch (error) {
    console.error("Error in deleteUserAccount:", error);
    throw error; // Re-throw the error to handle it further up the call stack if needed
  }
};


// 46. get faqs api
export const getFaqsApi = async ({ limit = "", offset = "" }) => {
  try {
    const formData = new FormData();
    formData.append("limit", limit);
    formData.append("offset", offset);
    const response = await api.post(apiEndPoints.getFaqs, formData);

    return response.data;
  } catch (error) {
    console.error("Error in getFaqs:", error);
    throw error;
  }
};


// 47. logout api
export const logoutApi = async ({ fcm_id = "" }) => {
  const formData = new FormData();
  formData.append("fcm_id", fcm_id);
  try {

    const response = await api.post(apiEndPoints.logout, formData);

    return response.data;

  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
};

// 48. get report reasons api
export const getReportReasonsApi = async () => {
  try {
    const response = await api.get(apiEndPoints.getReportReasons);
    return response?.data;
  } catch (error) {
    console.error("Error in getReportReasons:", error);
    throw error;
  }
};

// 49. submit report api
export const blockUserApi = async ({
  partner_id = "",
  reason_id = "",
  additional_info = "",
}) => {
  const formData = new FormData();
  formData.append("partner_id", partner_id);
  formData.append("reason_id", reason_id);
  formData.append("additional_info", additional_info);
  try {
    const response = await api.post(apiEndPoints.blockUser, formData);
    return response?.data;
  } catch (error) {
    console.error("Error in blockUser:", error);
    throw error;
  }

};

// 50. unblock user api
export const unblockUserApi = async ({
  partner_id = "",
}) => {
  const formData = new FormData();
  formData.append("partner_id", partner_id);
  try {
    const response = await api.post(apiEndPoints.unblockUser, formData);
    return response?.data;
  } catch (error) {
    console.error("Error in unblockUser:", error);
    throw error;
  }
};

// 51. delete chat user api
export const deleteChatUserApi = async ({
  partner_id = "",
  booking_id = "",
}) => {
  const formData = new FormData();
  formData.append("partner_id", partner_id);
  if (booking_id) {
    formData.append("booking_id", booking_id);
  }
  try {
    const response = await api.post(apiEndPoints.deleteChatUser, formData);
    return response?.data;
  } catch (error) {
    console.error("Error in deleteChatUser:", error);
    throw error;
  }
};

// 52. get parent category slug api
export const getParentCategorySlugApi = async ({ slug = "" }) => {
  const formData = new FormData();
  formData.append("slug", slug);
  try {
    const response = await api.post(apiEndPoints.getParentCategorySlug, formData);
    return response?.data;
  } catch (error) {
    console.error("Error in getParentCategorySlug:", error);
    throw error;
  }
};

// 53. get blocked providers api
export const getBlockedProvidersApi = async () => {
  try {
    const response = await api.get(apiEndPoints.getBlockedProviders);
    return response?.data;
  } catch (error) {
    console.error("Error in getBlockedProviders:", error);
    throw error;
  }
};