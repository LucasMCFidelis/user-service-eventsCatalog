import { userService } from "./userService.js";

async function createFavorite(data: any) {}

async function listFavorites(userId: string) {
  let user
  try {
    user = await userService.getUserById(userId, true)
  } catch (error) {
    console.error("Erro ao buscar usuário e seus eventos favoritados", error);
    throw {
      status: 500,
      message: "Erro interno ao buscar usuário e seus eventos favoritados",
      error: "Erro no servidor",
    };
  }
  
  if (user.eventFavorites.length > 0) {
    return user.eventFavorites
  } else {
    throw {
      status: 404,
      error: "Erro Not Found",
      message: "Não foi encontrado nenhum evento favoritado",
    };
  }
}

async function getFavoriteById(favoriteId: string) {}

async function updateFavorite(favoriteId: string, data: any) {}

async function deleteFavorite(favoriteId: string) {}

export const favoriteService = {
  createFavorite,
  listFavorites,
  getFavoriteById,
  updateFavorite,
  deleteFavorite,
};
