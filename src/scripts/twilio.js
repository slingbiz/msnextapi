const Twilio = require('twilio');
const { twilio } = require('../config/config');
const logger = require('../config/logger');
const query = require('../utils/mysql');

const { accountSid, authToken, phoneNumber: from } = twilio;
const client = new Twilio(accountSid, authToken);

const getContactData = async () => {
  const contacts = await query(`SELECT id, name, contactNos FROM uc_dealers`);

  return contacts;
};

const getSentCountForDealer = async (id) => {
  const dealer = await query(`SELECT sent_count FROM uc_dealers WHERE id = ${id}`);

  return dealer[0].sent_count;
};

const updateSentCountForDealer = async (id, count) => {
  await query(`UPDATE uc_dealers SET sent_count = ${count} WHERE id = ${id}`);
};

const start = async (sentCount) => {
  try {
    const contactData = await getContactData();
    logger.info(`Total contacts: ${contactData.length}`);

    const allContacts = [];

    contactData.forEach((item) => {
      const { id, name } = item;
      const contactNos = JSON.parse(item.contactNos);

      contactNos.forEach((number) => {
        let updatedNumber = number;

        // Check if the number is in the form "+(91)-1234567890_mob"
        if (number.match(/^\+\(91\)-\d{10}_\w+$/)) {
          updatedNumber = number.replace(/^\+\(91\)-(\d{10})_\w+$/, '+91$1');
        }

        // Check if the number is only 10 digits and add +91 before it
        if (number.match(/^\d{10}$/)) {
          updatedNumber = `+91${number}`;
        }

        const newItem = { id, name, phone: updatedNumber };
        allContacts.push(newItem);
      });
    });

    logger.info(`Total contacts after parsing: ${allContacts.length}`);

    const messageBody =
      "Hey there [Dealer Name], want to sell your used cars without any hassle? Motorsingh.com is the perfect platform for you - and it's forever free! You can post any number of listings for free. Join our community of trusted dealers today and start listing your inventory. Don't wait any longer, sign up now at https://www.motorsingh.com/sell-my-car/start ! :)";

    allContacts.forEach(async (contact) => {
      const { id, name, phone } = contact;

      // check sent_count value for the current dealer
      const dealerSentCount = await getSentCountForDealer(id);

      if (dealerSentCount < sentCount) {
        const message = messageBody.replace('[Dealer Name]', name);

        client.messages
          .create({ body: message, from, to: phone })
          .then(async (res) => {
            logger.info(`Message sent to ${name} at ${phone}, sID: ${res.sid}`);
            await updateSentCountForDealer(id, dealerSentCount + 1);
          })
          .catch((error) => {
            logger.error(`Error sending message to ${name} at ${phone}`);
            logger.error(error);
          });
      } else {
        logger.info(`Sent count exceeded for dealer ${name}`);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};

start(20);
