const {Builder, By, Key ,until, Capabilities, Capability} = require('selenium-webdriver');
const script = require('jest');
const {beforeAll} = require('@jest/globals');

const url = 'https://www.google.be/';

let driver;
const capabilities = Capabilities.chrome();
capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true);

beforeAll(async () => {
    driver = new Builder().withCapabilities(capabilities).forBrowser('chrome').build();


}, 100000)

afterAll(async () => {
    await driver.quit()
}, 15000);

describe("Test every page on the site", () => {


    test('check ig "google" is on search title', async () => {
        await driver.get('https://www.google.be/')
        let title = await driver.getTitle();
        expect(title).toContain('Google')
    })

    test('check if "Hiddenplace" and "Home" is on title', async () => {
        await driver.get('https://localhost:8080/index.html')
        let title = await driver.getTitle();
        expect(title).toContain('HiddenPlaces - Home')
    })


    test('check if "Login" is on title', async () => {
        await driver.get('https://localhost:8080/login.html')
        let title = await driver.getTitle();
        expect(title).toContain('Login')
    })

    test('check if "Places" is on title', async () => {
        await driver.get('https://localhost:8080/places.html')
        let title = await driver.getTitle();
        expect(title).toContain('Places')
    })

    test('Check if "AddPlaces" is on title', async () => {
        await driver.get('https://localhost:8080/addplaces.html')
        let title = await driver.getTitle();
        //if not connected shoudl return the home page
        expect(title).toContain('Home')
    })

    test('Check if "Myprofile" is on title', async () => {
        await driver.get('https://localhost:8080/myProfile.html')
        let title = await driver.getTitle();
        //If not connected should return the home page
        expect(title).toContain('Home')
    })
})

describe('Test the site when is connected', () => {

    test('check if can connect', async () => {
        await driver.get('https://localhost:8080/login.html')
        await driver.findElement(By.name('login_identifiant')).sendKeys('123')
        await driver.findElement(By.name('login_password')).sendKeys('123',Key.RETURN)
        let title = await driver.getTitle();
        expect(title).toContain('Home')
    })

    //TODO: terminer les tests
})
