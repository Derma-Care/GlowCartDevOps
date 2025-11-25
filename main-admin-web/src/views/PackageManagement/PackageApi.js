import axios from "axios";
import { BASE_URL_API } from "../../baseUrl";

const PACKAGE_BASE = `${BASE_URL_API}/clinic-admin/packages`;

// ⭐ GET ALL PROCEDURES
export const getAllProcedures = async () => {
  try {
    const res = await axios.get(`${BASE_URL_API}/clinic-admin/procedures`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Get Procedures Error:", error);
    return [];
  }
};

// ⭐ GET ALL PACKAGES
export const PackageAllData = () => {
  return axios.get(`${PACKAGE_BASE}`);
};

// ⭐ GET SINGLE PACKAGE
export const PackageById = (id) => {
  return axios.get(`${PACKAGE_BASE}/${id}`);
};

// ⭐ ADD PACKAGE
export const AddPackage = (data) => {
  return axios.post(`${PACKAGE_BASE}/create`, data);
};

// ⭐ UPDATE PACKAGE
export const UpdatePackage = (id, data) => {
  return axios.put(`${PACKAGE_BASE}/update/${id}`, data);
};

// ⭐ DELETE PACKAGE
export const DeletePackage = (id) => {
  return axios.delete(`${PACKAGE_BASE}/delete/${id}`);
};

// ⭐ GET ALL CLINICS
export const ClinicAllData = () => {
  return axios.get(`${BASE_URL_API}/clinic-admin/clinics`);
};
