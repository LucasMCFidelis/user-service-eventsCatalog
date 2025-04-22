import { faker } from "@faker-js/faker";

const authServiceUrl = Cypress.env("AUTH_SERVICE_URL");

Cypress.Commands.add("createUser", (overrides = {}) => {
  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.middleName() + faker.person.lastName(),
    email: faker.internet.email(),
    phoneNumber: "83999999999",
    password: "{Password@123",
    ...overrides,
  };

  return cy.api("POST", "/users", user).then((res) => {
    expect(res.status).to.eq(201);
    expect(res.body).to.have.property("userId");
    expect(user.email).to.include("@");
    return { user, res };
  });
});

Cypress.Commands.add("loginAsAdmin", () => {
  const adminEmail = Cypress.env("ADMIN_EMAIL");
  const adminPassword = Cypress.env("ADMIN_PASSWORD");

  return cy
    .api({
      method: "POST",
      url: `${authServiceUrl}/login`,
      body: {
        userEmail: adminEmail,
        passwordProvided: adminPassword,
      },
    })
    .then((res) => {
      expect(res.status).to.eq(200);
      Cypress.env("adminToken", res.body.userToken);
    });
});