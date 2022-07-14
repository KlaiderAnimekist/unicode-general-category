const GeneralCategory = require('./general-category');
// U+2015 must be Pd
console.log(GeneralCategory.from('\u{2015}').toString());
// U+2016 must be Po
console.log(GeneralCategory.from('\u{2016}').toString());
// U+10175 must be No
console.log(GeneralCategory.from('\u{10175}').toString());
// U+082C must be Mn
console.log(GeneralCategory.from('\u{82C}').toString());