const fs = require('fs')
    , path = require('path');

const BMP = fs.readFileSync(path.resolve(__dirname, '../../data/output/bmp.bin'))
    , SP  = fs.readFileSync(path.resolve(__dirname, '../../data/output/smp.bin'))

const bmpCheckpointsText = fs.readFileSync(path.resolve(__dirname, '../../data/output/bmp-checkpoints.txt'), 'utf-8')
    , bmpCheckpoints = [0, 0]
for (let s of bmpCheckpointsText.split('\n')) {
    let cp = parseInt(s.match(/U\+([0-9a-f]+)/i)[1], 16);
    let i = parseInt(s.match(/addr ([0-9]+)/)[1]);
    bmpCheckpoints.push(cp, i);
}

class GeneralCategory {
    static _byValue = new Map;

    static CONTROL_OTHER             = new GeneralCategory(0x00, 'Cc');
    static FORMAT_OTHER              = new GeneralCategory(0x01, 'Cf');
    static PRIVATE_USE_OTHER         = new GeneralCategory(0x02, 'Co');
    static SURROGATE_OTHER           = new GeneralCategory(0x03, 'Cs');
    static NOT_ASSIGNED_OTHER        = new GeneralCategory(0x04, 'Cn');

    static LOWERCASE_LETTER          = new GeneralCategory(0x10, 'Ll');
    static MODIFIER_LETTER           = new GeneralCategory(0x10 + 1, 'Lm');
    static OTHER_LETTER              = new GeneralCategory(0x10 + 2, 'Lo');
    static TITLECASE_LETTER          = new GeneralCategory(0x10 + 3, 'Lt');
    static UPPERCASE_LETTER          = new GeneralCategory(0x10 + 4, 'Lu');

    static COMBINING_SPACING_MARK    = new GeneralCategory(0x20, 'Mc');
    static ENCLOSING_MARK            = new GeneralCategory(0x20 + 1, 'Me');
    static NON_SPACING_MARK          = new GeneralCategory(0x20 + 2, 'Mn');

    static DECIMAL_NUMBER            = new GeneralCategory(0x40, 'Nd');
    static LETTER_NUMBER             = new GeneralCategory(0x40 + 1, 'Nl');
    static OTHER_NUMBER              = new GeneralCategory(0x40 + 2, 'No');

    static CONNECTOR_PUNCTUATION     = new GeneralCategory(0x40 + 3, 'Pc');
    static DASH_PUNCTUATION          = new GeneralCategory(0x40 + 4, 'Pd');
    static OPEN_PUNCTUATION          = new GeneralCategory(0x40 + 5, 'Ps');
    static CLOSE_PUNCTUATION         = new GeneralCategory(0x40 + 6, 'Pe');
    static INITIAL_QUOTE_PUNCTUATION = new GeneralCategory(0x40 + 7, 'Pi');
    static FINAL_QUOTE_PUNCTUATION   = new GeneralCategory(0x40 + 8, 'Pf');
    static OTHER_PUNCTUATION         = new GeneralCategory(0x40 + 9, 'Po');

    static CURRENCY_SYMBOL           = new GeneralCategory(0x40 + 10, 'Sc');
    static MODIFIER_SYMBOL           = new GeneralCategory(0x40 + 11, 'Sk');
    static MATH_SYMBOL               = new GeneralCategory(0x40 + 12, 'Sm');
    static OTHER_SYMBOL              = new GeneralCategory(0x40 + 13, 'So');

    static LINE_SEPARATOR            = new GeneralCategory(0x40 + 14, 'Zl');
    static PARAGRAPH_SEPARATOR       = new GeneralCategory(0x40 + 15, 'Zp');
    static SPACE_SEPARATOR           = new GeneralCategory(0x40 + 16, 'Zs');

    constructor(value, abbrev) {
        this._value = value;
        this._abbrev = abbrev;
        GeneralCategory._byValue.set(this._value, this);
    }

    static from(cp) {
        if (typeof cp == 'string') cp = cp.codePointAt(0);
        if (cp >> 16 !== 0)
            return GeneralCategory._smpAgainst(cp)
        else {
            return GeneralCategory._bmpAgainst(cp, 0, 0);
            let l = bmpCheckpoints.length - 2;
            for (let i = 0; i < l; i += 2)
                if (cp >= bmpCheckpoints[i] && cp < bmpCheckpoints[i + 2])
                    return GeneralCategory._bmpAgainst(cp, bmpCheckpoints[i + 1], bmpCheckpoints[i]);
            return GeneralCategory._bmpAgainst(cp, bmpCheckpoints[bmpCheckpoints.length - 1], bmpCheckpoints[bmpCheckpoints.length - 2]);
        }
    }

    get isOther() {
        return !(this._value >> 4);
    }

    get isLetter() {
        return this._value >> 4 === 1;
    }

    get isMark() {
        return this._value >> 5 === 1;
    }

    get isNumber() {
        return this.valueOf() >> 6 === 1 && this.valueOf() < GeneralCategory.CONNECTOR_PUNCTUATION.valueOf();
    }

    get isPunctuation() {
        return this.valueOf() >> 6 === 1 && this.valueOf() > GeneralCategory.OTHER_NUMBER.valueOf() && this.valueOf() < GeneralCategory.CURRENCY_SYMBOL.valueOf();
    }

    get isSymbol() {
        return this.valueOf() >> 6 === 1 && this.valueOf() > GeneralCategory.OTHER_PUNCTUATION.valueOf() && this.valueOf() < GeneralCategory.LINE_SEPARATOR.valueOf();
    }

    get isSeparator() {
        return this.valueOf() >> 6 === 1 && this.valueOf() > GeneralCategory.OTHER_SYMBOL.valueOf();
    }

    static _bmpAgainst(cp, start, startCp) {
        let i = start, cat = 0, cp2 = startCp
        while (i != BMP.length) {
            cat = BMP.readUInt8(i++)
            cp2 += BMP.readUInt16LE(i)
            i += 2
            if (cp < cp2) return GeneralCategory._byValue.get(cat);
        }
        return GeneralCategory.NOT_ASSIGNED_OTHER
    }

    static _smpAgainst(cp) {
        let i = 0, cat = 0, cp2 = 0x10000
        while (i != SP.length) {
            cat = SP.readUInt8(i++)
            cp2 += GeneralCategory._readUInt24LE(SP, i)
            i += 3
            if (cp < cp2) return GeneralCategory._byValue.get(cat);
        }
        return GeneralCategory.NOT_ASSIGNED_OTHER
    }

    static _readUInt24LE(ba, i) {
        return ba.readUInt16LE(i)
            | (ba.readUInt8(i + 2) << 16)
    }

    valueOf() {
        return this._value;
    }

    toString() {
        return this._abbrev;
    }
}

module.exports = GeneralCategory