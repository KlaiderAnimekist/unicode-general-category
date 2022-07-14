const GeneralCategory = require('./general-category');
// U+2015 must be Pd
console.log(GeneralCategory.from('\u{2015}').toString());
// U+2016 must be Po
console.log(GeneralCategory.from('\u{2016}').toString());