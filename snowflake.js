const FlakeId = require('flakeid');
const generator = new FlakeId({
    mid : 1,
    
    // Since 1 Jan 2019
    timeOffset : 1546300800 * 1000
});

module.exports = generator;