const GeneralCategory = require('./general-category');

const samples = [
    {codePoint: 0x0100,  category: 'Lu'},
    {codePoint: 0x2016,  category: 'Po'},
    {codePoint: 0x10175, category: 'No'},
    {codePoint: 0x082C,  category: 'Mn'},
    {codePoint: 0x0378,  category: 'Cn'},
    {codePoint: 0x2010,  category: 'Pd'},
];
for (let s of samples)
    assertEqualCategory(s.codePoint, s.category);

function assertEqualCategory(codePoint, category) {
    if (GeneralCategory.from(codePoint).toString() != category)
        throw new Error(`U+${codePoint.toString(16).toUpperCase()} is not of general category ${category}.`);
}
console.log('Test successful.');