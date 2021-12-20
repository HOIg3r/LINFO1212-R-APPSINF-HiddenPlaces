const {Builder, By, Key ,until, Capabilities, Capability} = require('selenium-webdriver');
const script = require('jest');
const {beforeAll} = require('@jest/globals');
const crypto = require('crypto')

const url = 'https://www.google.be/';

let driver;
const capabilities = Capabilities.chrome();
capabilities.set(Capability.ACCEPT_INSECURE_TLS_CERTS, true);

var name = crypto.randomBytes(5).toString("hex")


describe("Test every page on the site", () => {

    beforeAll(async () => {
        driver = new Builder().withCapabilities(capabilities).forBrowser('chrome').build();
    }, 100000)

    afterAll(async () => {
        await driver.quit()
    }, 15000);

    test('"Hiddenplace" and "Home" is on title', async () => {
        await driver.get('https://localhost:8080/index.html')
        let title = await driver.getTitle();
        expect(title).toContain('HiddenPlaces - Home')
    })


    test('"Login" is on title', async () => {
        await driver.get('https://localhost:8080/login.html')
        let title = await driver.getTitle();
        expect(title).toContain('Login')
    })

    test('"Places" is on title', async () => {
        await driver.get('https://localhost:8080/places.html')
        let title = await driver.getTitle();
        expect(title).toContain('Places')
    })

    test('"AddPlaces" is on title', async () => {
        await driver.get('https://localhost:8080/addplaces.html')
        let title = await driver.getTitle();
        //if not connected should return the home page
        expect(title).toContain('Home')
    })

    test('"Myprofile" is on title', async () => {
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

    test('Can connect and go to the page who required connection', async () => {
        await driver.get('https://localhost:8080/login.html')
        await driver.findElement(By.name('login_identifiant')).sendKeys('Admin')
        await driver.findElement(By.name('login_password')).sendKeys('@dmin123',Key.RETURN)
        let title = await driver.getTitle();
        expect(title).toContain('Home')

        //Check MyProfile
        await driver.get('https://localhost:8080/myProfile.html')
        title = await driver.getTitle()
        expect(title).toContain("MyProfile")

        //Check addPlace and add a place
        await driver.get('https://localhost:8080/addPlaces.html')
        title = await driver.getTitle()
        expect(title).toContain("AddPlaces")


        //Check if redirected when go to login page
        await driver.get('https://localhost:8080/login.html')
        title = await driver.getTitle()
        expect(title).toContain("Home")
    })

    test('Can add a place', async () => {
        await driver.get('https://localhost:8080/addPlaces.html')
        await driver.findElement(By.name('name')).sendKeys('Ceci est un test pour ajouter un lieux : titre')
        await driver.findElement(By.name('description')).sendKeys('Ceci est un test pour ajouter un lieux: description')
        await driver.findElement(By.name('submit')).click()

        let title = await driver.getTitle()
        expect(title).toContain('Home')
    })


    test('Can connect and disconnect', async () => {
        //check if redirected to home page
        await driver.get('https://localhost:8080/logout.html')
        let title = await driver.getTitle()
        expect(title).toContain('Home')

        // check if username is 'Anonyme' and not the username
        let username = await driver.findElement(By.css("p")).getText()
        expect(username).toContain('Anonyme')
    })

    //
    test('Can create a account', async () =>{
        await driver.get('https://localhost:8080/login.html')

        // a Random name to not have the same and avec a error

        await driver.findElement(By.name('signup_username')).sendKeys(name)
        await driver.findElement(By.name('signup_email')).sendKeys(name + "@hotmail.com")
        await driver.findElement(By.name('signup_fullname')).sendKeys(name)
        await driver.findElement(By.name('signup_password')).sendKeys(name)
        await driver.findElement(By.name('signup_confirmed_password')).sendKeys(name,Key.RETURN)

        let title = await driver.getTitle()
        expect(title).toContain('Home')
        //chech if username on the navbar
        let username = await driver.findElement(By.css("p")).getText()
        expect(username).toContain(name)

    })

    test('Can change data on the MyProfile Page and delete account',async () =>{
        await driver.get('https://localhost:8080/myProfile.html')

        await driver.findElement(By.name('changeMyData')).click()

        name = crypto.randomBytes(5).toString("hex")

        await driver.findElement(By.name('newUsername')).sendKeys(name)
        await driver.findElement(By.name('newFullname')).sendKeys(name)
        await driver.findElement(By.name('newEmail')).sendKeys(name + "@hotmail.com")
        await driver.findElement(By.name('newPassword')).sendKeys(name)
        await driver.findElement(By.name('confirmNewPassword')).sendKeys(name,Key.RETURN)

        let title = await driver.getTitle()
        expect(title).toContain('Home')
        //chech if username on the navbar
        let username = await driver.findElement(By.css("p")).getText()
        expect(username).toContain(name)

        await driver.get('https://localhost:8080/myProfile.html')

        await driver.findElement(By.name('deleteAccount')).click()

        await driver.findElement(By.name('delete_confirm_email')).sendKeys(name +"@hotmail.com",Key.RETURN)
        await driver.sleep(2000)

        title = await driver.getTitle()
        expect(title).toContain('Home')
        //chech if username on the navbar
        username = await driver.findElement(By.css("p")).getText()
        expect(username).toContain('Anonyme')
    })


})
