describe("Atualizar Usuário - ", () => {
  let userIdPrimary: string;
  let userTokenPrimary: string;
  let userTokenSecondary: string;

  before(() => {
    cy.createUser().then(({ res }) => {
      userIdPrimary = res.body.userId;
      userTokenPrimary = res.body.userToken;
    });
    cy.createUser().then(({ res }) => {
      userTokenSecondary = res.body.userToken;
    });
    cy.loginAsAdmin();
  });

  it("com dados válidos", () => {
    const updateData = {
      firstName: "NovoNome",
      lastName: "NovoSobrenome",
    };

    cy.api({
      method: "PUT",
      url: `/users?userId=${userIdPrimary}`,
      headers: { Authorization: `Bearer ${userTokenPrimary}` },
      body: updateData,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message.toLowerCase()).to.include("atualizado");
    });
  });

  it("com Id inválido", () => {
    const updateData = {
      firstName: "NovoNome",
      lastName: "NovoSobrenome",
    };

    cy.api({
      method: "PUT",
      url: `/users?userId=id_invalido`,
      headers: { Authorization: `Bearer ${userTokenPrimary}` },
      body: updateData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "id deve estar no formato de uuid v4"
      );
    });
  });

  it("com email já cadastrado", () => {
    const updateData = {
      firstName: "Lucas",
      lastName: "Fidelis",
      email: "lucasm241301@gmail.com",
    };

    cy.api({
      method: "PUT",
      url: `/users?userId=${userIdPrimary}`,
      headers: { Authorization: `Bearer ${userTokenPrimary}` },
      body: updateData,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(409);
      expect(res.body.message.toLowerCase()).to.include(
        "este e-mail já está cadastrado"
      );
    });
  });

  it("sem Token de autorização", () => {
    cy.api({
      method: "PUT",
      url: `/users?userId=${userIdPrimary}`,
      body: { firstName: "Sem Token" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message.toLowerCase()).to.include("token não fornecido");
    });
  });

  it("com ID inexistente", () => {
    cy.api({
      method: "PUT",
      url: `/users?userId=58187a40-4444-4777-80d3-05f16a44423a`,
      headers: { Authorization: `Bearer ${userTokenPrimary}` },
      body: { firstName: "ID Inexistente" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message.toLowerCase()).to.match(
        /acesso negado|usuário não encontrado/i
      );
    });
  });

  it("com ID diferente do usuário logado", () => {
    cy.api({
      method: "PUT",
      url: `/users?userId=${userIdPrimary}`,
      headers: { Authorization: `Bearer ${userTokenSecondary}` },
      body: { firstName: "Usuário não autorizado" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.message.toLowerCase()).to.match(
        /acesso negado|id.*não corresponde/i
      );
    });
  });

  it("com ID do usuário e token de admin", () => {
    cy.api({
      method: "PUT",
      url: `/users?userId=${userIdPrimary}`,
      headers: { Authorization: `Bearer ${Cypress.env("adminToken")}` },
      body: { firstName: "Admin alterou aqui" },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message.toLowerCase()).to.include("usuário atualizado");
    });
  });

  it("com corpo vazio", () => {
    cy.api({
      method: "PUT",
      url: `/users?userId=${userIdPrimary}`,
      headers: { Authorization: `Bearer ${userTokenPrimary}` },
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "pelo menos um campo deve ser preenchido"
      );
    });
  });
});
