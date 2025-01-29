import axios from "axios";
import { handleAxiosError } from "../handlers/handleAxiosError.js";

export async function getEventById(eventFavoriteId: string) {
  try {
    const response = await axios.get(
      `${process.env.EVENT_SERVICE_URL}/${eventFavoriteId}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null; // Retorna null em caso de erro para tratamento posterior
  }
}
