// src/api/adsApi.js
import axios from "axios";
import { BASE_URL_API } from "../../baseUrl";


// -------- Dashboard Ads --------
export const getDashboardAds = async () => {
  const res = await axios.get(`${BASE_URL_API}/dashboard-ads`);
  const adsArray = res.data.data || []; // <--- Use the correct property
  return adsArray.map(ad => ({
    _id: ad.id || ad._id,
    title: ad.title || "Ad",
    data: ad.url || ad.data,
    type: ad.type || "image",
    filename: ad.url?.split("/").pop() || ad.filename,
    category: ad.category || "dashboard",
  }));
};


export const createDashboardAd = async (payload) => {
  const { data } = await axios.post(`${BASE_URL_API}/dashboard-ads/upload-file-json`, payload);
  return data.data;
};

export const updateDashboardAd = async (_id, payload) => {
  await axios.put(`${BASE_URL_API}/dashboard-ads/${_id}`, payload);
};

export const deleteDashboardAd = async (_id) => {
  await axios.delete(`${BASE_URL_API}/dashboard-ads/${_id}`);
};

// -------- Service Ads --------
export const getServiceAds = async () => {
  const res = await axios.get(`${BASE_URL_API}/service-ads`);
  const adsArray = res.data.data || []; // Make sure it’s always an array
  return adsArray.map(ad => ({
    _id: ad.id || ad._id,
    title: ad.title || "Ad",
    data: ad.url || ad.data,
    type: ad.type || "image",
    filename: ad.url?.split("/").pop() || ad.filename,
    category: ad.category || "service",
  }));
};


export const createServiceAd = async (payload) => {
  const { data } = await axios.post(`${BASE_URL_API}/service-ads/upload-file-json`, payload);
  return data.data;
};

export const updateServiceAd = async (_id, payload) => {
  await axios.put(`${BASE_URL_API}/service-ads/${_id}`, payload);
};

export const deleteServiceAd = async (_id) => {
  await axios.delete(`${BASE_URL_API}/service-ads/${_id}`);
};

// -------- Clinic Ads --------
export const getClinicAds = async () => {
  const res = await axios.get(`${BASE_URL_API}/clinic-ads`);
  const adsArray = res.data.data || []; // ensures it’s always an array
  return adsArray.map(ad => ({
    _id: ad.id || ad._id,
    title: ad.title || "Ad",
    data: ad.url || ad.data,
    type: ad.type || "image",
    filename: ad.url?.split("/").pop() || ad.filename,
    category: ad.category || "clinic",
  }));
};


export const createClinicAd = async (payload) => {
  const { data } = await axios.post(`${BASE_URL_API}/clinic-ads/upload-file-json`, payload);
  return data.data;
};

export const updateClinicAd = async (_id, payload) => {
  await axios.put(`${BASE_URL_API}/clinic-ads/${_id}`, payload);
};

export const deleteClinicAd = async (_id) => {
  await axios.delete(`${BASE_URL_API}/clinic-ads/${_id}`);
};
