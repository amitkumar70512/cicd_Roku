const colorSet = {
    Reset: "\x1b[0m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m"
};

function colorConsole() {
    const funcNames = ["info", "warn", "error"];
    const colors = [colorSet.Green, colorSet.Yellow, colorSet.Red];

    for (let i=0; i < funcNames.length; i++) {
        let funcName = funcNames[i];
        let color = colors[i];
        let oldFunc = console[funcName];

        console[funcName] = function() {
            let args = Array.prototype.slice.call(arguments);
            if (args.length) args = [color + args[0]].concat(args.slice(1), colorSet.Reset);
            oldFunc.apply(null, args);
        };
    }
};

module.exports = colorConsole;