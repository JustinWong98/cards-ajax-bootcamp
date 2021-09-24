module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn('games', 'winner_id', {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  down: async (queryInterface) => {
    try {
      await queryInterface.removeColumn('games', 'winner_id');
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
