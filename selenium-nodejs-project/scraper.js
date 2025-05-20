const { Builder, By} =  require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function Scraper(){
    // задать настройки браузера
    // запускать браузер без "головы"
    const options = new chrome.Options().addArguments('--headless');

    // Инициализация веб-драйвера для работы с браузером
    const driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {
        // Перейти на страницу
        await driver.get('https://www.scrapingcourse.com/infinite-scrolling');

        /*
        // получить HTML код страницы
        const html = await driver.getPageSource();
        console.log(html);
        */

        // цикл для продолжения прокрутки до тех пор, пока не закончится загрузка контента
        let lastHeight = 0;
        while (true) {
            // прокрутить дол конца страницы
            await driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');

            // ожидать 3 секунды
            await driver.sleep(3000);

            // получить текущую высоту страницы
            const currentHeight = await driver.executeScript('return document.body.scrollHeight');

            // прервать цикл, если больше не загружен контент
            if (currentHeight === lastHeight) {
                break;
            }
            lastHeight = currentHeight;
        }

        // родительский элемент-контейнер в котором содержится название и цена товара
        let parentElements = await driver.findElements(By.css('.product-info'));

        // массивы для хранения названия и цены товара
        const namesArray = [];
        const pricesArray = [];

        for (let parentElement of parentElements) {
            // поиск дочерних элементов с содержанием наименования и цены о товарах
            let names = await parentElement.findElement(By.css('.product-name'));
            let prices = await parentElement.findElement(By.css('.product-price'));

            // поместить найденные значения в массивы
            namesArray.push(await names.getText());
            pricesArray.push(await prices.getText());
        }

        console.log(namesArray);
        console.log(pricesArray);

        // строковая переменная, задает имена столбцов для будущего csv файла
        let productsData = "name,price\n";

        // проход по обоим массивам и дополнение строки productsData
        for (let i = 0; i < namesArray.length; i++) {
            productsData += `${namesArray[i]},${pricesArray[i]}\n`;
        }

        // записать в csv файл строку
        fs.writeFile("ProductDetails.csv", productsData, err => {
            if (err) {
                console.error("Error:", err);
            } else {
                console.log("Success!");
            }
        });

    }catch (error){
        // отображать ошибки
        console.error('An error occurred:', error);
    }finally {
        // завершить работу с браузером
        await driver.quit();
    }
}

Scraper();
