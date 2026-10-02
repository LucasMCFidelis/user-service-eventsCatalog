import axios from "axios";
import { handleAxiosError } from "../handlers/handleAxiosError.js";
import { resolveServiceUrl } from "../resolveServiceUrl.js";

export async function getEventById(eventFavoriteId: string, scenario?: string) {
  try {
    const response = await axios.get(
      `${resolveServiceUrl("EVENT")}/${eventFavoriteId}`,
      scenario ?
        { headers: { "X-Mock-Scenario": scenario } } : {}
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null; // Retorna null em caso de erro para tratamento posterior
  }
}
