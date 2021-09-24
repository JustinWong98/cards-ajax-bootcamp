import jsSHA from 'jssha';

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
export default function initUsersController(db) {
  const register = async (req, res) => {
    try {
      const findExistingEmail = await db.User.findOne({
        where: {
          email: req.body.email,
        },
      });
      if (findExistingEmail !== null) {
        res.send('emailExists');
      }
      else {
        const hashedPassword = getHash(req.body.password);
        const newUser = await db.User.create({
          email: req.body.email,
          password: hashedPassword,
        });
        res.cookie('loggedIn', hashedPassword);
        res.cookie('id', newUser.id);
        res.send('userCreated');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const login = async (req, res) => {
    try {
      console.log(req.body);
      const hashedPassword = getHash(req.body.password);
      const findExistingUser = await db.User.findOne({
        where: {
          email: req.body.email,
          password: hashedPassword,
        },
      });
      if (findExistingUser === null) {
        res.send('invalidLogin');
      }
      else {
        res.cookie('loggedIn', hashedPassword);
        res.cookie('id', findExistingUser.id);
        res.send('loggedIn');
      }
    }
    catch (error) {
      res.send(error);
    }
  };
  const checkCookies = async (req, res) => {
    try {
      if (req.cookies.loggedIn === undefined) {
        res.send('renderLogin');
      }
      else {
        const cookieQuery = await db.User.findOne({
          where: {
            password: req.cookies.loggedIn,
          },
        });
        if (cookieQuery === null) {
          res.send('renderLogin');
        }
        else {
          res.send('renderGame');
        }
      }
    }
    catch (error) {
      res.send(error);
    }
  };
  return {
    register,
    login,
    checkCookies,
  };
}
