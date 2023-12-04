const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const config = require("./config/config");
// const pgClient = require('./pg-config');
const { models, Sequelize } = require("./config/sequelize-config");
const Op = Sequelize.Op;

// create application/json parser
const jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const {
  addUserController,
  loginController,
  accountViewController,
  updateController,
} = require("./controllers/user.controller");
const { notfound } = require("./middlewares/notFound.middleware");
const { errorHandler } = require("./middlewares/errorHandler.middleware");
const { validate } = require("./middlewares/validate.middleware");
const {
  signUpSchema,
  loginSchema,
  updateSchema,
} = require("./validation/authentication.schema");

app.use(jsonParser);
app.use(urlencodedParser);

app.post("/signup", validate(signUpSchema), addUserController);

app.post("/login", validate(loginSchema), loginController);

app.get("/user/:id", accountViewController);

app.patch("/user/:id", validate(updateSchema), updateController);

app.patch("/update-user", async function (req, res) {
  const usersUpdate = await models.users.update(
    {
      name: req.body.name,
    },
    {
      where: {
        uuid: req.body.userid,
      },
      returning: true,
    }
  );

  res.json({
    usersUpdate,
  });
});

app.get("/", async function (req, res) {
  try {
    const usersFind = await models.users.findAndCountAll({
      attributes: ["name"],
      where: {
        name: {
          [Op.iLike]: `%${req.query.name}`,
        },
      },
      logging: true,
      include: [
        {
          model: models.posts,
          as: "posts",
          required: false,
          where: {
            content: {
              [Op.not]: null,
            },
          },
        },
      ],
    });
    return res.json({
      usersFind,
    });
  } catch (error) {
    console.log("\n error...", error);
    return res.send(error);
  }
});

app.delete("/remove", async function (req, res) {
  const pgRes = await pgClient.query(
    "DELETE from users where userid=$1 RETURNING userid",
    [req.query.userid]
  );

  res.json({
    rows: pgRes.rows,
    count: pgRes.rowCount,
  });
});
app.use(notfound);
app.use(errorHandler);
app.listen(config.port, config.host, () => {
  console.log(`Server running at http://${config.host}:${config.port}/`);
});
