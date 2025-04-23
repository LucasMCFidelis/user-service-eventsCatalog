describe("Listagem Favoritos - ", () => {
  let userId;
  let token;
  let eventId;
  let favoriteId;

  const eventServiceUrl = Cypress.env("EVENT_SERVICE_URL");

  before(() => {
    cy.createUser().then(({ res }) => {
      userId = res.body.userId;
      token = res.body.userToken;
    });

    cy.api(`${eventServiceUrl}/events`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
      eventId = res.body[0].eventId;
    });
  });

  it("usuário sem favoritos", () => {
    cy.api({
      method: "GET",
      url: `/favorites/list?userId=${userId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message).to.include(
        "Não foi encontrado nenhum evento favoritado"
      );
    });
  });

  it("listar favoritos com sucesso", () => {
    // Criando um favorito
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("favoriteId");
    });

    cy.api({
      method: "GET",
      url: `/favorites/list?userId=${userId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
      expect(res.body[0]).to.have.property("favoriteId");
      expect(res.body[0]).to.have.property("event");
    });
  });

  it("buscar favorito com sucesso", () => {
    // Criando um favorito
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("favoriteId");
      favoriteId = res.body.favoriteId;

      cy.api({
        method: "GET",
        url: `/favorites?userId=${userId}&favoriteId=${favoriteId}`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("favoriteId");
        expect(res.body).to.have.property("userFavoriteId");
        expect(res.body).to.have.property("eventFavorite");
      });
    });
  });

  it("buscar favorito com id inválido", () => {
    cy.api({
      method: "GET",
      url: `/favorites?userId=${userId}&favoriteId=id_invalido`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include(
        "id deve estar no formato de uuid v4"
      );
    });
  });

  it("buscar favorito com id vazio", () => {
    cy.api({
      method: "GET",
      url: `/favorites?favoriteId=`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("id é obrigatório");
    });
  });

  it("buscar favorito sem token", () => {
    // Criando um favorito
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("favoriteId");
      favoriteId = res.body.favoriteId;
    });

    cy.api({
      method: "GET",
      url: `/favorites?favoriteId=${favoriteId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body).to.have.property("message");
      expect(res.body.message.toLowerCase()).to.include("token não fornecido");
    });
  });
});
