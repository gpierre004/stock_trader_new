module.exports = (sequelize, DataTypes) => {
  const Account = sequelize.define('Account', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    account_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    account_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    institution: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: 'accounts',
    timestamps: true,
    underscored: true
  });

  Account.associate = function(models) {
    Account.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    
    Account.hasMany(models.Transaction, {
      foreignKey: 'account_id',
      as: 'transactions'
    });
  };

  return Account;
};
