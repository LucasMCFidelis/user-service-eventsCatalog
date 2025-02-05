import axios from "axios";

export function handleAxiosError(error: unknown) {
  // Garantia de tipo para `error`
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message || "Erro ao validar token";

    throw {
      status: statusCode,
      message: errorMessage,
      error: "Erro de autenticação",
    };
  }

  // Tratamento genérico para erros desconhecidos
  throw {
    status: 500,
    message: "Erro interno ao validar token",
    error: "Erro no servidor",
  };
}
