describe("Buscar Usuário - ", () => {
  let email: string;
  let id: string;

  before(() => {
    cy.createUser().then(({ user, res }) => {
      email = user.email;
      id = res.body.userId;
    });
  });

  it("com id válido", () => {
    cy.api({
      method: "GET",
      url: `/users?userId=${id}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("userId");
      expect(res.body.userId).to.eq(id);
    });
  });

  it("com id inválido", () => {
    cy.api({
      method: "GET",
      url: `/users?userId=id_invalido`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include("o id deve estar no formato de uuid v4");
    });
  });

  it("com email válido", () => {
    cy.api({
      method: "GET",
      url: `/users?userEmail=${email.toLowerCase()}`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("userId");
      expect(res.body.email).to.eq(email);
    });
  });
  
  it("com email não cadastrado", () => {
    cy.api({
      method: "GET",
      url: `/users?userEmail=email.nao.cadastrado0093818736156672@example.com`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message.toLowerCase()).to.include("usuário não encontrado");
    });
  });

  it("com email inválido", () => {
    cy.api({
      method: "GET",
      url: `/users?userEmail=lucas.com`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include("email deve ser um email válido");
    });
  });

  it("sem informar ID ou email", () => {
    cy.api({
      method: "GET",
      url: `/users`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.include(
        "Informe um userId ou userEmail para a busca"
      );
    });
  });
});
