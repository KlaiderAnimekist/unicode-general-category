const fs = require('fs')
    , path = require('path');

const BMP = fs.readFileSync(path.resolve(__dirname, '../../data/output/bmp.bin'))
    , SP  = fs.readFileSync(path.resolve(__dirname, '../../data/output/smp.bin'))

const GeneralCategory = {
    CONTROL_OTHER             : 0x00, // Cc
    FORMAT_OTHER              : 0x01, // Cf
    PRIVATE_USE_OTHER         : 0x02, // Co
    SURROGATE_OTHER           : 0x03, // Cs
    NOT_ASSIGNED_OTHER        : 0x04, // Cn

    LOWERCASE_LETTER          : 0x10,     // Ll
    MODIFIER_LETTER           : 0x10 + 1, // Lm
    OTHER_LETTER              : 0x10 + 2, // Lo
    TITLECASE_LETTER          : 0x10 + 3, // Lt
    UPPERCASE_LETTER          : 0x10 + 4, // Lu

    COMBINING_SPACING_MARK    : 0x20,     // Mc
    ENCLOSING_MARK            : 0x20 + 1, // Me
    NON_SPACING_MARK          : 0x20 + 2, // Mn

    DECIMAL_NUMBER            : 0x40,      // Nd
    LETTER_NUMBER             : 0x40 + 1,  // Nl
    OTHER_NUMBER              : 0x40 + 2,  // No

    CONNECTOR_PUNCTUATION     : 0x40 + 3,  // Pc
    DASH_PUNCTUATION          : 0x40 + 4,  // Pd
    OPEN_PUNCTUATION          : 0x40 + 5,  // Ps
    CLOSE_PUNCTUATION         : 0x40 + 6,  // Pe
    INITIAL_QUOTE_PUNCTUATION : 0x40 + 7,  // Pi
    FINAL_QUOTE_PUNCTUATION   : 0x40 + 8,  // Pf
    OTHER_PUNCTUATION         : 0x40 + 9,  // Po

    CURRENCY_SYMBOL           : 0x40 + 10, // Sc
    MODIFIER_SYMBOL           : 0x40 + 11, // Sk
    MATH_SYMBOL               : 0x40 + 12, // Sm
    OTHER_SYMBOL              : 0x40 + 13, // So

    LINE_SEPARATOR            : 0x40 + 14, // Zl
    PARAGRAPH_SEPARATOR       : 0x40 + 15, // Zp
    SPACE_SEPARATOR           : 0x40 + 16, // Zs
}

GeneralCategory.fromString = function(s)
{
    return this.from(s.codePointAt(0))
}

GeneralCategory.from = function(cp)
{
    if (cp >> 16 !== 0)
        return this.spPlaneAgainst(cp)
    else
    {
        if (!(cp >> 8)) return this.bmpPlaneAgainst(cp, 0, 0);
        if (cp < 0x376 && cp >= 0x100) return this.bmpPlaneAgainst(cp, 180, 0x100);
        if (cp < 0x800 && cp >= 0x376) return this.bmpPlaneAgainst(cp, 1101, 0x376);
        if (cp < 0x1000 && cp >= 0x800) return this.bmpPlaneAgainst(cp, 2130, 0x800);
        if (cp < 0x2016 && cp >= 0x1000) return this.bmpPlaneAgainst(cp, 3483, 0x1000);
        if (cp < 0x3000 && cp >= 0x2016) return this.bmpPlaneAgainst(cp, 5343, 0x2016);
        if (cp < 0x4E00 && cp >= 0x3000) return this.bmpPlaneAgainst(cp, 6651, 0x3000);
        if (cp < 0xA000 && cp >= 0x4E00) return this.bmpPlaneAgainst(cp, 6900, 0x4E00);
        if (cp < 0xAC00 && cp >= 0xA000) return this.bmpPlaneAgainst(cp, 6909, 0xA000);
        if (cp < 0xF900 && cp >= 0xAC00) return this.bmpPlaneAgainst(cp, 8100, 0xAC00);
        return this.bmpPlaneAgainst(cp, 8154, 0xF900);
    }
}

GeneralCategory.isLetter = function(gc)
{
    return gc >> 4 === 1
}

GeneralCategory.bmpPlaneAgainst = function(cp, start, startCp)
{
    let i = start, cat = 0, cp2 = startCp
    while (i != BMP.length) {
        cat = BMP.readUInt8(i++)
        cp2 += BMP.readUInt16LE(i)
        i += 2
        if (cp < cp2) return cat;
    }
    return this.NOT_ASSIGNED_OTHER
}

GeneralCategory.spPlaneAgainst = function(cp)
{
    let i = 0, cat = 0, cp2 = 0x10000
    while (i != SP.length) {
        cat = SP.readUInt8(i++)
        cp2 += this._readUInt24LE(SP, i)
        i += 3
        if (cp < cp2) return cat;
    }
    return this.NOT_ASSIGNED_OTHER
}

GeneralCategory._readUInt24LE = function(ba, i)
{
    return ba.readUInt16LE(i)
        | (ba.readUInt8(i) << 16)
}

module.exports = GeneralCategory