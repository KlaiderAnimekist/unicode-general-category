const GeneralCategory = require('./general-category');
const assert = require('assert');

const samples = [
    {codePoint: 0x2016,  category: 'Po'},
    {codePoint: 0x10175, category: 'No'},
    {codePoint: 0x082C,  category: 'Mn'},
    {codePoint: 0x0378,  category: 'Cn'},
    {codePoint: 0x2010,  category: 'Pd'},
];
for (let s of samples)
    assert(GeneralCategory.from(s.codePoint).toString() == s.category);

console.log('Test successful.');