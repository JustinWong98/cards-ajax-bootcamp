const jsSHA = require('jssha');

const SALT = 'blah';

const getHash = (input) => {
  // create new SHA object
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });

  // create an unhashed cookie string based on user ID and salt
  const unhashedString = `${input}-${SALT}`;

  // generate a hashed cookie string using SHA object
  shaObj.update(unhashedString);

  return shaObj.getHash('HEX');
};
module.exports = {
  up: async (queryInterface) => {
    const userData = [
      {
        email: 'janedoe@gmail.com',
        password: `${getHash('password1')}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'johndoe@gmail.com',
        password: `${getHash('password2')}`,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    try {
      const result = await queryInterface.bulkInsert('users', userData);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
