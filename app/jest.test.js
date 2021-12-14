const {Builder, By, Key ,until, Capabilities, Capability} = require('selenium-webdriver');
const script = require('jest');
const {beforeAll} = require('@jest/globals');

const url = 'https://www.google.be/';

let driver;
const capabilities = Capabilities.chrome();
capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true);


describe("Test every page on the site", () => {

    beforeAll(async () => {
        driver = new Builder().withCapabilities(capabilities).forBrowser('chrome').build();
    }, 100000)

    afterAll(async () => {
        await driver.quit()
    }, 15000);

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
        //if not connected should return the home page
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

    beforeAll(async () => {
        driver = new Builder().withCapabilities(capabilities).forBrowser('chrome').build();
    }, 100000)

    afterAll(async () => {
        await driver.quit()
    }, 15000);

    test('check if can connect and go to the page who required connection', async () => {
        await driver.get('https://localhost:8080/login.html')
        await driver.findElement(By.name('login_identifiant')).sendKeys('Admin')
        await driver.findElement(By.name('login_password')).sendKeys('@dmin123',Key.RETURN)
        let title = await driver.getTitle();
        expect(title).toContain('Home')

        //Check MyProfile
        await driver.get('https://localhost:8080/myProfile.html')
        title = await driver.getTitle()
        expect(title).toContain("MyProfile")

        //Check addPlaces
        await driver.get('https://localhost:8080/addPlaces.html')
        title = await driver.getTitle()
        expect(title).toContain("AddPlaces")

        //Check if redirected when go to login page
        await driver.get('https://localhost:8080/login.html')
        title = await driver.getTitle()
        expect(title).toContain("Home")
    })

    test('check if can connect and disconnect', async () => {
        //check if redirected to home page
        await driver.get('https://localhost:8080/logout.html')
        let title = await driver.getTitle()
        expect(title).toContain('Home')

        // check if username is 'Anonyme' and not the username
        let username = await driver.findElement(By.css("p")).getText()
        expect(username).toContain('Anonyme')
    })

    test('Check if can add a place', async() => {
        //TODO: finir
        await driver.get('https://localhost:8080/addPlaces.html')
        await driver.findElement(By.name('name')).sendKeys('Ceci est un test pour ajouter un lieux : titre')

        await driver.findElement(By.name('description')).sendKeys('Ceci est un test pour ajouter un lieux: description')
        var element = driver.findElement(By.name('map'))
        const actions = driver.actions({async: true})
        await actions.move({origin:element}).press().perform();
        await actions.move({origin:element}).release().perform();

        element = driver.findElement(By.name('submit'))
        await actions.move({origin:element}).press().perform();
        await actions.move({origin:element}).release().perform();

        let title = driver.getTitle()
        expect(title).toContain('Home')
    })

    //TODO: terminer les tests
})
