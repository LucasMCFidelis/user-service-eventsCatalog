import axios from "axios";
import { handleAxiosError } from "../handlers/handleAxiosError.js";
import { resolveServiceUrl } from "../resolveServiceUrl.js";

export async function getEventById(eventFavoriteId: string) {
  try {
    const response = await axios.get(
      `${resolveServiceUrl("EVENT")}/events/${eventFavoriteId}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null; // Retorna null em caso de erro para tratamento posterior
  }
}
