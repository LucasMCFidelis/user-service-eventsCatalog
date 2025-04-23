describe("Favoritos - Remover", () => {
  let userId;
  let token;
  let eventId;
  let favoriteId;
  const eventServiceUrl = Cypress.env("EVENT_SERVICE_URL");

  before(() => {
    cy.createUser().then(({ res }) => {
      userId = res.body.userId;
      token = res.body.userToken;

      cy.api(`${eventServiceUrl}/events`).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
        expect(res.body.length).to.be.greaterThan(0);
        eventId = res.body[0].eventId;

        cy.api({
          method: "POST",
          url: `/favorites?userId=${userId}&eventId=${eventId}`,
          headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("favoriteId");
          favoriteId = res.body.favoriteId;
        });
      });
    });
  });

  it("favorito existente", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=${userId}&favoriteId=${favoriteId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message.toLowerCase()).to.include(
        "favorito excluído com sucesso"
      );
    });
  });

  it("favorito já removido", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=${userId}&favoriteId=${favoriteId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message.toLowerCase()).to.include(
        "favorito não foi encontrado"
      );
    });
  });

  it("sem token", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=${userId}&favoriteId=${favoriteId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message.toLowerCase()).to.include("token não fornecido");
    });
  });

  it("com userId inválido", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=123&favoriteId=${favoriteId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id deve estar no formato de uuid v4"
      );
    });
  });

  it("com userId vazio", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=&favoriteId=${favoriteId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include("id não pode ser vazio");
    });
  });

  it("com favoriteId inválido", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=${userId}&favoriteId=123`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id deve estar no formato de uuid v4"
      );
    });
  });

  it("com favoriteId vazio", () => {
    cy.api({
      method: "DELETE",
      url: `/favorites?userId=${userId}&favoriteId=`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id não pode ser vazio"
      );
    });
  });
});
