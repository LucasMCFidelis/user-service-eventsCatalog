import { Favorite } from "@prisma/client";
import { schemaId } from "../schemas/schemaId.js";
import { prisma } from "../utils/db/prisma.js";
import { userService } from "./userService.js";
import axios from "axios";
import { handleAxiosError } from "../utils/handlers/handleAxiosError.js";
import { getEventById } from "../utils/db/getEventById.js";

async function createFavorite(data: Favorite) {
  const { eventFavoriteId, userFavoriteId } = data;

  try {
    const response = await axios.get(
      `${process.env.EVENT_SERVICE_URL}/${eventFavoriteId}`
    );
  } catch (error) {
    handleAxiosError(error);
  }

  let newFavorite;
  try {
    newFavorite = await prisma.favorite.create({
      data: {
        eventFavoriteId,
        userFavoriteId,
      },
    });
  } catch (error) {
    console.error("Erro ao criar favorito", error);
    throw {
      status: 500,
      message: "Erro interno ao criar favorito",
      error: "Erro no servidor",
    };
  }

  return newFavorite;
}

async function listFavorites(userId: string) {
  let user;
  try {
    user = await userService.getUserById(userId, true);
  } catch (error) {
    console.error("Erro ao buscar usuário e seus eventos favoritados", error);
    throw {
      status: 500,
      message: "Erro interno ao buscar usuário e seus eventos favoritados",
      error: "Erro no servidor",
    };
  }

  if (user.eventFavorites.length === 0) {
    throw {
      status: 404,
      error: "Erro Not Found",
      message: "Não foi encontrado nenhum evento favoritado",
    };
  }

  try {
    const events = await Promise.all(
      user.eventFavorites.map((favorite) => getEventById(favorite.eventFavoriteId))
    );

    const filteredEvents = events.filter((event) => event !== null);

    if (filteredEvents.length === 0) {
      throw {
        status: 404,
        error: "Erro Not Found",
        message: "Nenhum dos eventos favoritados pôde ser recuperado",
      };
    }

    return filteredEvents;
  } catch (error) {
    console.error("Erro ao buscar eventos favoritados:", error);
    throw {
      status: 500,
      message: "Erro ao recuperar os eventos favoritados",
      error: "Erro no servidor",
    };
  }
}

async function getFavoriteById(favoriteId: string) {
  await schemaId.validateAsync({ id: favoriteId });

  let favorite;
  try {
    favorite = prisma.favorite.findUnique({ where: { favoriteId } });
  } catch (error) {
    console.error("Erro ao buscar favorito pelo id");
    throw {
      status: 500,
      error: "Erro no servidor",
      message: "Erro interno ao buscar favorito",
    };
  }

  if (!favorite) {
    throw {
      status: 404,
      error: "Erro Not Found",
      message: "Favorito não foi encontrado",
    };
  }

  return favorite;
}

async function updateFavorite(favoriteId: string, data: any) {}

async function deleteFavorite(favoriteId: string) {
  await getFavoriteById(favoriteId)

  try {
    await prisma.favorite.delete({where: {favoriteId}})
  } catch (error) {
    console.error("Erro ao deletar favorito", error);
    throw {
      status: 500,
      message: "Erro interno ao deletar favorito",
      error: "Erro no servidor",
    };
  }
}

export const favoriteService = {
  createFavorite,
  listFavorites,
  getFavoriteById,
  updateFavorite,
  deleteFavorite,
};
