function Graphic(url){
    this.id = 'graphic'+Math.floor(Math.random() * 100);
    this.url = url;
    this.fetchGraphicData();
}

Graphic.prototype = {
    fetchGraphicData: async function() {
        try {
          let response = await this.getGoogleDoc();
          let table = this.parseGoogleDocData(response);

          this.graphic = this.parseTableData(table);
        } catch(error) {
            alert("Error fetching data")
            console.log(error)
        }
    },

    getGoogleDoc: function(){
        let url = this.url;

        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.responseType = "document";
            xhr.open('GET', url);

            xhr.onload = function () {
                if(xhr.status == 200) resolve(xhr.response);

                reject(xhr);
            };
            xhr.onerror = function () {
                reject(xhr);
            };
            xhr.send();
        });
    },

    parseGoogleDocData: function(response){
        return response.body.children.contents.querySelector('.doc-content table');
    },

    sortData: function(data) {
        return data.sort((current, next) => next.y - current.y || current.x - next.x);
    },

    insertAnyMissingData: function(data, max) {
        let tempData = data;
        let result = [];

        for (let i = 0; i < max; i++) {
            if (!data.filter(item => item.x == i).length) {
                if(!!tempData[i]){
                    result.push({x: i, y: tempData[i].y, icon: ' '})
                    tempData = tempData.concat(result);
                }
            }
        }

        return this.sortData(data.concat(result));
    },

    parseTableData: function(table) {
        let tempData = Array.from(table.rows).map((row, index) => {return {x: parseInt(row.cells[0].textContent), y: parseInt(row.cells[2].textContent), icon: row.cells[1].textContent}})

        tempData.shift();

        let sortedTempData = Array.from(this.sortData(tempData));
        let graphicWidth = tempData.reduce((current, next) => next.x > current.x ? next : current).x
        let graphicHeight = tempData.reduce((current, next) => next.y > current.y ? next : current).y
        let newDataRow = [];
        let newData = [];

        for(let i = graphicHeight; i >= 0; i--) {
            newDataRow = sortedTempData.filter(item => item.y == i)
            newDataRow = this.insertAnyMissingData(newDataRow, graphicWidth);
            newData.push(newDataRow)
        }

        return {width: graphicWidth, height: graphicHeight, data: newData};
    },

    printToConsole: function() {
        if(!this.graphic) return setTimeout((graphic) => {
            console.log("Fetching data...")
            graphic.printToConsole()
        }, 250, this);

        let printedGraphic = "\n";

        for (let i = 0; i < this.graphic.data.length; i++) {
            for (let j = 0; j < this.graphic.data[i].length; j++) {
                printedGraphic += this.graphic.data[i][j].icon
            }
            printedGraphic += "\n";
        }

        console.log(printedGraphic)
    },

    setDomNotification: function() {
        let notification = document.getElementById(this.id);
        if(notification != null) return notification.textContent += '.';

        notification = document.createElement('p');
        notification.id = this.id;
        notification.textContent = "Fetching data.";
        document.body.prepend(notification);
    },

    retryPrintToDOM: function(graphic) {
        graphic.setDomNotification();
        graphic.printToDOM()
    },

    printToDOM: function() {
        if(!this.graphic) return setTimeout(this.retryPrintToDOM, 250, this);

        let row, cell, newTable = document.createElement('table');

        for (let i = 0; i < this.graphic.data.length; i++) {
            row = document.createElement('tr');

            for (let j = 0; j < this.graphic.data[i].length; j++) {
                cell = document.createElement('td');
                cell.innerHTML = this.graphic.data[i][j].icon;
                row.appendChild(cell)
            }

            newTable.appendChild(row);
        }

        document.body.children[this.id].after(newTable)
    }
}

let graphic1 = new Graphic("https://docs.google.com/document/u/0/d/e/2PACX-1vRMx5YQlZNa3ra8dYYxmv-QIQ3YJe8tbI3kqcuC7lQiZm-CSEznKfN_HYNSpoXcZIV3Y_O3YoUB1ecq/pub?pli=1");
graphic1.printToConsole()
graphic1.printToDOM()

let graphic2 = new Graphic("https://docs.google.com/document/d/e/2PACX-1vSHesOf9hv2sPOntssYrEdubmMQm8lwjfwv6NPjjmIRYs_FOYXtqrYgjh85jBUebK9swPXh_a5TJ5Kl/pub")
graphic2.printToConsole()
graphic2.printToDOM()