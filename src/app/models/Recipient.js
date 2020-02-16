import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        post_code: Sequelize.STRING(8),
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        complement: Sequelize.STRING,
        state: Sequelize.STRING(2),
        city: Sequelize.STRING,
      },
      { sequelize }
    );

    return this;
  }
}

export default Recipient;
