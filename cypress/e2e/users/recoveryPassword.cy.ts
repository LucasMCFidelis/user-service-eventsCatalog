describe("Recuperação de Senha - ", () => {
  const emailServiceUrl = Cypress.env("EMAIL_SERVICE_URL");
  let email: string;
  let recoveryCode: string;

  before(() => {
    email = "lucasm241301@gmail.com";
    // Envia código de recuperação
    cy.api("POST", `${emailServiceUrl}/send-recovery-code`, { email }).then(
      (res) => {
        recoveryCode = res.body.recoveryCode;
      }
    );
  });

  it("com dados válidos (email, nova senha e código)", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        email,
        newPassword: "{NovaSenha@123}",
        recoveryCode,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message.toLowerCase()).to.include("senha atualizada");
    });
  });

  it("com senhas fracas", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        email,
        newPassword: "123456",
        recoveryCode,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)"
      );
    });
  });

  it("com recovery code inválido", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        email,
        newPassword: "{NovaSenha@123}",
        recoveryCode: "codigoInvalido",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "código de recuperação inválido"
      );
    });
  });

  it("com email não cadastrado", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        email: "lucas.fidelis.nao.cadastrado.20819467@gamil.com",
        newPassword: "{NovaSenha@123}",
        recoveryCode,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.message.toLowerCase()).to.include(
        "usuário não encontrado"
      );
    });
  });

  it("sem informar email", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        newPassword: "{NovaSenha@123}",
        recoveryCode,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include("email é obrigatório");
    });
  });

  it("sem informar recovery code", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        email,
        newPassword: "{NovaSenha@123}",
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "recoverycode é obrigatório"
      );
    });
  });

  it("sem informar nova senha", () => {
    cy.api({
      method: "PATCH",
      url: `/users/recuperacao/atualizar-senha`,
      body: {
        email,
        recoveryCode,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message.toLowerCase()).to.include(
        "senha é obrigatória"
      );
    });
  });
});
