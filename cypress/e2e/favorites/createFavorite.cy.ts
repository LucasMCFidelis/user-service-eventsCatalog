describe("Adicionar Favoritos - ", () => {
  let userId: string;
  let token: string;
  let eventId: string;

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

  it("favoritar com sucesso", () => {
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("favoriteId");
    });
  });

  it("favoritar sem informar userId", () => {
    cy.api({
      method: "POST",
      url: `/favorites?&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include("id é obrigatório");
    });
  });

  it("favoritar com userId vazio", () => {
    cy.api({
      method: "POST",
      url: `/favorites?userId=&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id não pode ser vazio"
      );
    });
  });

  it("favoritar com userId invalido", () => {
    cy.api({
      method: "POST",
      url: `/favorites?userId=id_invalido&eventId=${eventId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id deve estar no formato de uuid v4"
      );
    });
  });

  it("favoritar sem informar eventId", () => {
    cy.api({
      method: "POST",
      url: `/favorites?&userId=${userId}`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include("id é obrigatório");
    });
  });

  it("favoritar com eventId vazio", () => {
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id não pode ser vazio"
      );
    });
  });

  it("favoritar com eventId inválido", () => {
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=id_invalido`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id deve estar no formato de uuid v4"
      );
    });
  });

  it("sem token de autorização", () => {
    cy.api({
      method: "POST",
      url: `/favorites?userId=${userId}&eventId=${eventId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
