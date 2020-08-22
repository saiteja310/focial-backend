const Auth = require("../../api/v1/models/auth");
const Token = require("../../api/v1/models/token");
const User = require("../../api/v1/models/user");
const {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  AUTHORIZATION_HEADER,
  BEARER,
  BASIC,
} = require("../../api/v1/utils/constants").headers;

var data = {
  email: "fayaz5@test.com",
  password: "Pass!w0rd",
};

const baseUrl = "/api/v1/auth";
var verificationToken;
var accessToken, refreshToken;

module.exports = (chai, server) => {
  // because they come with mocha in command line
  /*global before, describe,it*/
  /*eslint no-undef: "error"*/
  /*eslint no-unused-vars: "error"*/

  before(function () {
    this.timeout(5000);
    /* eslint-disable */
    return new Promise((resolve, reject) => {
      Auth.deleteMany().then((data) => {
        Token.deleteMany().then((data) => {
          User.deleteMany().then((data) => {
            return resolve();
          });
        });
      });
    });
  });

  /* eslint-enable */
  describe("Testing Auth API", () => {
    it("should not login as user is not existing", (done) => {
      chai
        .request(server)
        .patch(baseUrl + "/login")
        .set("Content-Type", "application/json")
        .send(data)
        .end((err, response) => {
          response.should.not.have.status(200);
          response.should.not.have.header(ACCESS_TOKEN);
          response.should.not.have.header(REFRESH_TOKEN);
          done();
        });
    });

    it("should register the user", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/register")
        .send(data)
        .end((err, response) => {
          response.should.have.status(201);
          done();
        });
    });

    it("should create a document in User collection", (done) => {
      User.find().then((array) => {
        array.length.should.equal(1);
        array[0].email.should.equal(data.email);
        done();
      });
    });

    it("should not register duplicate users", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/register")
        .send(data)
        .end((err, response) => {
          response.should.not.have.status(201);
          response.should.have.status(409);
          done();
        });
    });

    it("should store the verification token in db ", (done) => {
      // fetching the very first token in tokens collection,
      // because we won't have access to the userId generated by
      // mongodb by default and Tokens collection is empty before this
      Token.find().then((array) => {
        verificationToken = array[0].token;
        done();
      });
    });

    it("should create new verification token in db and send email ", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/token/resend")
        .send(data)
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("old verification should not match new token ", (done) => {
      // fetching the very first token in tokens collection,
      // because we won't have access to the userId generated by
      // mongodb by default and Tokens collection is empty before this
      Token.find().then((array) => {
        array[0].token.should.not.equal(verificationToken);
        verificationToken = array[0].token;
        done();
      });
    });

    it("should verify the user ", (done) => {
      chai
        .request(server)
        .get(baseUrl + "/token/verify?t=" + verificationToken)
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("token should be deleted after verifying", (done) => {
      Token.find().then((array) => {
        array.should.have.length(0);
        done();
      });
    });

    it("should not verify the user multiple times ", (done) => {
      chai
        .request(server)
        .get(baseUrl + "/token/verify?t=" + verificationToken)
        .end((err, response) => {
          response.should.not.have.status(200);
          done();
        });
    });

    it("should log the user in and send tokens to the user ", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/login")
        .send(data)
        .end((err, response) => {
          response.should.have.status(200);
          response.should.have.header(ACCESS_TOKEN);
          response.should.have.header(REFRESH_TOKEN);
          accessToken = response.header[ACCESS_TOKEN];
          refreshToken = response.header[REFRESH_TOKEN];
          done();
        });
    });

    it("should reject password change as passwords are same ", (done) => {
      chai
        .request(server)
        .patch(baseUrl + "/password")
        .send({ oldPassword: data, newPassword: data })
        .end((err, response) => {
          response.should.not.have.status(200);
          done();
        });
    });

    it("should reject password change as password is incorrect ", (done) => {
      chai
        .request(server)
        .patch(baseUrl + "/password")
        .send({ oldPassword: data, newPassword: data + "asd" })
        .end((err, response) => {
          response.should.not.have.status(200);
          done();
        });
    });

    it("should reject password change as token is not passed ", (done) => {
      chai
        .request(server)
        .patch(baseUrl + "/password")
        .send({ oldPassword: data.password, newPassword: data + "a" })
        .end((err, response) => {
          response.should.not.have.status(200);
          done();
        });
    });

    it("should reject password change as BASIC type in auth header", (done) => {
      chai
        .request(server)
        .patch(baseUrl + "/password")
        .set(AUTHORIZATION_HEADER, BASIC + " " + accessToken)
        .send({ oldPassword: data.password, newPassword: data.password + "a" })
        .end((err, response) => {
          response.should.not.have.status(200);
          done();
        });
    });

    it("should change password", (done) => {
      chai
        .request(server)
        .patch(baseUrl + "/password")
        .set(AUTHORIZATION_HEADER, BEARER + " " + accessToken)
        .send({ oldPassword: data.password, newPassword: data.password + "a" })
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("should not login with old password", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/login")
        .set("Content-Type", "application/json")
        .send(data)
        .end((err, response) => {
          response.should.not.have.status(200);
          response.should.not.have.header(ACCESS_TOKEN);
          response.should.not.have.header(REFRESH_TOKEN);
          done();
        });
    });

    it("should login with new password", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/login")
        .set("Content-Type", "application/json")
        .send({ email: data.email, password: data.password + "a" })
        .end((err, response) => {
          response.should.have.status(200);
          response.should.have.header(ACCESS_TOKEN);
          response.should.have.header(REFRESH_TOKEN);
          done();
        });
    });

    it("should send otp to email and store the otp in server", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/password/reset/code")
        .set("Content-Type", "application/json")
        .send({ email: data.email })
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("otp should exist in db", (done) => {
      // old token will be deleted after verifying
      Token.find().then((array) => {
        array[0].token.should.not.equal(verificationToken);
        verificationToken = array[0].token;
        done();
      });
    });

    it("should resend otp to email and overriding the old otp in server", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/password/reset/code/resend")
        .set("Content-Type", "application/json")
        .send({ email: data.email })
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("old otp should not be equal to new otp that exists in db", (done) => {
      // old token will be deleted after verifying
      Token.find().then((array) => {
        array[0].token.should.not.equal(verificationToken);
        verificationToken = array[0].token;
        done();
      });
    });

    it("should reset the password and delete otp in server", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/password/reset")
        .set("Content-Type", "application/json")
        .send({
          email: data.email,
          otp: verificationToken,
          password: data.password,
        })
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("otp should be deleted after resetting password", (done) => {
      Token.find().then((array) => {
        array.should.have.length(0);
        done();
      });
    });

    it("should login with new password after resetting and should have tokens", (done) => {
      chai
        .request(server)
        .post(baseUrl + "/login")
        .set("Content-Type", "application/json")
        // as in previous step, we have resetted the password to old one
        .send(data)
        .end((err, response) => {
          response.should.have.status(200);
          response.should.have.header(ACCESS_TOKEN);
          response.should.have.header(REFRESH_TOKEN);

          accessToken = response.header[ACCESS_TOKEN];
          refreshToken = response.header[REFRESH_TOKEN];
          done();
        });
    });

    it("should not give new access token as type is Bearer", (done) => {
      chai
        .request(server)
        .get(baseUrl + "/token")
        .set("Content-Type", "application/json")
        .set(AUTHORIZATION_HEADER, BEARER + " " + refreshToken)
        .end((err, response) => {
          response.should.not.have.status(200);
          response.should.not.have.header(ACCESS_TOKEN);
          response.should.not.have.header(REFRESH_TOKEN);
          done();
        });
    });

    it("should give new access token and new tokens should not be equal to the old ones", (done) => {
      chai
        .request(server)
        .get(baseUrl + "/token")
        .set("Content-Type", "application/json")
        .set(AUTHORIZATION_HEADER, BASIC + " " + refreshToken)
        .end((err, response) => {
          response.should.have.status(200);
          response.should.have.header(ACCESS_TOKEN);
          response.should.have.header(REFRESH_TOKEN);

          accessToken = response.header[ACCESS_TOKEN];
          done();
        });
    });

    it("should delete the user account", (done) => {
      chai
        .request(server)
        .delete(baseUrl)
        .set("Content-Type", "application/json")
        .set(AUTHORIZATION_HEADER, BEARER + " " + accessToken)
        .end((err, response) => {
          response.should.have.status(200);
          done();
        });
    });

    it("no users should exist in auth collection after deleting", (done) => {
      Auth.find().then((users) => {
        users.should.have.length(0);
        done();
      });
    });

    it("no users should exist in user collection after deleting", (done) => {
      User.find().then((users) => {
        users.should.have.length(0);
        done();
      });
    });
  });
};
