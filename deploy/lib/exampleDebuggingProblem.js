
let example = {};



example.init = () => {
    // THIS IS AN INTENTIONAL ERROR
    // "bar" IS NOT DEFINED
    let foo = bar;
};

module.exports = example;