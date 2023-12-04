const { models, Sequelize } = require("../config/sequelize-config");

const addUserController = async (req, res, next) => {
  try {
    const searchUser = await models.users.findAll({
      attributes: ["email", "user_name"],
      where: { email: req.body.email, user_name: req.body.user_name },
    });
    if (searchUser.length == 0) {
      const usersCreate = await models.users.create({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        user_name: req.body.user_name,
        user_password: req.body.user_password,
        phone_no: req.body.phone_no,
      });
      res.json({
        usersCreate,
      });
    } else {
      return next({
        status: 400,
        message: "user already exits, check the email and username",
      });
    }
  } catch (error) {
    return res.send({
      message: error.errors.map((d) => d.message),
    });
  }
};

const loginController = async (req, res, next) => {
  try {
    const searchUser = await models.users.findOne({
      where: { email: req.body.email, user_password: req.body.user_password },
    });
    if (searchUser === null) {
      return next({
        status: 400,
        message: "invalid email and username",
      });
    } else {
      const passwordMatch = await helper.comparePassword(req.body.password, usersFind.password);

      if (passwordMatch) {
          const payload = {
            uuid: searchUser.uuid,
            first_name: searchUser.first_name,
            second_name: searchUser.second_name,
            username: searchUser.username,
          };
          const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
          return res.json({
              token
          });
      }
      return res.status(403).send('Not valid');

    }
  } catch (error) {
    return res.send({
      message: error.errors.map((d) => d.message),
    });
  }
};

const accountViewController = async (req, res, next) => {
  try {
    const searchUser = await models.users.findOne({
      where: { id: req.params.id },
    });
    if (searchUser === null) {
      return next({
        status: 400,
        message: "user not found",
      });
    } else {
      res.json({
        searchUser,
      });
    }
  } catch (error) {
    return res.send({
      message: error.errors.map((d) => d.message),
    });
  }
};

const updateController = async (req, res, next) => {
  try {
    const searchUser = await models.users.findOne({
      where: { id: req.params.id },
    });
    if (searchUser === null) {
      return next({
        status: 400,
        message: "user not found",
      });
    } else {
      const updateUser = await models.users.update(
        {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: req.body.email,
          user_name: req.body.user_name,
          user_password: req.body.user_password,
          phone_no: req.body.phone_no,
        },
        {
          where: {
            id: req.params.id,
          },
          returning: true,
        }
      );

      res.json({
        updateUser,
      });
    }
  } catch (error) {
    return res.send({
      message: error.errors.map((d) => d.message),
    });
  }
};
module.exports = {
  addUserController,
  loginController,
  accountViewController,
  updateController,
};
