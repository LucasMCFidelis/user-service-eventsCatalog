/// <reference types="cypress" />

describe("Cadastro de usuário - ", () => {
  const generateUser = (overrides = {}) => ({
    firstName: "Lucas",
    lastName: "Fidelis",
    email: `lucas${Date.now()}@email.com`,
    phoneNumber: "83999999999",
    password: "{Password@123",
    ...overrides,
  });

  it("com todos os campos válidos", () => {
    const user = generateUser();

    cy.api("POST", "/users", user).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("userId");
      expect(res.body).to.have.property("userToken");

      Cypress.env("userRecentCadastreId", res.body.userId);
      Cypress.env("userRecentCadastreToken", res.body.userToken);
      Cypress.env("userRecentCadastreEmail", user.email);
    });
  });

  it("com email já cadastrado", () => {
    const user = generateUser({ email: "lucasm241301@gmail.com" });

    cy.api({
      method: "POST",
      url: "/users",
      body: user,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(409);
      expect(res.body.message.toLowerCase()).to.include(
        "este e-mail já está cadastrado"
      );
    });
  });

  it("com corpo completamente vazio", () => {
    cy.api({
      method: "POST",
      url: "/users",
      body: {},
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body).to.have.property("message");
    });
  });

  describe("firstName", () => {
    const invalidScenarios = [
      { description: "vazio", value: "", message: "Nome não pode estar vazio" },
      {
        description: "não informado",
        value: undefined,
        message: "Nome é obrigatório",
      },
      {
        description: "menor que o esperado",
        value: "L",
        message: "mínimo 3 caracteres",
      },
      {
        description: "maior que o esperado",
        value: "A".repeat(51),
        message: "máximo 50 caracteres",
      },
      {
        description: "apenas espaços",
        value: "     ",
        message: "mínimo 3 caracteres",
      },
      {
        description: "com caractere inválido",
        value: "Lucas!Mateus",
        message: "apenas caracteres alfabéticos",
      },
      {
        description: "tipo inválido",
        value: 123,
        message: "deve ser uma string",
      },
    ];

    invalidScenarios.forEach(({ description, value, message }) => {
      it(`${description}`, () => {
        const user = generateUser({ firstName: value });

        cy.api({
          method: "POST",
          url: "/users",
          body: user,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message.toLowerCase()).to.include(
            message.toLowerCase()
          );
        });
      });
    });
  });

  describe("lastName", () => {
    const invalidScenarios = [
      {
        description: "vazio",
        value: "",
        message: "Sobrenome não pode estar vazio",
      },
      {
        description: "não informado",
        value: undefined,
        message: "Sobrenome é obrigatório",
      },
      {
        description: "menor que o esperado",
        value: "L",
        message: "mínimo 5 caracteres",
      },
      {
        description: "maior que o esperado",
        value: "A".repeat(51),
        message: "máximo 50 caracteres",
      },
      {
        description: "apenas espaços",
        value: "     ",
        message: "mínimo 5 caracteres",
      },
      {
        description: "com caractere inválido",
        value: "Lucas!Mateus",
        message: "apenas caracteres alfabéticos",
      },
      {
        description: "tipo inválido",
        value: 123,
        message: "deve ser uma string",
      },
    ];

    invalidScenarios.forEach(({ description, value, message }) => {
      it(`${description}`, () => {
        const user = generateUser({ lastName: value });

        cy.api({
          method: "POST",
          url: "/users",
          body: user,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message.toLowerCase()).to.include(
            message.toLowerCase()
          );
        });
      });
    });
  });

  describe("email", () => {
    const invalidScenarios = [
      {
        description: "inválido",
        value: "email.com",
        message: "deve ser um email válido",
      },
      {
        description: "não informado",
        value: undefined,
        message: "Email é obrigatório",
      },
      {
        description: "vazio",
        value: "",
        message: "Email não pode estar vazio",
      },
      {
        description: "maior que o esperado",
        value: `${"a".repeat(100)}@hotmail.com`,
        message: "máximo 100 caracteres",
      },
      {
        description: "apenas espaços",
        value: "       ",
        message: "deve ser um email válido",
      },
    ];

    invalidScenarios.forEach(({ description, value, message }) => {
      it(`${description}`, () => {
        const user = generateUser({ email: value });

        cy.api({
          method: "POST",
          url: "/users",
          body: user,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message.toLowerCase()).to.include(
            message.toLowerCase()
          );
        });
      });
    });
  });

  describe("phoneNumber", () => {
    const invalidScenarios = [
      { description: "vazio", value: "", message: "string vazia" },
      {
        description: "menor que o esperado",
        value: "123",
        message: "conter entre 10 e 15 dígitos",
      },
      {
        description: "maior que o esperado",
        value: "1".repeat(20),
        message: "conter entre 10 e 15 dígitos",
      },
      {
        description: "tipo inválido",
        value: true,
        message: "deve ser uma string",
      },
    ];

    invalidScenarios.forEach(({ description, value, message }) => {
      it(`${description}`, () => {
        const user = generateUser({ phoneNumber: value });

        cy.api({
          method: "POST",
          url: "/users",
          body: user,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message.toLowerCase()).to.include(
            message.toLowerCase()
          );
        });
      });
    });

    it("não informado", () => {
      const user = generateUser({ phoneNumber: undefined });

      cy.api({
        method: "POST",
        url: "/users",
        body: user,
      }).then((res) => {
        expect(res.status).to.eq(201);
      });
    });
  });

  describe("password", () => {
    const invalidScenarios = [
      {
        description: "não informada",
        value: undefined,
        message: "Senha é obrigatória",
      },
      {
        description: "vazia",
        value: "",
        message: "Senha não pode estar vazia",
      },
      {
        description: "muito curta",
        value: "123",
        message:
          "senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)",
      },
      {
        description: "sem letra maiúscula",
        value: "abc12345",
        message:
          "senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)",
      },
      {
        description: "sem letra minúscula",
        value: "ABC12345",
        message:
          "senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)",
      },
      {
        description: "sem número",
        value: "Abcdefgh",
        message:
          "senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)",
      },
      {
        description: "sem caractere especial",
        value: "Abc12345",
        message:
          "senha deve ter pelo menos 8 caracteres, incluir uma letra maiúscula, uma letra minuscula, um número e um caractere especial (!@#$&*)",
      },
    ];

    invalidScenarios.forEach(({ description, value, message }) => {
      it(`${description}`, () => {
        const user = generateUser({ password: value });

        cy.api({
          method: "POST",
          url: "/users",
          body: user,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message.toLowerCase()).to.include(
            message.toLowerCase()
          );
        });
      });
    });
  });
});
