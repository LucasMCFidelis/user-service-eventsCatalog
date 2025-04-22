describe("Validação de Credenciais - ", () => {
    let email: string;
    const password = "{Password@123}";
  
    before(() => {
      cy.createUser({ password }).then(({ user }) => {
        email = user.email;
      });
    });
  
    it("com credenciais válidas", () => {
      cy.api("POST", "/users/validate-credentials", {
        userEmail: email,
        passwordProvided: password,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("userId");
      });
    });
  
    it("com email inválido", () => {
      cy.api({
        method: "POST",
        url: "/users/validate-credentials",
        body: {
          userEmail: "lucasemail.com",
          passwordProvided: password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message.toLowerCase()).to.include("email deve ser um email válido");
      });
    });
  
    it("com email não cadastrado", () => {
      cy.api({
        method: "POST",
        url: "/users/validate-credentials",
        body: {
          userEmail: "lucas.fidelis.nao.cadastrado.22897736hwyggss@email.com",
          passwordProvided: password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message.toLowerCase()).to.match(/usuário não cadastrado|nenhum usuário encontrado com este email/i);
      });
    });
  
    it("com senha incorreta", () => {
      cy.api({
        method: "POST",
        url: "/users/validate-credentials",
        body: {
          userEmail: email,
          passwordProvided: "SenhaIncorreta123!",
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message.toLowerCase()).to.include("credenciais inválidas");
      });
    });
  
    it("sem email", () => {
      cy.api({
        method: "POST",
        url: "/users/validate-credentials",
        body: {
          passwordProvided: password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message.toLowerCase()).to.include("email é obrigatório");
      });
    });
  
    it("sem senha", () => {
      cy.api({
        method: "POST",
        url: "/users/validate-credentials",
        body: {
          userEmail: email,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message.toLowerCase()).to.include("senha é obrigatória");
      });
    });
  });
  