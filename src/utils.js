let fs = require('fs');
let parse = require('json2csv').parse;

const COMMA = ','
const FILE_PATH = 'test.csv';

// Error messages
const FILE_ERROR = 'Error: Error while writing to the csv file';
const RETURN_MSG = 'OK';


let readCSV = (id) => {
    let tokens = [];

    var lines = require('fs').readFileSync(FILE_PATH, 'utf-8')
        .split('\n')
        .filter(Boolean);

    for (let i = 1; i < lines.length; i++) {
        let splitted = lines[i].split(COMMA);

        if (splitted[0] == id)
            tokens.push(splitted.slice(1).join(''));
    }
    console.log(tokens); //TODO

    return tokens;
}

let appendToCSV = (toCsv) => {
    console.log(toCsv);
    let ret = RETURN_MSG

    fs.stat(FILE_PATH, function (err, stat) {

        if (err) {
            let fields = ['id', 'token'];
            let opts = { fields };

            try {
                const csv = parse(toCsv, opts);

                fs.writeFile(FILE_PATH, csv, function (err, stat) {
                    if (err) ret = FILE_ERROR;
                });
            } catch (err) {
                ret = FILE_ERROR;
                console.log(err);
            }
        } else {
            try {
                let csv = parse(toCsv);

                let data = '\n' + csv.split('\n')[1];

                fs.appendFile(FILE_PATH, data, function (err) {
                    if (err) ret = FILE_ERROR;
                });

            } catch (err) {
                ret = FILE_ERROR;
                console.log(err);
            }
        }
    });

    return ret;
}

module.exports.appendToCSV = appendToCSV;
module.exports.readCSV = readCSV;