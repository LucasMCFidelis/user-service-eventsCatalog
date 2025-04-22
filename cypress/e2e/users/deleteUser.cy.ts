describe("Deletar Usuário - ", () => {
    let userIdPrimary: string;
    let userTokenPrimary: string;
    let userTokenSecondary: string;
  
    before(() => {
        cy.loginAsAdmin();
      cy.createUser().then(({ res }) => {
        userIdPrimary = res.body.userId;
        userTokenPrimary = res.body.userToken;
      });
      cy.createUser().then(({ res }) => {
        userTokenSecondary = res.body.userToken;
      });
    });
  
    it("com token e ID válidos", () => {
      cy.api({
        method: "DELETE",
        url: `/users?userId=${userIdPrimary}`,
        headers: { Authorization: `Bearer ${userTokenPrimary}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.message.toLowerCase()).to.include("usuário excluído");
      });
    });
  
    it("com ID inexistente", () => {
      cy.api({
        method: "DELETE",
        url: "/users?userId=58187a40-4444-4777-80d3-05f16a44423a",
        headers: { Authorization: `Bearer ${userTokenPrimary}` },
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
        method: "DELETE",
        url: `/users?userId=${userIdPrimary}`,
        headers: { Authorization: `Bearer ${userTokenSecondary}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(403);
        expect(res.body.message.toLowerCase()).to.match(
          /acesso negado|id.*não corresponde/i
        );
      });
    });
  
    it("sem token de autorização", () => {
      cy.api({
        method: "DELETE",
        url: `/users?userId=${userIdPrimary}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message.toLowerCase()).to.include("token não fornecido");
      });
    });
  
    it("com token de admin para deletar usuário existente", () => {
      cy.createUser().then(({ res }) => {
        const userId = res.body.userId;
  
        cy.api({
          method: "DELETE",
          url: `/users?userId=${userId}`,
          headers: { Authorization: `Bearer ${Cypress.env("adminToken")}` },
        }).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message.toLowerCase()).to.include("usuário excluído");
        });
      });
    });
  
    it("com ID inválido (não UUID)", () => {
      cy.api({
        method: "DELETE",
        url: `/users?userId=id_invalido`,
        headers: { Authorization: `Bearer ${userTokenPrimary}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message.toLowerCase()).to.include("id deve estar no formato de uuid v4");
      });
    });
  });
  