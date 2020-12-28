const { Builder, By, until, Condition } = require("selenium-webdriver");

until.elementIsNotPresent = (locator, present = false) => {
  until.Con;
  return new Condition(
    "for no element to be located " + locator,
    function (driver) {
      return driver.findElements(locator).then(function (elements) {
        return !present ? elements.length == 0 : elements.length > 0;
      });
    }
  );
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendMessage(driver, number, message) {
  await driver.get(
    `https://web.whatsapp.com/send?phone=${number}&text=${message}`
  );

  await driver.wait(until.elementIsNotPresent(By.id("startup")));
  const selector = By.xpath("//span[@data-icon='send']");
  await sleep(300);
  try {
    const buttonElement = await driver.findElement(selector);
    await buttonElement.click();
    console.log("Mensagem enviada.");
  } catch (e) {
    console.log("Número inválido.");
  }
}

class Queue {
  constructor() {
    this._items = [];
  }

  length() {
    return this._items.length;
  }

  add(item) {
    this._items.push(item);
  }

  next() {
    return this._items.splice(0, 1)[0];
  }
}

class Client {
  constructor() {
    this.driver = null;
    this._connected = false;
    this._messageQueue = new Queue();
  }

  async connect() {
    try {
      this.driver = await new Builder().forBrowser("chrome").build();
      await this.driver.get("https://web.whatsapp.com/");
      await this.driver.wait(
        until.elementIsNotPresent(By.className("landing-title"))
      );
      this._connected = true;
      this.isRunning = false;
    } catch (e) {
      console.error(e);
    }
  }

  sendMessage(number, message) {
    const formattedMessage = message.replace(/\n/g, "%0a");
    const messageObject = {
      number,
      message: formattedMessage,
    };
    this._messageQueue.add(messageObject);
  }

  async messageLoop() {
    this.isRunning = true;
    while (this._connected && this.isRunning) {
      if (this._messageQueue.length() > 0) {
        const messageObj = this._messageQueue.next();
        console.log("Sending message to number:", messageObj.number);
        await sendMessage(this.driver, messageObj.number, messageObj.message);
      }
      await sleep(1000);
    }
  }

  isConnected() {
    return this._connected;
  }
}

module.exports = {
  Client,
};
