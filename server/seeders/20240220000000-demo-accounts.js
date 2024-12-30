'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the demo user ID
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'demo@example.com' LIMIT 1;`
    );
    
    if (users.length === 0) {
      throw new Error('Demo user not found');
    }

    const userId = users[0].id;
    const now = new Date();

    const accounts = [
      {
        user_id: userId,
        account_number: 'X96712658',
        account_name: 'Dad',
        institution: 'SCHWAB',
        created_at: now,
        updated_at: now
      },
      {
        user_id: userId,
        account_number: 'Z26842084',
        account_name: 'Gabriel',
        institution: 'SCHWAB',
        created_at: now,
        updated_at: now
      },
      {
        user_id: userId,
        account_number: 'Z07458802',
        account_name: 'Garvin',
        institution: 'SCHWAB',
        created_at: now,
        updated_at: now
      },
      {
        user_id: userId,
        account_number: 'Z27631614',
        account_name: 'Mother Life INS',
        institution: 'SCHWAB',
        created_at: now,
        updated_at: now
      },
      {
        user_id: userId,
        account_number: '9770101804',
        account_name: 'Fidelity Crypto',
        institution: 'Fidelity',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('accounts', accounts, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounts', null, {});
  }
};
