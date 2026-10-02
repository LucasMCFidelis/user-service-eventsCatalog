import { schemaId } from "../schemas/schemaId.js";
import { prisma } from "../utils/db/prisma.js";
import { userService } from "./userService.js";
import { getEventById } from "../utils/db/getEventById.js";

async function createFavorite(userFavoriteId: string, eventFavoriteId: string, scenario?: string) {
  Promise.all([
    await schemaId.validateAsync({ id: userFavoriteId }),
    await schemaId.validateAsync({ id: eventFavoriteId })
  ])

  await getEventById(eventFavoriteId, scenario);

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

async function listFavorites(userId: string, scenario?: string) {
  let user;
  try {
    user = await userService.getUserByIdOrEmail({ userId }, true);
  } catch (error) {
    console.error("Erro ao buscar usuário e seus eventos favoritados", error);
    throw {
      status: 500,
      message: "Erro interno ao buscar usuário e seus eventos favoritados",
      error: "Erro no servidor",
    };
  }

  const { eventFavorites } = user;

  if (!eventFavorites || eventFavorites.length === 0) {
    throw {
      status: 404,
      error: "Erro Not Found",
      message: "Não foi encontrado nenhum evento favoritado",
    };
  }

  try {
    const favoritesWithEvents = await Promise.all(
      eventFavorites.map(async (favorite) => {
        const event = await getEventById(favorite.eventFavoriteId, scenario);
        if (!event) return null;

        return {
          favoriteId: favorite.favoriteId,
          createdAt: favorite.createdAt,
          event,
        };
      })
    );

    const filtered = favoritesWithEvents.filter((fav) => fav !== null);

    if (filtered.length === 0) {
      throw {
        status: 404,
        error: "Erro Not Found",
        message: "Nenhum dos eventos favoritados pôde ser recuperado",
      };
    }

    return filtered;
  } catch (error) {
    console.error("Erro ao buscar eventos favoritados:", error);
    throw {
      status: 500,
      message: "Erro ao recuperar os eventos favoritados",
      error: "Erro no servidor",
    };
  }
}

async function getFavoriteById(favoriteId: string, scenario?: string) {
  await schemaId.validateAsync({ id: favoriteId });

  let favorite;
  try {
    favorite = await prisma.favorite.findUnique({ where: { favoriteId } });
    console.log(favorite);

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

  const eventFavorite = await getEventById(favorite.eventFavoriteId, scenario);

  return {
    favoriteId: favorite.favoriteId,
    userFavoriteId: favorite.userFavoriteId,
    createdAt: favorite.createdAt,
    eventFavorite,
  };
}

async function updateFavorite(favoriteId: string, data: any) { }

async function deleteFavorite(favoriteId: string, scenario?: string) {
  await getFavoriteById(favoriteId, scenario);

  try {
    await prisma.favorite.delete({ where: { favoriteId } });
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
