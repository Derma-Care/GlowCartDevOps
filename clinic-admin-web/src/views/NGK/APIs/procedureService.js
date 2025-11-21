import axios from "axios";
import { wifiUrl } from "../../../baseUrl";
 

export const getAllProcedures = async () => {
  try {
    const response = await axios.get(`${wifiUrl}/procedures/all`);

    if (response.data?.success) {
      return response.data.data; // returns array of procedures
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching procedures:", error);
    return [];
  }
};
