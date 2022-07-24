const GeneralCategory = require('./general-category');
// U+2015 must be Pd
console.log('U+2015 =', GeneralCategory.from('\u{2015}').toString());
// U+2016 must be Po
console.log('U+2016 =', GeneralCategory.from('\u{2016}').toString());
// U+10175 must be No
console.log('U+10175 =', GeneralCategory.from('\u{10175}').toString());
// U+082C must be Mn
console.log('U+082C =', GeneralCategory.from('\u{82C}').toString());
// U+0378 must be Cn
console.log('U+0378 =', GeneralCategory.from('\u{378}').toString());